# Behance Hogan Compiler [![Build Status](https://img.shields.io/travis/behance/be-hogan-compiler.svg)](http://travis-ci.org/behance/be-hogan-compiler) [![NPM version](https://img.shields.io/npm/v/be-hogan-compiler.svg)](https://www.npmjs.com/package/be-hogan-compiler)

This Browser / Node.js library is a helper for loading mustache templates via Hogan.js.


## Features

  - caching & asynchronous loading
  - retrieval and resolution of partials
  - deeply nested lambdas (e.g., i18n)
  - retrieve the files any way you like via the driver (e.g, XHR in the browser and fs in Node.js)


## Usage

```js
const hoganCompiler = require('be-hogan-compiler');

// Bring Your Own Driver
const fsReadFile = require('be-hogan-compiler/src/drivers/fs');
const templatesPath = '/tmp';

const compiler = hoganCompiler.create(fsReadFile, templatesPath/*, options */);

compiler.addLambda('i18n', () => {
  return (text) => {
    return my_18n_library.tranlate(text);
  };
});

// provide just the name, no need for the template dir or the extension
compiler.compile('my_template')
.then((template) => {
  const renderedString = template.render({ name: 'Mary' });
  console.log(renderedString);
});

```


#### Create Arguments:

  - `readFile` - function that will be used to read files. Must return a Promise. Defaults to a promised version of fs.readFile.
  - `templatesPath` - absolute path to the templates
  - `options.extension` - defaults to `mustache` (e.g., `template.mustache`)
  - `options.isCached` - cache compiled templates in the created instance

#### HoganCompilerOptions:

  - `asString` - return the compiled template as a string. This feature is used by hulk to produce strings containing pre-compiled templates.
  - `sectionTags` - allow custom tags that require opening and closing tags, and treat them as though they were section tags.
  - `delimiters` - A string that overrides the default delimiters. Example: "<% %>"
  - `disableLambda` - isables the higher-order sections / lambda-replace features of Mustache.

For more details see [Hogan Compilation options](https://github.com/twitter/hogan.js#compilation-options).



## License

[Apache-2.0](/LICENSE)
