var EventSourceWriter = require('event-source-writer')
var state = {
  changes: new EventSourceWriter
}

var $port = process.env.PORT || 8081

var Clock = require('./clock')
var fetch = require('./fetch')
var parser = require('./parser')
var diff = require('./diff')
var trigger = require('./trigger')

var http = require('./http')(state)

var url = 'http://bustracker.gocarta.org/bustime/map/getBusesForRouteAll.jsp'

url += '?' + require('querystring').stringify({
  key: Math.random().toString()
})


new Clock(6e3)
  // .pipe(trigger(function fakeData(cb) {
  //   cb(null,
  //     require('fs')
  //       .readFileSync('./buses.xml')
  //       .toString()
  //     )
  // }))
  .pipe(fetch(url))
  .pipe(parser())
  .pipe(diff(state))
  .on('data', function (event) {
    state.changes.dispatchEvent(event)
  })


http.listen($port, function () {
  console.log('listening on ' + $port)
})

//state.changes.pipe(process.stdout)