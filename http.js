var http = require('http')
var Router = require('routes-router')
var sseSerialize = require('event-source-writer').serialize

var fs = require('fs')
var stops = JSON.parse(fs.readFileSync('./node_modules/data-carta-routes/stops.geojson').toString())

const BOM = '\ufeff'

function server(state) {

  var router = new Router

  var serv = http.createServer(function (req, res) {
    
    res.setHeader('access-control-allow-origin','*')
    res.setHeader('access-control-allow-methods', 'GET')

    router(req, res)

    console.log(Date.now(), req.method, req.url, req.headers['user-agent'])
  })


  router.addRoute('/buses', getBuses(state))
  router.addRoute('/buses/tail', tailBuses(state))
  router.addRoute('/stops', getStops)

  router.addRoute('*', defaultRoute)

  return serv
}

function getBuses(state) {
  return function (req, res) {
    res.setHeader('content-type', 'application/json')
    res.end(JSON.stringify(state.parsed))  
  }
}

function tailBuses(state) {
  return function (req, res) {

    req.socket.setNoDelay(true)

    var contentType = req.headers.accept.indexOf('text/event-stream') >= 0
      ? 'text/event-stream'
      : 'text/plain; charset=UTF-8'

    res.writeHead(200, {
      'content-type': contentType,
      'x-content-type-options': 'nosniff'
    })

    // get browsers to Do The Right Thing(tm)
    // see https://code.google.com/p/chromium/issues/detail?id=106150
    res.write(BOM)

    res.write(':connected\n\n')

    state.parsed.features.forEach(function (feature) {
      res.write(sseSerialize('add', feature))
    })

    state.changes.pipe(res)
    console.log(state.changes._readableState.pipesCount + ' tails')
    res.on('close', function () {
      state.changes.unpipe(res)
      console.log(state.changes._readableState.pipesCount + ' tails')
    })
  }
}

function defaultRoute(req, res) {
  res.statusCode = 400
  res.setHeader('content-type', 'text/html')
  res.end('please read the documentation for this api at http://chab.us')
}

function getStops(req, res) {
  res.setHeader('content-type','application/json')
  res.end(JSON.stringify(stops))
}

module.exports = server