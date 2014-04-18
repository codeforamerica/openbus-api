var Transform = require('stream').Transform
var stringify = new Transform({objectMode: true})
stringify._transform = function (chunk, enc, cb) {
  stringify.push(JSON.stringify(chunk))
  cb()
}

module.exports = stringify