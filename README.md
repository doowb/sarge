# sarge [![NPM version](https://img.shields.io/npm/v/sarge.svg?style=flat)](https://www.npmjs.com/package/sarge) [![NPM monthly downloads](https://img.shields.io/npm/dm/sarge.svg?style=flat)](https://npmjs.org/package/sarge)  [![NPM total downloads](https://img.shields.io/npm/dt/sarge.svg?style=flat)](https://npmjs.org/package/sarge) [![Linux Build Status](https://img.shields.io/travis/doowb/sarge.svg?style=flat&label=Travis)](https://travis-ci.org/doowb/sarge)

> Register and use custom search indexers to create, update and use search indices.

## Install

Install with [npm](https://www.npmjs.com/):

```sh
$ npm install --save sarge
```

## Usage

```js
var Search = require('sarge');
```

## API

### [Sarge](index.js#L21)

Sarge object used to register [indexers](#indexers) and execute the [collect](#collect) and [index](#index) methods on indexers.

**Params**

* `options` **{Object}**: Options to control defaults.
* `options.indexer` **{String}**: Set a default indexer to use when one isn't specified in [.collect](#collect) or [.index](#index). Defaults to "default".
* `options.indexers` **{Object}**: Optionally set an object of indexers when creating the new instance.
* `returns` **{Object}**: Instance of Sarge

**Example**

```js
var sarge = new Sarge();
```

### [.indexer](index.js#L53)

Get or set an indexer by name. This throws an error if only name is passed and the indexer is not found.

**Params**

* `name` **{String}**: Name of indexer to get or set.
* `indexer` **{Object}**: Instance of an indexer. See [indexers](#indexers) for more information.
* `returns` **{Object}**: Sarge instance when setting, indexer instance when getting.

**Example**

```js
// set
sarge.indexer('foo', foo);
// get
var foo = sarge.indexer('foo');
```

### [.collect](index.js#L86)

Creates a through stream that will execute `.collect` method on specified indexer for each file passing through the stream. The `.collect` method passes an object to the callback that will be collected and then indexed when `.index` is called.

**Params**

* `options` **{Object}**: Options used to specify the indexer to use.
* `returns` **{Stream}**: Through stream that's used to collect files to index.

**Example**

```js
app.src('*.md')
  // use default set on instance or "default" indexer
  .pipe(sarge.collect())
  // or specify a registred indexer to use
  .pipe(sarge.collect({indexer: 'foo'}));
```

### [.index](index.js#L127)

Executes the `.index` method on the specified indexer passing the collected files and options along with a callback to indicate when indexing is finished.

**Params**

* `options` **{Object}**: Options to specify the indexer to use and to pass into the `.index` method.
* `options.indexer` **{String}**: Indexer to use. Defaults to 'default'
* `options.clear` **{Boolean}**: Optionally clear the stored `files` object. This is useful for incremental indexing in a continuous stream.
* `cb` **{Function}**: Callback function passed into the indexer's `.index` method to specify when indexing is finished.

**Example**

```js
// use default indexer specified when adding the plugin
sarge.index(function(err) {
  if (err) return console.error(err);
  console.log('indexing finished');
});

// use registered indexer
sarge.index({indexer: 'foo'}, function(err) {
  if (err) return console.error(err);
  console.log('indexing finished');
});
```

### Indexers

Indexers are objects that have `collect` and `index` methods that will be executed when [collect](#collect) or [index](#index) are called on [search](#search).

The indexer objects may be plain objects or instances created with those methods. See the [examples](examples) to see what indexers may look like.

Simple object to be used in examples below.

```js
var indexer = {};
```

#### .collect

The collect method on an indexer will be passed a `file` object and a `next` callback. The collect method
should create an object to pass back to `next` that will be added to the `.files` collection on the `search` instance.

If `file` is a view from [assemble](https://github.com/assemble/assemble), we can collect information about the file that we want to index:

```js
indexer.collect = function(file, next) {
  var obj = {
    key: file.key,
    title: file.data.title,
    category: file.data.category,
    url: file.data.url,
    body: file.content
  };
  // return the object
  next(null, obj);
};
```

#### .index

The index method on an indexer will be passed a `files` object containing all fo the collected files, an `options` object which is the same as the `options` passed into the [search.index](#index) method, and a callback function to call when indexing is complete. The callback function is the same as the one passed into the [search.index](#index) method so users may choose to return additional information if necessary.

```js
indexer.index = function(files, options, cb) {
  for (var key in files) {
    if (files.hasOwnProperty(key)) {
      console.log(key);
      console.log(files[key]);
      console.log();
    }
  }
  cb();
};
```

## About

### Related projects

* [base-search](https://www.npmjs.com/package/base-search): Base plugin that adds methods for creating, updating and using search indices. | [homepage](https://github.com/node-base/base-search "Base plugin that adds methods for creating, updating and using search indices.")
* [search-indexer-algolia](https://www.npmjs.com/package/search-indexer-algolia): base-search indexer to enable collecting and adding records to an algolia search index | [homepage](https://github.com/doowb/search-indexer-algolia "base-search indexer to enable collecting and adding records to an algolia search index")

### Contributing

Pull requests and stars are always welcome. For bugs and feature requests, [please create an issue](../../issues/new).

Please read the [contributing guide](.github/contributing.md) for advice on opening issues, pull requests, and coding standards.

### Building docs

_(This project's readme.md is generated by [verb](https://github.com/verbose/verb-generate-readme), please don't edit the readme directly. Any changes to the readme must be made in the [.verb.md](.verb.md) readme template.)_

To generate the readme, run the following command:

```sh
$ npm install -g verbose/verb#dev verb-generate-readme && verb
```

### Running tests

Running and reviewing unit tests is a great way to get familiarized with a library and its API. You can install dependencies and run tests with the following command:

```sh
$ npm install && npm test
```

### Author

**Brian Woodward**

* [github/doowb](https://github.com/doowb)
* [twitter/doowb](https://twitter.com/doowb)

### License

Copyright © 2017, [Brian Woodward](https://github.com/doowb).
Released under the [MIT License](LICENSE).

***

_This file was generated by [verb-generate-readme](https://github.com/verbose/verb-generate-readme), v0.4.3, on April 04, 2017._