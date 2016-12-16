const {makeEvent} = require('../main/global.js');
console.log(makeEvent, 'me');
var alarms = {
  onAlarm: makeEvent(),
  create: function() {

  },
  get: function(name, cb) {
    if (cb)
      cb();
  },
  getAll: function(cb) {
    if (cb)
      cb([])
  },
  clear: function(name, cb) {
    if (cb)
      cb(false)
  }
}

Object.assign(exports, alarms);
