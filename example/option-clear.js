'use strict';

var path = require('path');
var assemble = require('assemble');
var Sarge = require('../');

var names = {};
var options = {
  clear: true,
  indexers: {
    default: {
      collect: function(file, next) {
        // calculate a unique key for each file.path to show how `sarge.files` is cleared
        var key = file.path;
        names[key] = (names[key] || 0) - 1;
        file.key = path.basename(file.path, path.extname(file.path)) + names[key] + path.extname(file.path);
        next(null, file);
      },
      index: function(files, options, cb) {
        console.log('index', Object.keys(files));
        cb();
      }
    }
  }
};

var app = new assemble();
var sarge = new Sarge(options);
app.src('docs/*.html', {cwd: __dirname})
  // collect is use to initially collect files to index
  .pipe(sarge.collect())
  .on('data', function(){
    // call `sarge.index` to show how `sarge.files` is cleared when `options.clear` is true
    console.log('data 1', Object.keys(sarge.files));
    sarge.index(function(err) {
      if (err) return console.error(err);
      console.log('data 2', Object.keys(sarge.files));
      console.log();
    });
  })
  // collect is used again to "re-collect" files showing that new files may be coming
  // through the stream before the previous `index` call is finished
  .pipe(sarge.collect())
  .on('data', function() {})
  .on('end', function() {
    // final `index` is called to clear out remaining `sarge.files`
    sarge.index(function(err) {
      if (err) {
        console.error(err);
        process.exit(1);
      }
      console.log('end', Object.keys(sarge.files));
      console.log('done');
      process.exit();
    });
  });
