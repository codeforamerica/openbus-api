var request = require('pr-request')
var Transform = require('stream').Transform


function fetch(url) {

  var stream = new Transform({objectMode: true})

  // var PassThrough = require('stream').PassThrough
  // var stream = new PassThrough({objectMode: true})

  stream._transform = function (c, e, done) {


    request(url).then(function (res) {
      stream.push(res.body)
      done()
    })    
  }
  
  return stream
}

module.exports = fetch