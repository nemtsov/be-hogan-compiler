const Hogan = require('assets-require/hogan');

class HoganCompiler {
  constructor(driver, templatesPath, options = {}) {
    this._driver = driver;
    this._templatesPath = templatesPath;
    this._templatePromises = {};

    this._options = Object.assign({}, options, {
      extension: 'mustache',
    });

    const readTemplate = (name) => {
      return driver.readFile(`${templatesPath}/${name}.${this._options.extension}`)
      .then(file => Hogan.compile(file));
    };

    const readCachedTemplate = (name) => {
      let templatePromise = this._templatePromises[name];
      if (!templatePromise) {
        this._templatePromises[name] = templatePromise = readTemplate(name);
      }
      return templatePromise;
    };

    this._readTemplate = options.isCached ? readCachedTemplate : readTemplate;
  }

  populateCache() {
    return this._driver.recursiveReaddir(this._templatesPath, this._options.extension)
    .then(files => files.map((file) => this._readTemplate(file)));
  }

  compile(name) {
    return this._readTemplate(name)
    .then(template => {
      return this._readPartials(name, template)
      .then((requiredPartials) => {
        // render internal - hook that Hogan.js designed for overrides
        template.ri = function(context, partials, indent) {
          return this.r(context, requiredPartials, indent);
        };
        return template;
      });
    });
  }

  _readPartials(name, template, partials = {}) {
    partials[name] = template;

    const partialNames = Object.keys(template.partials)
    .map(id => template.partials[id].name)
    .filter(name => !Boolean(partials[name]));

    const templatePromises = partialNames
    .map(name => this._readTemplate(name));

    return Promise.all(templatePromises)
    .then(templates =>
      Promise.all(templates.map((template, idx) =>
        this._readPartials(partialNames[idx], template, partials)
      ))
    )
    .then(() => partials);
  }
}

exports.create = function(readFile, templatesPath, options) {
  return new HoganCompiler(readFile, templatesPath, options);
};
