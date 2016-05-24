'use strict';

// var postcss = require('postcss');
var fs = require('fs');
// var autoprefixer = require('autoprefixer');
// var cssnano = require('cssnano');

// postcss([ autoprefixer, cssnano ])
//   .process(css, { from: '.tmp/uikit.css', to: 'uikit.css' })
//   .then(function (result) {
//       fs.writeFileSync('docs/styles/uikit.min.css', result.css);
//       if ( result.map ) fs.writeFileSync('docs/styles/app.uikit.map', result.map);
//   });

var argv = require('minimist')(process.argv.slice(2));
// var concat = require('concat-files');
var glob = require("glob");
if (argv.src == undefined || argv.dest == undefined) {
  console.log('0');
} else {
  glob(argv.src + '/**/*.css', {}, function (err, files) {
    if (err) throw err;

    console.log(files);
  });
}

// concat([ ])
// console.dir(argv.src);