# import-glob-loader
Globbing preloader for Webpack

Expands globbing patterns for import statements. Currently only does vertical expansion, e.g.
```sass
@import "foo/**/*";
```
Expands into
```sass
@import "foo/1.scss";
@import "foo/bar/2.scss";
@import "foo/bar/3.scss";
```

## Install
```sh
npm install import-glob-loader --save-dev
```

## Usage
You can use it one of two ways, the recommended way is to use it as a preloader for files you know has import statements.
This usually applies to ES6 module `import` statements, CSS `@import` at-rules, and Sass `@import` statements.

```js
{
  module: {
    preloaders: [{
      test: /\.scss/,
      loader: 'import-glob-loader'
    }]
  }
}
```

Alternatively you can use it as a chained loader
```js
require('style!css!sass!import-glob!foo/bar.scss')
```

## Options
All options are passthrough to [node-glob](https://github.com/isaacs/node-glob). `import-glob` comes with two additional options.

* `test = 'import'` The test for globbing to be applied. Lines matching `test` will be expanded. (This is a word-boundary test, so `import` will match `@import` but not `importScript`, for example)
* `delimiter = '\n'` The delimiter used to join expanded globs.
