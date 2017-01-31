'use strict';

require('mocha');
var assert = require('assert');
var Search = require('../');

describe('search-indexer', function() {
  it('should export a function', function() {
    assert.equal(typeof Search, 'function');
  });

  it('should create a new instance', function() {
    var search = new Search();
    assert(search);
    assert.equal(typeof search, 'object');
    assert.equal(typeof search.indexer, 'function');
    assert.equal(typeof search.collect, 'function');
    assert.equal(typeof search.index, 'function');
  });
});
