const os = require('node:os')

const anotherFile = require('./anotherFile')

module.exports = function() {
  console.log("Cores: ", os.cpus().length)
  anotherFile()
}