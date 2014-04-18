// var events = require('./events')
var sseStream = require('sse-stream')
var through = require('stream').PassThrough


function push(server) {
  var events = new through({objectMode:true})
  events.on('data', console.log.bind(console))

  var stats = {
    clients: {
      current: 0,
      max: 0
    }
  }

  var sse = sseStream('/buses/tail')

  sse.on('connection', function (client) {
    events.pipe(client)
    stats.clients.current++
    if (stats.clients.current > stats.clients.max) {
      stats.clients.max = stats.clients.current
    }
    console.log(stats.clients.current + ' / ' + stats.clients.max)

    client.once('close', function () {
      stats.clients.current--
      events.unpipe(client)
    })
  })

  sse.install(server)

  return events
}

module.exports = push