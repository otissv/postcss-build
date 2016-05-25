'use strict';

var _postcss = require('postcss');

var _postcss2 = _interopRequireDefault(_postcss);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _minimist = require('minimist');

var _minimist2 = _interopRequireDefault(_minimist);

var _concatFiles = require('concat-files');

var _concatFiles2 = _interopRequireDefault(_concatFiles);

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

var _shelljs = require('shelljs');

var _shelljs2 = _interopRequireDefault(_shelljs);

var _autoprefixer = require('autoprefixer');

var _autoprefixer2 = _interopRequireDefault(_autoprefixer);

var _cssnano = require('cssnano');

var _cssnano2 = _interopRequireDefault(_cssnano);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

// shell commands
var ls = _shelljs2.default.ls;
var error = _shelljs2.default.error;
var mkdir = _shelljs2.default.mkdir;
var tempdir = _shelljs2.default.tempdir;

// config and cli arguments

var argv = (0, _minimist2.default)(process.argv.slice(2));
var CONFIG = argv.config ? require(_path2.default.resolve('' + argv.config)) : null;

var OUTPUT = argv.output || argv.o || CONFIG.output;
var SOURCE = argv.src || argv.s || CONFIG.src;
var PLUGINS = argv.plugins || argv.p || CONFIG.plugins;
var OPTION = argv.options || argv.s || CONFIG.options;

// OS temp directory
var TMP_DIR = tempdir() + '/postcssbuild';

var FILE = OUTPUT.substr(OUTPUT.lastIndexOf('/') + 1);
var OUTPUT_DIR = OUTPUT.substring(0, OUTPUT.lastIndexOf('/'));

// Create directories
function mkDir(paths) {
	if (Array.isArray(paths)) {
		paths.forEach(function (path) {
			if (ls(path) && error()) {
				/*eslint-disable no-console */
				console.log('Creating directory ' + path);
				/*eslint-enable no-console */

				mkdir('-p', path);
			}
		});
	} else {
		if (ls(paths) && error()) {
			/*eslint-disable no-console */
			console.log('Creating directory ' + _path2.default);
			/*eslint-enable no-console */

			mkdir('-p', paths);
		}
	}
}

// Process postcss
var processCSS = function processCSS(css) {
	_postcss2.default.apply(undefined, _toConsumableArray(PLUGINS.map(function (plugin) {
		return require(plugin);
	}))).process(css).then(function (result) {
		_fs2.default.writeFile(OUTPUT, result.css);
		if (result.map) _fs2.default.writeFileSync('docs/styles/app.uikit.map', result.map);
	});
};

// Concatenate files
var concatFiles = function concatFiles(err, contents) {
	(0, _concatFiles2.default)(contents, TMP_DIR + '/postcssbuild.css', function () {

		_fs2.default.readFile(TMP_DIR + '/postcssbuild.css', 'utf8', function (err, data) {
			if (err) {
				/*eslint-disable no-console */
				return console.log(err);
				/*eslint-enable no-console */
			}

			processCSS(data);
		});
	});
};

// Make directories
mkDir([TMP_DIR, OUTPUT_DIR]);

if (SOURCE == undefined || OUTPUT == undefined) {
	console.log('0');
} else {
	(0, _glob2.default)(SOURCE + '/**/*.css', {}, concatFiles);
}
