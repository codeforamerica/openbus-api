var DOMParser = require('xmldom').DOMParser

var slice = function (arr) {
  return Array.prototype.slice.call(arr)
}

const ELEMENT = 1

const propMap = {
  id: 'id',
  c: 'color',
  dn: 'heading',
  dd: 'direction',
  fs: 'stop',
  lat: 'lat',
  lon: 'lon',
  rt: 'route',
  pd: 'routeDirection'
}

function parse(xml) {

  var doc = new DOMParser().parseFromString(xml, 'text/xml')

  var parsed = []

  slice(doc.documentElement.childNodes).forEach(function (child) {
    if (child.nodeType !== ELEMENT) { return }
    if (child.nodeName === 'bus') {
      var bus = {}
      slice(child.childNodes).forEach(function (prop) {
        if (prop.nodeType !== ELEMENT) { return }
        if (prop.nodeName in propMap) {
          bus[propMap[prop.nodeName]] = prop.textContent
        }
      })
      parsed.push(bus)
    }
  })

  return parsed
}

function toGeoJSON(buses) {
  return FeatureCollection(
    buses.map(function (bus) {
      return Feature(
          Point(bus.lon, bus.lat),
          {
            color: bus.color,
            route: bus.route,
            routeDirection: bus.routeDirection,
            direction: bus.direction,
            heading: bus.heading,
            stop: bus.stop
          },
          bus.id
        )
      })
    )
}

function FeatureCollection(features) {
  return {
    type: 'FeatureCollection',
    features: [].concat(features || [])
  }
}

function Feature(geometry, properties, id) {
  var feature = {
    type: 'Feature',
    geometry: geometry,
    properties: properties || {}
  }
  if (typeof id !== 'undefined') {
    feature.id = id
  }
  return feature
}

function Point(x, y) {
  return {
    type: 'Point',
    coordinates: [parseFloat(x), parseFloat(y)]
  }
}

var Transform = require('stream').Transform

function parser() {
  var transform = new Transform({objectMode:true})
  transform._transform = function (chunk, encoding, cb) {
    var parsed = toGeoJSON(parse(chunk))
    // console.log('parsed', parsed)
    transform.push(parsed)

    cb()
  }
  return transform
}

module.exports = parser
module.exports.parse = parse