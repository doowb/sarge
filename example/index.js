'use strict';

var assemble = require('assemble');
var Sarge = require('../');

var args = require('yargs-parser')(process.argv.slice(2), {
  alias: {i: 'indexer'},
  default: {i: 'default'}
});

var config = require('./config')(args);
var app = new assemble();
var sarge = new Sarge({indexer: args.i});

sarge.indexer('lunr', require('./indexer-lunr')(config))
sarge.indexer('algolia', require('./indexer-algolia')(config))

app.src('docs/*.html', {cwd: __dirname})
  .pipe(sarge.collect())
  .on('data', function(){})
  .on('end', function() {
    sarge.index(function(err) {
      if (err) {
        console.error(err);
        process.exit(1);
      }
      console.log(sarge.files);
      console.log('done');
      process.exit();
    });
  });
