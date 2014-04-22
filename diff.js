var Transform = require('stream').Transform
var _ = require('lodash')
var IndexedArray = require('indexed-array')

function DiffStream(state) {
  var diff = new Transform({objectMode: true})

  state.curr = new IndexedArray([], index)
  state.prev = new IndexedArray([], index)

  diff._transform = function (data, enc, cb) {
    state.parsed = data
    state.prev = state.curr
    state.curr = new IndexedArray(data.features, index)


    var prevIds = state.prev.map(to('id'))
    var currIds = state.curr.map(to('id'))

    // look for new buses
    _.difference(currIds, prevIds)
      .forEach(function (id) {
        diff.push({
          event: 'add',
          data: state.curr['#'+id]
        })
      })

    // look for removed buses
    _.difference(prevIds, currIds)
      .forEach(function (id) {
        diff.push({
          event: 'remove',
          data: {id: id}
        })
      })

    // look for changes to existing buses
    _.intersection(currIds, prevIds)
      .forEach(function (id) {
        var curr = state.curr['#'+id]
        var prev = state.prev['#'+id]

        for (var key in curr) {
          if (curr[key] !== prev[key]) {
            diff.push({
              event: 'change',
              data: curr
            })
            break;
          }
        }
      })
    
    cb()
  }
  
  return diff
}

function to(prop) {
  return function (x) { return x[prop] }
}

function index(x) {
  return '#'+x.id
}

module.exports = DiffStream