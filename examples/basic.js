'use strict'

let koth = require('..');
let options = {
   port: 49152,
   maxRetries: 2
}

let game = koth.play(options);
let hear = function(d) {
  var data = d.toString();
  console.log('Received data: ', data);
}

let shout = function() {
  let ran = Math.random().toString();
  game.broadcast(ran);
  console.log('Sent data: ', ran);
}

// Be heard, shout every second!
game.on('data', hear);
setInterval(shout, 1000);

