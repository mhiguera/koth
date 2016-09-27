'use strict'

const koth = require('../');
const msgpack = require('msgpack5')({ forceFloat64: true });
msgpack.register(0x01, Date, 
  function(d) { return d.toISOString() },
  function(s) { return new Date(s) }
);

let options = {
  encode:     msgpack.encode,
  decode:     msgpack.decode,
  handshake:  null,
  port:       './socket'
}

let game = koth.play(options);
let traceEvent = function(ev, detailed) {
  game.on(ev, function(d) {
    if (detailed) console.log(ev, d.toString());
    else console.log('*', ev);
  })
}

// Server events
traceEvent('listening',  0);
traceEvent('connection', 0);
traceEvent('koth_error', 0);
traceEvent('koth_close', 0);

// Socket events
traceEvent('connect',    0);
traceEvent('error',      0);
traceEvent('close',      0);
traceEvent('data',       1);

// Game events
traceEvent('broadcast',  1);
traceEvent('stop',       0);
traceEvent('start',      0);

// Be heard, shout every second!
let ran = Math.round(Math.random() * 1e5).toString();
setInterval(game.broadcast.bind(game, ran), 1000);
