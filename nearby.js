var search = require('./search')
var arrivals = require('./arrivals')

function nearby(coordinates, maxDistance) {
  return search.stops(coordinates, maxDistance)
    .then(function (stops) {
      process.exit
      var stopIds = stops.map(function (x) { return x.id })
      return arrivals(stopIds)
        .then(function (arrivals) {
          return stops.map(function (stop) {
            stop.properties.arrivals = arrivals.filter(function (arrival) {
                return arrival.stop == stop.id
              })
              .map(function (arrival) {
                delete arrival.stop
                return arrival
              })
            return stop
          })
        })
    })
}

module.exports = nearby