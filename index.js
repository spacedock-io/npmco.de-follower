var fs = require('fs')
var Joke = require('joke')
var follow = require('follow')
var request = require('request')
var SequenceFile = require('seq-file')

var config = JSON.parse(fs.readFileSync(process.argv[2]))

var log = new Joke()
log.pipe(Joke.stringify()).pipe(process.stdout)
log.info('npmco.de-follower starting')

var sequence = new SequenceFile(config.sequenceFile)
var feed

var seq = sequence.readSync()

log.info('following', { registry: config.registry, since: seq })
feed = follow({
  db: config.registry,
  since: seq,
  include_docs: true
})

feed.on('change', function (change) {
  sequence.save(change.seq)

  var doc = change.doc
  // TODO: find out which version was actually published
  var version = doc['dist-tags'] && doc['dist-tags'].latest
  if (!version) return
  log.info('change', {
    id: change.id,
    seq: change.seq,
    name: doc.name,
    version: version
  })

  request({
    url: config.indexer + '/index',
    method: 'POST',
    json: true,
    body: {
      name: doc.name,
      version: version
    }
  }, function (err, res, body) {
    if (err) {
      log.error('error while talking to the indexer', err)
      return
    }

    if (res.statusCode === 201)
      log.info('indexed', { name: doc.name, version: version })
    else
      log.error('error while indexing', { statusCode: res.statusCode, body: body })
  })
})

feed.on('error', function (err) {
  throw err
})
