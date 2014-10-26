var fs = require('fs')

function SequenceFile(filename) {
  this.filename = filename
}

SequenceFile.prototype.update = function (seq, cb) {
  fs.writeFile(this.filename, seq.toString(), cb)
}

SequenceFile.prototype.read = function (cb) {
  var self = this
  fs.readFile(this.filename, 'utf8', function (err, data) {
    if (err) {
      if (err.code === 'ENOENT') {
        return self.update(0, function (err_) {
          if (err_) return cb(err_)
          cb(null, 0)
        })
      }
      return cb(err)
    }
    cb(null, parseInt(data, 10))
  })
}

module.exports = SequenceFile
