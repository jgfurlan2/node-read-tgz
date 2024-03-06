const os = require('node:os')

module.exports = function() {
  console.log("Arch: ", os.arch())
}