var DOMParser = require('xmldom').DOMParser
var fs = require('pr/fs')
var moment = require('moment-timezone')
var slice = function (arr) {
  return Array.prototype.slice.call(arr)
}

// var res = fs.readFileSync('./buses.xml').toString()
// console.log(res)


function parseTime(givenTime) {
  // eg '5:37 PM'
  return moment.tz(givenTime, 'H:mm A', 'America/New_York')
               .valueOf()
}

function parse(xml) {

  var doc = new DOMParser().parseFromString(xml, 'text/xml')

  var parsed = {}

  // parsed.route = doc.documentElement.getAttribute('rt')
  parsed.buses = []
  slice(doc.documentElement.childNodes).forEach(function (child) {
    if (child.nodeType !== 1 /* element */) { return }
    if (child.nodeName === 'time') {
      parsed.time = parseTime(child.textContent)
      return
    }
    if (child.nodeName === 'bus') {
      var bus = {}
      slice(child.childNodes).forEach(function (prop) {
        if (prop.nodeType !== 1 /* element */) { return }
        bus[prop.nodeName] = prop.textContent
      })
      parsed.buses.push(bus)
    }
  })

  return parsed
}

module.exports = parse

var Transform = require('stream').Transform

function stream() {
  var transform = new Transform({objectMode:true})
  transform._transform = function (chunk, encoding, cb) {
    var parsed = parse(chunk)
    console.log('parsed', parsed)
    transform.push(parsed)

    cb()
  }
  return transform
}

module.exports.stream = stream