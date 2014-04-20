var Transform = require('stream').Transform

function trigger(generator) {
  var stream = new Transform({objectMode: true})

  stream._transform = function (c, e, done) {
    generator(function (e, data) {
      if (!e) {
        stream.push(data)
        done()
      }
    })
  }
  
  return stream
}

module.exports = trigger