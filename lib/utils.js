'use strict';

var utils = require('lazy-cache')(require);
var fn = require;
require = utils;

/**
 * Lazily required module dependencies
 */

require('define-property', 'define');
require('extend-shallow', 'extend');
require('for-own', 'own');
require('through2', 'through');

require = fn;

/**
 * Expose `utils` modules
 */

module.exports = utils;
