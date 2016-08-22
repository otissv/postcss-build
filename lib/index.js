'use strict';

var _concatFiles = require('concat-files');

var _concatFiles2 = _interopRequireDefault(_concatFiles);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _dedupe = require('dedupe');

var _dedupe2 = _interopRequireDefault(_dedupe);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

var _nodeNotifier = require('node-notifier');

var _nodeNotifier2 = _interopRequireDefault(_nodeNotifier);

var _minimist = require('minimist');

var _minimist2 = _interopRequireDefault(_minimist);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _postcss = require('postcss');

var _postcss2 = _interopRequireDefault(_postcss);

var _shelljs = require('shelljs');

var _shelljs2 = _interopRequireDefault(_shelljs);

var _watch = require('watch');

var _watch2 = _interopRequireDefault(_watch);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

(function () {

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
	var WATCH = argv.watch || argv.w || config('watch');
	var NOTIFY = argv.notify || argv.n || config('notify');
	//const MAP = argv.map || argv.m || config('map');

	// If no source or exit files print help text
	if (DIR == undefined && SOURCE == undefined || OUTPUT == undefined) {
		help();
	}

	// Wacthing message
	function wathchinMessage() {
		echo('Watching files in ' + WATCH + '\n');
	}

	//Report Errors
	function reporter(errors) {
		// console.log(errors)
		// remove duplicate errors
		(0, _dedupe2.default)(errors).forEach(function (mes) {
			var pos = mes.pos ? 'Line ' + mes.pos : '';
			var type = mes.type ? mes.type : '';
			var text = mes.text ? mes.text : '';
			var plugin = mes.plugin ? mes.plugin : '';

			var messageColor = function messageColor(type) {
				return type === 'warning' ? 'yellow' : 'red';
			};

			var color = messageColor(type);

			echo(_chalk2.default.red('PossCSSBuild Error'));

			var typeColor = _chalk2.default[color]('' + type);
			var pluginColor = _chalk2.default[color]('' + plugin);
			echo(pos + ' [' + pluginColor + '] ' + typeColor);
			echo(_chalk2.default[color]('' + text));
		});

		// System notification
		if (NOTIFY) {
			_nodeNotifier2.default.notify({
				title: 'PostCSS Build',
				message: 'Error'
			});
		}
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

			if (result.messages.length > 0) {
				//if ( result.map ) fs.writeFileSync('docs/styles/app.uikit.map', result.map);
				reporter(result.messages.map(function (mes) {
					return {
						pos: mes.line && mes.column ? 'Line ' + mes.line + ':' + mes.column : '',
						type: mes.type,
						text: mes.text,
						plugin: mes.plugin
					};
				}));
			} else {
				_fs2.default.writeFile(OUTPUT, result.css);
				echo(_chalk2.default.cyan('PossCSS Build success'));
				wathchinMessage();

				if (NOTIFY) {
					_nodeNotifier2.default.notify({
						title: 'PostCSS Build',
						message: 'Success'
					});
				}
			}
		}).catch(function (error) {
			reporter([{
				pos: error.line + ':' + error.column,
				type: error.reason,
				plugin: error.name
			}]);
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
		echo('Usage: postcssbuild <command>\n\nwhere <command> is one of:\n\t-c, --config, -d, --dir, -h, --help, -s, --src, -t,\n\t--options, -o, --output, -p, --plugins\n\npostcssbuild -c or --config\t /path/to/file\t\t Configuration file\npostcssbuild -d or --dir\t /path/to/folder\t Source directory\npostcssbuild -h or --help\t\t\t\t Displays this help text\npostcssbuild -m or --map\t fileName\t Add source map inline\npostcssbuild -s or --src\t [/path/to/file]\t Source file(s)\npostcssbuild -t or --options\t\t\t\t Plugin options\npostcssbuild -o or --output\t /path/to/file\t\t Output file\npostcssbuild -p or --plugins\t [\'plugin\', \'names\']\t Postcss plugins\npostcssbuild -n or --notify\t\t\t\t System nofifications\n\n\t');
		exit();
	}

	// Make directories
	mkDir([TMP_DIR, OUTPUT_DIR]);

	function run() {
		if (SOURCE) {
			Array.isArray(SOURCE) ? concatFiles(null, SOURCE) : concatFiles(null, [SOURCE]);
		} else {
			(0, _glob2.default)(DIR + '/**/*.css', {}, concatFiles);
		}
	}

	run();

	if (WATCH) {
		wathchinMessage();

		_watch2.default.createMonitor(WATCH, function (monitor) {
			monitor.files['' + WATCH];
			monitor.on("created", function (f, stat) {
				run();
			});

			monitor.on("changed", function (f, curr, prev) {
				run();
			});

			monitor.on("removed", function (f, stat) {
				run();
			});
		});
	}
}).call(undefined);
