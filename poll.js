var request = require('pr-request')
var querystring = require('querystring')
// var events = require('events')

var key = Math.random() + ''

var url = 'http://bustracker.gocarta.org/bustime/map/getBusesForRouteAll.jsp'

url += '?' + querystring.stringify({
  key: key
  // ,route: 33,
  // nsd: true // I'm not sure what this param does
})

//console.log(url)

function poll(interval) {

  var PassThrough = require('stream').PassThrough
  var stream = new PassThrough({objectMode: true})

  setInterval(function () {
    request(url).then(function (res) {
      stream.write(res.body)
    })
  }, 6e3)

  return stream
}

module.exports = poll