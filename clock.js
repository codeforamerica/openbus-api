var Readable = require('stream').Readable
var util = require('util')

util.inherits(Clock, Readable)
function Clock(period) {
  Readable.call(this, {objectMode: true})
  var push = this.push.bind(this)
  var tick = function () { push(Date.now()) }
  this._interval = setInterval(tick, period)
  tick()
}

Clock.prototype._read = function () {}

Clock.prototype.end = function () {
  clearInterval(this._interval)
  this.push(null)
}

module.exports = Clock