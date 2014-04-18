var http = require('http')

function server(state) {

  var serv = http.createServer(function (req, res) {
    console.log(req.url)
    if (req.url == '/buses') {
      console.log('yo')
      return getBuses(req, res, state)
    }
    defaultRoute(req, res)
  })

  return serv
}

function getBuses(req, res, state) {
  res.setHeader('content-type', 'application/json')
  res.end(JSON.stringify(state.curr))
}

function defaultRoute(req, res) {
  res.statusCode = 400
  res.setHeader('content-type', 'text/html')
  res.end("<script>new EventSource('http://localhost:8081/buses/tail').addEventListener('message', function (x) { console.log(x);document.write(JSON.stringify(x.data))})</script>")
}

module.exports = server