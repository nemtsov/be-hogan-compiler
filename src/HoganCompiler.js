const Hogan = require('assets-require/hogan');

class HoganCompiler {
  constructor(driver, templatesPath, options) {
    this._driver = driver;
    this._templatesPath = templatesPath;
    this._options = Object.assign({}, options, {
      extension: 'mustache',
    });
  }

  populateCache() {
    return this._driver.recursiveReaddir(this._templatesPath, this._options.extension)
    .then(names => names.map(name => this.compile(name)));
  }

  compile(name) {
    return this._compileWithoutPartials(name)
    .then(template => this._recursivelyCompilePartials(name, template))
    .then(partials => this._setTemplatePartials(name, partials));
  }

  _recursivelyCompilePartials(name, template, partials = {}) {
    partials[name] = template;

    const partialNames = Object.keys(template.partials)
    .map(id => template.partials[id].name)
    .filter(name => !Boolean(partials[name]));

    const templatePromises = partialNames
    .map(name => this._compileWithoutPartials(name));

    return Promise.all(templatePromises)
    .then(templates =>
      Promise.all(templates.map((template, idx) =>
        this._recursivelyCompilePartials(partialNames[idx], template, partials)
      ))
    )
    .then(() => partials);
  }

  _compileWithoutPartials(name) {
    return this._driver.readFile(`${this._templatesPath}/${name}.${this._options.extension}`)
    .then(file => Hogan.compile(file));
  }

  _setTemplatePartials(name, compiledPartials) {
    const template = compiledPartials[name];

    // 'ri' is render internal - a hook that Hogan.js designed for overrides
    template.ri = function(context, partials, indent) {
      return this.r(context, compiledPartials, indent);
    };

    return template;
  }
}

module.exports = HoganCompiler;
