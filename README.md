King of the Hill
================

Enables a loopback server in a specific port (__49152__ by default) to send and receive data between standalone processes. As in the King of the Hill game, all processes can opt to be the king –thus acting as the server. If the king's socket dies, it will try to takeover the hill again (but, hey, others can try it too).


Installation
============

`npm install koth`


Usage
=====

```javascript
let options = {};
require('koth').play(options);
```


Methods
=======

A game is created using `require('koth').play(options)`. A game has these methods:

- `on(eventName, eventHandler)`: used to register listeners
- `start()`: used to start the game (if it's stopped or `autoStart` is set to false)
- `stop()`: stops the game if already started
- `broadcast(data)`: sends data


Options
=======

| Parameter    | Default           | Description                                                               |
|--------------|-------------------|---------------------------------------------------------------------------|
| `handshake`  | `\u2AF7` (Buffer) | Handshake character (String or Buffer).                                   | 
| `eob`        | `\u0017` (Buffer) | EOB character (String or Buffer).                                         |
| `port`       | `49152`           | KOTH port. Can be a port number or a UNIX Socket Port (where available!). | 
| `maxRetries` | `4`               | Number of retries before giving up.                                       |
| `autoStart`  | `true`            | KOTH game is started instantly!                                           |
| `drainQueue` | `false`           | Resend all messages automatically if connection is lost.                  |
| `encode`     | `null` (Function) | Encode function to be used when sending a message.                        |
| `decode`     | `null` (Function) | Decode function to be used when receiving a message.                      |


                            
Server Events
=============

| Event        | Description                                     |
|--------------|-------------------------------------------------|
| `connection` | KOTH received a new connection.                 |
| `listening`  | KOTH is now listening for incoming connections. |
| `koth_error` | Emitted when an error occurs.                   |
| `koth_close` | Emitted once the server is fully closed.        |



Client Events
==============

| Event     | Description                                                                        |
|-----------|------------------------------------------------------------------------------------|
| `connect` | Emitted when a socket connection is successfully established.                      |
| `error`   | Emitted when an error occurs.                                                      |
| `close`   | Emitted once the socket is fully closed.                                           |
| `data`    | Emitted when data is received, decoded using the `encoder` function (if provided). |



Basic example
=============

```javascript
let koth = require('..');
let options = {
   port: 49152,
   maxRetries: 2
}
let game = koth.play();
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
```

Other Examples
==============
Go check /examples for more!


License
=======

The MIT License (MIT)
Copyright (c) 2016 Manuel de la Higuera

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

