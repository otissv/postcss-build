'use strict';

var _colors = require('colors');

var _colors2 = _interopRequireDefault(_colors);

var _concatFiles = require('concat-files');

var _concatFiles2 = _interopRequireDefault(_concatFiles);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

var _minimist = require('minimist');

var _minimist2 = _interopRequireDefault(_minimist);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _postcss = require('postcss');

var _postcss2 = _interopRequireDefault(_postcss);

var _shelljs = require('shelljs');

var _shelljs2 = _interopRequireDefault(_shelljs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

// shell commands
var echo = _shelljs2.default.echo;
var error = _shelljs2.default.error;
var exit = _shelljs2.default.exit;
var ls = _shelljs2.default.ls;
var mkdir = _shelljs2.default.mkdir;
var tempdir = _shelljs2.default.tempdir;

// CLI arguments

var argv = (0, _minimist2.default)(process.argv.slice(2));

// Print help
if (argv == undefined || argv['help'] || argv['h']) {
	help();
}

// Get config options
function config(option) {
	if (argv.config || argv.c) {
		return require(_path2.default.resolve('' + argv.config))[option];
	}
}

// Argument constants
var DIR = argv.dir || argv.d || config('dir');
var OPTIONS = argv.options || argv.opts || config('options');
var OUTPUT = argv.output || argv.o || config('output');
var OUTPUT_DIR = OUTPUT.substring(0, OUTPUT.lastIndexOf('/'));
var PLUGINS = argv.plugins || argv.p || config('plugins');
var SOURCE = argv.src || argv.s || config('src');
var TMP_DIR = tempdir() + '/postcssbuild';

// If no source or exit files print help text
if (DIR == undefined && SOURCE == undefined || OUTPUT == undefined) {
	help();
}

// Create directories
function mkDir(paths) {
	if (Array.isArray(paths)) {
		paths.forEach(function (path) {
			if (ls(path) && error()) {
				echo(('Creating directory ' + path).blue);
				mkdir('-p', path);
			}
		});
	} else {
		if (ls(paths) && error()) {
			echo(('Creating directory ' + _path2.default).blue);
			mkdir('-p', paths);
		}
	}
}

// Process postcss
function processCSS(css) {
	_postcss2.default.apply(undefined, _toConsumableArray(PLUGINS.map(function (plugin) {
		return require(plugin)(OPTIONS[plugin]);
	}))).process(css).then(function (result) {
		_fs2.default.writeFile(OUTPUT, result.css);
		if (result.map) _fs2.default.writeFileSync('docs/styles/app.uikit.map', result.map);
	});
}

// Concatenate files
function concatFiles(err, contents) {

	(0, _concatFiles2.default)(contents, TMP_DIR + '/postcssbuild.css', function () {
		_fs2.default.readFile(TMP_DIR + '/postcssbuild.css', 'utf8', function (err, data) {
			if (err) {
				return echo(err);
			}

			processCSS(data);
		});
	});
}

// Help
function help() {
	echo('Usage: pcss <command>\n\nwhere <command> is one of:\n\t-c, --config, -d, --dir, -h, --help, -s, --src, -t,\n\t--options, -o, --output, -p, --plugins\n\npcss -c or --config\t /path/to/file\t\t configuration file\npcss -d or --dir\t /path/to/folder\t source directory\npcss -h or --help\t\t\t\t displays this help text\npcss -s or --src\t /path/to/file\t\t source file\npcss -t or --options\t\t\t\t plugin options\npcss -o or --output\t /path/to/file\t\t output file\npcss -p or --plugins\t [\'plugin\', \'names\']\t\t postcss plugins\n\n');
	exit();
}

// Make directories
mkDir([TMP_DIR, OUTPUT_DIR]);

if (SOURCE) {
	concatFiles(null, [SOURCE]);
} else {
	(0, _glob2.default)(DIR + '/**/*.css', {}, concatFiles);
}
