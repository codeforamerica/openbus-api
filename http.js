var http = require('http')
var sseSerialize = require('event-source-writer').serialize

function server(state) {

  var serv = http.createServer(function (req, res) {
    
    if (req.url == '/buses') {
      return getBuses(req, res, state)
    }

    if (req.url == '/buses/tail') {
      return tailBuses(req, res, state)
    }

    defaultRoute(req, res)

    console.log(Date.now(), req.method, req.url, req.headers['user-agent'])
  })

  return serv
}

function getBuses(req, res, state) {
  res.setHeader('access-control-allow-origin','*')
  res.setHeader('access-control-allow-methods', 'GET')
  res.setHeader('content-type', 'application/json')
  res.end(JSON.stringify(state.parsed))
}

function tailBuses(req, res, state) {

  req.socket.setNoDelay(true)

  var contentType = req.headers.accept.indexOf('text/event-stream') >= 0
    ? 'text/event-stream'
    : 'text/plain'

  res.writeHead(200, {
    'content-type': contentType,
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET'
  })

  res.write(':connected\n\n')

  state.parsed.forEach(function (parsed) {
    res.write(sseSerialize({
      type: 'add',
      bus: parsed
    }))
  })

  state.changes.pipe(res)
  console.log(state.changes._readableState.pipesCount + ' tails')
  res.on('close', function () {
    state.changes.unpipe(res)
    console.log(state.changes._readableState.pipesCount + ' tails')
  })
}

function defaultRoute(req, res) {
  res.statusCode = 400
  res.setHeader('content-type', 'text/html')
  res.end('please read the documentation for this api')
}

module.exports = server