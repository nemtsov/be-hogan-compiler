const HoganCompiler = require('./HoganCompiler');

class CachedHoganCompiler extends HoganCompiler {
  constructor(driver, templates, options) {
    super(driver, templates, options);
    this._templatePromises = {};
    this._compilePromises = {};
  }

  /**
   * @override
   */
  compile(name) {
    let compilePromise = this._compilePromises[name];
    if (!compilePromise) {
      this._compilePromises[name] = compilePromise = super.compile(name);
    }
    return compilePromise;
  }

  /**
   * @override
   */
  _compileWithoutPartials(name) {
    let templatePromise = this._templatePromises[name];
    if (!templatePromise) {
      this._templatePromises[name] = templatePromise = super._compileWithoutPartials(name);
    }
    return templatePromise;
  }
}

module.exports = CachedHoganCompiler;
