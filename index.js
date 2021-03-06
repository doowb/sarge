'use strict';

var path = require('path');
var utils = require('./lib/utils');
var indexer = require('./lib/indexer');

/**
 * Sarge object used to register [indexers](#indexers) and execute the [collect](#collect) and [index](#index)
 * methods on indexers.
 *
 * ```js
 * var sarge = new Sarge();
 * ```
 * @param {Object} `options` Options to control defaults.
 * @param {String} `options.indexer` Set a default indexer to use when one isn't specified in [.collect](#collect) or [.index](#index). Defaults to "default".
 * @param {Object} `options.indexers` Optionally set an object of indexers when creating the new instance.
 * @returns {Object} Instance of Sarge
 * @api public
 */

function Sarge(options) {
  if (!(this instanceof Sarge)) {
    return new Sarge(options);
  }

  utils.define(this, 'options', utils.extend({}, options));
  utils.define(this, 'indexers', {});
  utils.define(this, 'files', {});
  this.indexer('default', indexer());

  if (this.options.indexers) {
    utils.own(this.options.indexers, function(val, key) {
      this.indexer(key, val);
    }, this);
  }
}

/**
 * Get or set an indexer by name. This throws an error if only name is passed and the indexer is not found.
 *
 * ```js
 * // set
 * sarge.indexer('foo', foo);
 * // get
 * var foo = sarge.indexer('foo');
 * ```
 * @param  {String} `name` Name of indexer to get or set.
 * @param  {Object} `indexer` Instance of an indexer. See [indexers](#indexers) for more information.
 * @return {Object} Sarge instance when setting, indexer instance when getting.
 * @api public
 */

Sarge.prototype.indexer = function(name, indexer) {
  if (typeof name !== 'string') {
    throw new TypeError('expected "name" to be a string');
  }

  if (typeof indexer === 'undefined') {
    if (this.indexers[name]) {
      return this.indexers[name];
    }
    throw new Error('Unable to find indexer "' + name + '"');
  }

  this.indexers[name] = indexer;
  return this;
};

/**
 * Creates a through stream that will execute `.collect` method on specified indexer
 * for each file passing through the stream. The `.collect` method passes an object
 * to the callback that will be collected and then indexed when `.index` is called.
 *
 * ```js
 * app.src('*.md')
 *   // use default set on instance or "default" indexer
 *   .pipe(sarge.collect())
 *   // or specify a registred indexer to use
 *   .pipe(sarge.collect({indexer: 'foo'}));
 * ```
 * @param  {Object} `options` Options used to specify the indexer to use.
 * @return {Stream} Through stream that's used to collect files to index.
 * @api public
 */

Sarge.prototype.collect = function(options) {
  var self = this;
  var opts = utils.extend({indexer: 'default'}, this.options, options);
  var indexer = this.indexer(opts.indexer);

  return utils.through.obj(function(file, enc, next) {
    indexer.collect(file, function(err, obj) {
      if (err) return next(err);
      if (obj) {
        self.files[obj.key || file.key] = obj;
      }
      next(null, file);
    });
  });
};

/**
 * Executes the `.index` method on the specified indexer
 * passing the collected files and options along with a callback to indicate when indexing
 * is finished.
 *
 * ```js
 * // use default indexer specified when adding the plugin
 * sarge.index(function(err) {
 *   if (err) return console.error(err);
 *   console.log('indexing finished');
 * });
 *
 * // use registered indexer
 * sarge.index({indexer: 'foo'}, function(err) {
 *   if (err) return console.error(err);
 *   console.log('indexing finished');
 * });
 * ```
 * @param {Object} `options` Options to specify the indexer to use and to pass into the `.index` method.
 * @param {String} `options.indexer` Indexer to use. Defaults to 'default'
 * @param {Boolean} `options.clear` Optionally clear the stored `files` object. This is useful for incremental indexing in a continuous stream.
 * @param {Function} `cb` Callback function passed into the indexer's `.index` method to specify when indexing is finished.
 * @api public
 */

Sarge.prototype.index = function(options, cb) {
  if (typeof options === 'function') {
    cb = options;
    options = {};
  }

  if (typeof cb !== 'function') {
    throw new TypeError('expected "cb" to be a function');
  }

  var opts = utils.extend({indexer: 'default', clear: false}, this.options, options);
  var files = utils.extend({}, this.files);
  if (opts.clear === true) {
    this.files = {};
  }

  var indexer = this.indexer(opts.indexer);
  indexer.index(files, opts, cb);
};

/**
 * Exposes `Sarge`
 */

module.exports = Sarge;
