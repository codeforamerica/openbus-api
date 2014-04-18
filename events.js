var through = require('stream').PassThrough

var events = new through({objectMode:true})

module.exports = events