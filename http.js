var http = require('http')
var Router = require('routes-router')
var sseSerialize = require('event-source-writer').serialize
var url = require('url')
var search = require('./search')
var nearby = require('./nearby')

var fs = require('fs')
var stops = JSON.parse(fs.readFileSync('./node_modules/data-carta-routes/stops.geojson').toString())
var stopsIndex = stops.features.reduce(function (a, f) {
  a[f.id] = f
  return a
}, {})

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
  router.addRoute('/buses/:id', getBus(state))
  router.addRoute('/stops', getStops)
  router.addRoute('/stops/near', searchStops)
  router.addRoute('/stops/:id', getStop)
  router.addRoute('/nearby', getNearby)

  router.addRoute('*', defaultRoute)

  return serv
}

function getBuses(state) {
  return function (req, res) {
    res.setHeader('content-type', 'application/json')
    res.end(JSON.stringify(state.parsed))  
  }
}

function getBus(state) {
  return function (req, res, opts) {
    
    var bus = first(state.parsed.features, function (x) { return x.id === opts.id })

    if (!bus) {
      res.statusCode = 404
      res.end('no such bus')
      return
    }

    res.setHeader('content-type', 'application/json')
    res.end(JSON.stringify(bus))
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

function getStop(req, res, opts) {
  var stop = stopsIndex[opts.id]
  if (!stop) {
    res.statusCode = 404
    res.end('no stuch stop')
    return
  }
  
  res.setHeader('content-type','application/json')
  res.end(JSON.stringify(stop))
}

function searchStops(req, res) {
  var params = url.parse(req.url, true).query
  console.log('p', params)
  try {
    var lat = parseFloat(params.lat)
    var lon = parseFloat(params.lon)
  } catch (e) {
    res.statusCode = 400
    res.end('missing required querystring parameters lat and lon (as floats)')
    return
  }
  search.stops([lon, lat], 500)
    .then(function (stops) {
      var response = {
        type: 'FeatureCollection',
        length: stops.length,
        features: stops
      }
      res.setHeader('content-type','application/json')
      res.end(JSON.stringify(response, null, 2))
    })
}

function getNearby(req, res) {
  var params = url.parse(req.url, true).query
  console.log('p', params)
  try {
    var lat = parseFloat(params.lat)
    var lon = parseFloat(params.lon)
  } catch (e) {
    res.statusCode = 400
    res.end('missing required querystring parameters lat and lon (as floats)')
    return
  }
  nearby([lon, lat], 500)
    .then(function (stops) {
      var response = {
        type: 'FeatureCollection',
        length: stops.length,
        features: stops
      }
      res.setHeader('content-type','application/json')
      res.end(JSON.stringify(response, null, 2))
    })
}

function first(arr, fn) {
  for (var i = 0; i < arr.length; i++) {
    if (fn(arr[i])) {
      return arr[i]
    }
  }
}

module.exports = server