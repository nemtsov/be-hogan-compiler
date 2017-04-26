const HoganCompiler = require('./HoganCompiler');
const CachedHoganCompiler = require('./CachedHoganCompiler');

exports.create = function(readFile, templatesPath, options = {}) {
  return options.isCached ?
    new CachedHoganCompiler(readFile, templatesPath, options) :
    new HoganCompiler(readFile, templatesPath, options);
};
