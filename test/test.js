'use strict';

require('mocha');
var each = require('async-each');
var assert = require('assert');
var Search = require('../');
var search;

describe('search-indexer', function() {
  beforeEach(function() {
    search = new Search();
  });

  it('should export a function', function() {
    assert.equal(typeof Search, 'function');
  });

  it('should create a new instance', function() {
    assert(search);
    assert.equal(typeof search, 'object');
    assert.equal(typeof search.indexer, 'function');
    assert.equal(typeof search.collect, 'function');
    assert.equal(typeof search.index, 'function');
  });

  it('should register an indexer', function() {
    var foo = {
      collect: function() {},
      index: function() {}
    };

    search.indexer('foo', foo);
    assert.deepEqual(search.indexers.foo, foo);
  });

  it('should get a registered indexer', function() {
    var foo = {
      collect: function() {},
      index: function() {}
    };

    search.indexer('foo', foo);
    assert.deepEqual(search.indexer('foo'), foo);
  });

  it('should throw an error if getting an unregistered indexer', function(cb) {
    try {
      search.indexer('foo');
      cb(new Error('expected an error'));
    } catch (err) {
      assert.equal(err.message, 'Unable to find indexer "foo"');
      cb();
    }
  });

  describe('collect', function() {
    it('should return a stream', function() {
      var stream = search.collect();
      assert(stream, 'expected a stream to be returned');
      assert.equal(typeof stream.on, 'function');
      assert.equal(typeof stream.pipe, 'function');
    });

    it('should collect file objects and add them to the files object', function(cb) {
      var stream = search.collect();
      stream.once('error', cb);
      stream.on('data', function() {});
      stream.on('end', function() {
        assert.deepEqual(search.files, {
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
      search.indexer('foo', foo);
      var stream = search.collect({indexer: 'foo'});
      stream.once('error', cb);
      stream.on('data', function() {});
      stream.on('end', function() {
        search.index({indexer: 'foo'}, cb);
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

      search.indexer('foo', foo);
      search.indexer('bar', bar);

      // use default indexer to collect files
      var stream = search.collect();
      stream.once('error', cb);
      stream.on('data', function() {});
      stream.on('end', function() {
        // use foo and bar indexers to index results
        each(['foo', 'bar'], function(name, next) {
          search.index({indexer: name}, next);
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
  });
});
