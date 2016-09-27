'use strict'

const fs = require('fs');
const net = require('net');
const EventEmitter = require('events');
const createPipe = require('eob');

module.exports = {
  play: function(options) {
    options = options || {};
    const noHandshake = null === options.handshake,
          handshake   = noHandshake? null : 
                        options.handshake   || new Buffer('\u2AF7'),
          eob         = options.eob         || new Buffer('\u0017'),
          port        = options.port        || 49152,
          maxRetries  = options.maxRetries  || 4,
          autoStart   = options.autoStart   || true,
          drainQueue  = options.drainQueue  || false,
          encode      = options.encode,
          decode      = options.decode,
          queue       = [],
          emitter     = new EventEmitter();
    
    let server,
        socket,
        clients,
        playing,
        connect,
        takeover,
        koth        = false,
        listening   = false,
        subscribed  = false,
        currRetries = 0;

    function please(fn) {
      if (++currRetries < maxRetries) fn();
    }

    function broadcast(data, filter) {
      let target, message;
      if (!playing) return -1;
      if (!encode && !Buffer.isBuffer(data)) data = Buffer.from(data);
      if (subscribed) target = [socket];
      else if (!listening) return queue.push(data);
      else {
        clients = clients.filter(function(c) { return !c.destroyed })
        target  = clients.filter(function(s) { return s !== filter });
      }
      if (!target.length) return queue.push(data);
      if (encode) message = Buffer.concat([encode(data), eob]);
      else message = Buffer.concat([data, eob]);
      target.forEach(function(s) {
        try { s.write(message) } 
        catch(err) { queue.push(data) }
      });
      if (!filter) emitter.emit('broadcast', data);
      return 0;
    }
    
    connect = function() {
      listening = false;
      if (socket) socket.destroy();
      socket = net.connect(port);
      let messagePipe = createPipe(eob, handshake);
      let pipe = socket.pipe(messagePipe);
      socket.on('connect', function() {
        currRetries = 0;
        subscribed = true;
        emitter.emit('connect');
        if (!drainQueue) return;
        while (queue.length) broadcast(queue.shift());
      })

      socket.on('error', function(err) {
        if (emitter.listenerCount('error')) emitter.emit('error', err);
      })
      
      socket.on('close', function(hadError) {
        emitter.emit('close', hadError);
        subscribed = false;
        please(takeover);
      })

      pipe.on('data', function(raw) {
        if (!raw.length) return;
        emitter.emit('data', decode? decode(raw) : raw);
      })
      pipe.on('finish', socket.destroy.bind(socket));  
    }

    takeover = function() {
      if (socket) socket.destroy();
      koth = true;
      clients = [];
      server = net.createServer();
      server.on('connection', function(skt) {
        let messagePipe = createPipe(eob);
        let pipe = skt.pipe(messagePipe);
        pipe.on('data', function(raw) {
          if (!raw.length) return;
          let data = decode? decode(raw) : raw;
          broadcast(data, skt);
          emitter.emit('data', data);
        })
        pipe.on('finish', skt.destroy.bind(skt));  
        clients.push(skt);
        emitter.emit('connection');
        if (handshake) skt.write(handshake);
      })
      
      server.on('listening', function() {
        clients = [];
        listening = true;
        emitter.emit('listening');
      })
        
      server.on('error', function(err) {
        emitter.emit('koth_error', err);
        if (err.code == 'EADDRINUSE') return please(connect);
      })

      server.on('close', function(err) {
        listening = false;
        emitter.emit('koth_close', err);
      })

      if (isNaN(port)) {
        try { fs.unlinkSync(port) }
        catch(err) { /**/ }
      }
      server.listen(port);
    }

    
    function start() {
      playing = true;
      connect();
      emitter.emit('start');
    }

    function stop() {
      playing = false;
      if (listening) server.close();
      else if (subscribed) socket.destroy();
      emitter.emit('stop');
    }

    var exports = {};
    exports.on         = emitter.on.bind(emitter);
    exports.broadcast  = broadcast;
    exports.start      = start;
    exports.stop       = stop;
    if (autoStart) start();
    return exports;
  }
}
