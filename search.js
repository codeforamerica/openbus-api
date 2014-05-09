var GeoStore = require('terraformer-geostore').GeoStore
var RTree = require('terraformer-rtree').RTree
var MemStore = require('terraformer-geostore-memory').Memory
var fs = require('fs')
var T = require('terraformer')
var geodist = require('geodist')
var _ = require('lodash')

require('polyfill-promise')

var stops = JSON.parse(fs.readFileSync('./node_modules/data-carta-routes/stops.geojson').toString())

var store = new GeoStore({
  store: new MemStore,
  index: new RTree
})

store.add(stops, function (err, res) {})

function searchStops(origin, maxDistance) {
  return new Promise(function (resolve, reject) {

    store.within(new T.Circle(origin, maxDistance, 32).convexHull(), function (err, res) {
      if (err) {
        return reject(err)
      }

      res.forEach(function (result) {
        result.distance = geodist(origin, result.geometry.coordinates, {unit: 'feet'})
      })

      res = _.sortBy(res, 'distance')
      resolve(res)
    })

  })
}

module.exports.stops = searchStops