var state = {}

var poll = require('./poll')
var parse = require('./parser')
var diff = require('./diff')
var push = require('./push')

var httpServer = require('./static')(state)
var stringify = require('./stringify')



poll(6e3)
  .pipe(parse.stream())
  .pipe(diff(state))
  .pipe(stringify)
  .pipe(push(httpServer))

httpServer.listen(8081)
