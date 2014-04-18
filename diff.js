var Transform = require('stream').Transform
module.exports = function (state) {
  var diff = new Transform({objectMode: true})


  state.curr = {}
  state.prev = {}

  diff._transform = function (chunk, enc, cb) {
    state.prev = state.curr
    state.curr = chunk
    diff.push(chunk)
    cb()
  }
  
  return diff
}