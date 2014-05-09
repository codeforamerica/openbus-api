var DOMParser = require('xmldom').DOMParser
var request = require('pr-request')
require('polyfill-promise')
var memoize = require('memoizee')

function times(stop) {
  return request('http://bustracker.gocarta.org/bustime/eta/getStopPredictionsETA.jsp?route=all&stop='+stop+'&key=0.37306588678620756')
  .then(function (res) {
    return res.body
  })
  .then(function (xml) {
    return new DOMParser().parseFromString(xml, 'text/xml')
  })
  .then(function (document) {
    return [].slice.call(document.documentElement.childNodes)
      .filter(function (n) { return n.nodeType === 1 && n.nodeName === 'pre' })
      .map(function (n) {
        var arrival = {
          stop: stop.toString(),
        }

        return [].slice.call(n.childNodes)
          .filter(function (n) { return n.nodeType === 1})
          .reduce(function (arrival, prop) {
            switch (prop.nodeName) {
              case 'pt':
                arrival.minutesAway = parseInt(prop.textContent) || 0
                break
              case 'fd':
                arrival.destination = prop.textContent.trim()
                break
              case 'rn':
                arrival.route = prop.textContent.trim()
              case 'v':
                arrival.vehicle = prop.textContent.trim()
            }
            return arrival
          }, arrival)
      })
  })


}



var MINUTE = 60e3
var timesCached = memoize(times, {maxAge: MINUTE})

function getArrivalsForStops(stops) {
  return Promise.all(stops.map(timesCached))
    .then(flatten)
}

function flatten(arr) {
  return arr.reduce(function (p, n) {
    return p.concat(n)
  }, [])
}

module.exports = getArrivalsForStops