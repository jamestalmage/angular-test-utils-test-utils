var fs = require('fs');
var convert = require('convert-source-map');

/*
 creates a callback for karma, that upon test completion will:
 1. read in the file at `path`
 2. test it against regexp `test`
 3. call the callback with an error if it fails, or with nothing otherwise
  */
function validateErrorMapping(path, test, cb) {
  return function (e) {
    if (e) {
      var report = fs.readFileSync(path).toString();
      if (test.test(report)) {
        cb();
      }
      else {
        console.log(report);
        cb(new Error('bad source mapping'));
      }
    }
    else {
      cb(new Error('expected error'));
    }
  };
}

/*
 makes sure the supplied path has no source map
 */
function validateNoSourceMap(path){
  var code = fs.readFileSync(path).toString();
  if(convert.fromSource(code) !== null){
    throw new Error(path + ': found a source map when I should not have');
  }
}

module.exports = {
  validateErrorMapping:validateErrorMapping,
  validateNoSourceMap:validateNoSourceMap
};