const fs = require('fs');
const path = require('path');
const readdir = require('recursive-readdir');

exports.readFile = function(filename) {
  return new Promise((resolve, reject) => {
    fs.readFile(filename, 'utf8', (err, data) => {
      err ? reject(err) : resolve(data);
    });
  });
};

exports.recursiveReaddir = function(dirname, ext) {
  dirname = path.normalize(dirname);
  const extensionRe = new RegExp(`\.${ext}$`);

  return new Promise((resolve, reject) => {
    readdir(dirname, (err, files) => {
      const filenames = [];

      files.forEach((file) => {
        if (extensionRe.test(file)) {
          filenames.push(file.substring(dirname.length + 1, file.length - ext.length - 1));
        }
      });

      err ? reject(err) : resolve(filenames);
    });
  });
};
