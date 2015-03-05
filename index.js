var fs = require('fs');
var convert = require('convert-source-map');
var merge = require('merge');

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

var port = 9876;
function karmaTemplate(prefix, error, files, template){
  var defaults = {
    frameworks:['mocha'],

    files:[],

    port: port++,

    browsers: [process.env.TRAVIS ? 'Firefox' : 'Chrome'],

    reporters: ['dots','junit'],

    junitReporter:{
      outputFile: 'build/' + prefix + (error ? '-error-report.xml' : '-report.xml')
    },

    singleRun: true,
    autoWatch: false
  };

  var config = merge(defaults, template);
  files.forEach(function(file){
    file = file.replace("{prefix}", prefix);
    file = file.replace("{error}", error ? '-error' : '');
    config.files.push(file);
  });

  return config;
}

function success() {
  console.log([
    '*************************SUCCESS************************'.blue,
    '  Tests completed successfully.',
    '  Earlier error messages are to be expected',
    '  (we were testing how those errors handle source maps)',
    '********************************************************'.blue
  ].join('\n'));
}

module.exports = {
  validateErrorMapping:validateErrorMapping,
  validateNoSourceMap:validateNoSourceMap,
  karmaTemplate:karmaTemplate,
  success:success
};