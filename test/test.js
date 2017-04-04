'use strict';

require('mocha');
var each = require('async-each');
var assert = require('assert');
var Sarge = require('../');
var sarge;

describe('sarge', function() {
  beforeEach(function() {
    sarge = new Sarge();
  });

  it('should export a function', function() {
    assert.equal(typeof Sarge, 'function');
  });

  it('should create a new instance', function() {
    assert(sarge);
    assert.equal(typeof sarge, 'object');
    assert.equal(typeof sarge.indexer, 'function');
    assert.equal(typeof sarge.collect, 'function');
    assert.equal(typeof sarge.index, 'function');
  });

  it('should register an indexer', function() {
    var foo = {
      collect: function() {},
      index: function() {}
    };

    sarge.indexer('foo', foo);
    assert.deepEqual(sarge.indexers.foo, foo);
  });

  it('should get a registered indexer', function() {
    var foo = {
      collect: function() {},
      index: function() {}
    };

    sarge.indexer('foo', foo);
    assert.deepEqual(sarge.indexer('foo'), foo);
  });

  it('should throw an error if getting an unregistered indexer', function(cb) {
    try {
      sarge.indexer('foo');
      cb(new Error('expected an error'));
    } catch (err) {
      assert.equal(err.message, 'Unable to find indexer "foo"');
      cb();
    }
  });

  describe('collect', function() {
    it('should return a stream', function() {
      var stream = sarge.collect();
      assert(stream, 'expected a stream to be returned');
      assert.equal(typeof stream.on, 'function');
      assert.equal(typeof stream.pipe, 'function');
    });

    it('should collect file objects and add them to the files object', function(cb) {
      var stream = sarge.collect();
      stream.once('error', cb);
      stream.on('data', function() {});
      stream.on('end', function() {
        assert.deepEqual(sarge.files, {
          foo: {key: 'foo'},
          bar: {key: 'bar'},
          baz: {key: 'baz'}
        });
        cb();
      });

      stream.write({key: 'foo'});
      stream.write({key: 'bar'});
      stream.write({key: 'baz'});
      stream.end();
    });
  });

  describe('index', function() {
    it('should index files with the index method on the indexer', function(cb) {
      var foo = {
        collect: function(file, next) {
          next(null, file);
        },
        index: function(files, options, next) {
          assert.deepEqual(files, {
            foo: {key: 'foo'},
            bar: {key: 'bar'},
            baz: {key: 'baz'}
          });
          next();
        }
      };
      sarge.indexer('foo', foo);
      var stream = sarge.collect({indexer: 'foo'});
      stream.once('error', cb);
      stream.on('data', function() {});
      stream.on('end', function() {
        sarge.index({indexer: 'foo'}, cb);
      });

      stream.write({key: 'foo'});
      stream.write({key: 'bar'});
      stream.write({key: 'baz'});
      stream.end();
    });

    it('should allow using multiple indexers', function(cb) {
      var count = 0;
      var foo = {
        index: function(files, options, next) {
          count++;
          assert.deepEqual(files, {
            foo: {key: 'foo'},
            bar: {key: 'bar'},
            baz: {key: 'baz'}
          });
          next();
        }
      };

      var bar = {
        index: function(files, options, next) {
          count++;
          assert.deepEqual(files, {
            foo: {key: 'foo'},
            bar: {key: 'bar'},
            baz: {key: 'baz'}
          });
          next();
        }
      };

      sarge.indexer('foo', foo);
      sarge.indexer('bar', bar);

      // use default indexer to collect files
      var stream = sarge.collect();
      stream.once('error', cb);
      stream.on('data', function() {});
      stream.on('end', function() {
        // use foo and bar indexers to index results
        each(['foo', 'bar'], function(name, next) {
          sarge.index({indexer: name}, next);
        }, function(err) {
          if (err) return cb(err);
          assert.equal(count, 2);
          cb();
        });
      });

      stream.write({key: 'foo'});
      stream.write({key: 'bar'});
      stream.write({key: 'baz'});
      stream.end();
    });

    it('should clear files after calling index', function(cb) {
      var foo = {
        collect: function(file, next) {
          next(null, file);
        },
        index: function(files, options, next) {
          assert.deepEqual(files, {
            foo: {key: 'foo'},
            bar: {key: 'bar'},
            baz: {key: 'baz'}
          });
          next();
        }
      };
      sarge.indexer('foo', foo);
      var stream = sarge.collect({indexer: 'foo'});
      stream.once('error', cb);
      stream.on('data', function() {});
      stream.on('end', function() {
        sarge.index({indexer: 'foo', clear: true}, function(err) {
          if (err) return cb();
          assert.deepEqual(sarge.files, {});
          cb();
        });
      });

      stream.write({key: 'foo'});
      stream.write({key: 'bar'});
      stream.write({key: 'baz'});
      stream.end();
    });
  });
});
