'use strict'

const koth = require('../');
let connection, options;
let dummy, version;

function sync() {
  let p = {};
  let hrtime = process.hrtime();
  p.value  = dummy;
  p.hrtime = hrtime[0] * 1e9 + hrtime[1];
  version  = p.hrtime;
  connection.broadcast(JSON.stringify(p));
}

function updateHandler(data) {
  let p = JSON.parse(data);
  if (!version || p.hrtime > version) {
    dummy = p.value;
    version  = p.hrtime;
  }
}

function getVariable() {
  var value = dummy;
  console.log('Getting dummy value', value);
}

function setVariable() {
  var value = Math.random();
  console.log('Setting dummy value', value);
  dummy = value;
  sync();
}

connection = koth.play(options);
connection.on('data', updateHandler);
setInterval(setVariable, Math.random()*500 + 2000);
setInterval(getVariable, Math.random()*300);
