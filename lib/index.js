'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var glob = _interopDefault(require('glob'));
var watch = _interopDefault(require('watch'));
var fs = _interopDefault(require('fs'));
var postcss = _interopDefault(require('postcss'));
var shell = _interopDefault(require('shelljs'));
var mapPromise = _interopDefault(require('map-async-promise'));
var path = _interopDefault(require('path'));
var notifier = _interopDefault(require('node-notifier'));
var chalk = _interopDefault(require('chalk'));
var minimist = _interopDefault(require('minimist'));

var toConsumableArray = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  } else {
    return Array.from(arr);
  }
};

// flatten array
function flatten(arr) {
  return arr.reduce(function (a, b) {
    return [].concat(toConsumableArray(a.concat(b)));
  }, []);
}

// Create directories
function mkDir(paths) {
  var echo = shell.echo;
  var error = shell.error;
  var ls = shell.ls;
  var mkdir = shell.mkdir;


  if (Array.isArray(paths)) {
    paths.forEach(function (path) {
      if (ls(path) && error()) {
        echo(('Creating directory ' + path).blue);
        mkdir('-p', path);
      }
    });
  } else {
    if (ls(paths) && error()) {
      echo(('Creating directory ' + path).blue);
      mkdir('-p', paths);
    }
  }
}

var echo = shell.echo;


function errorReporter(NOTIFY, errors) {
  // remove duplicate errors
  [].concat(toConsumableArray(new Set(errors))).forEach(function (mes) {
    var pos = mes.pos ? 'Line ' + mes.pos : '';
    var type = mes.type ? mes.type : '';
    var text = mes.text ? mes.text : '';
    var plugin = mes.plugin ? mes.plugin : '';

    var messageColor = function messageColor(type) {
      return type === 'warning' ? 'yellow' : 'red';
    };

    var color = messageColor(type);

    var typeColor = chalk[color]('' + type);
    var pluginColor = chalk[color]('' + plugin);

    echo(chalk.red('PossCSSBuild Error'));
    echo(pos + ' [' + pluginColor + '] ' + typeColor);
    echo(chalk[color]('' + text));
  });

  // System notification
  if (NOTIFY) {
    notifier.notify({
      title: 'PostCSS Build',
      message: 'Error'
    });
  }
}

function successMessage(NOTIFY) {
  echo(chalk.cyan('PossCSS Build success'));

  if (NOTIFY) {
    notifier.notify({
      title: 'PostCSS Build',
      message: 'Success'
    });
  }
}

function wathchingMessage(WATCH) {
  if (WATCH) echo('Watching files in ' + WATCH + '\n');
}

function pathDetails(file, from, to) {
  var pathFile = file.split(from)[1];
  var fileName = pathFile.replace(/^.*(\\|\/|\:)/, '');
  var split = file.indexOf('/') != -1 ? '/' : '\\';
  var dest = to.concat(pathFile.match(/(.*)[\/\\]/)[1] || '');

  return {
    fullPath: '' + dest + split + fileName,
    srcFrom: dest,
    srcTo: '' + to + split + fileName
  };
}

function runProcess(_ref) {
  var FROM = _ref.FROM;
  var MAP = _ref.MAP;
  var NOTIFY = _ref.NOTIFY;
  var OPTIONS = _ref.OPTIONS;
  var OUTPUT = _ref.OUTPUT;
  var PLUGINS = _ref.PLUGINS;
  var TO = _ref.TO;
  var WATCH = _ref.WATCH;

  var changedFile = void 0;
  var cacheFile = {};
  var cachePostCSS = {};
  var fileOrder = [];

  var echo = shell.echo;


  function concat(obj) {

    var writeFile = function writeFile(output, content) {
      fs.writeFile(output, content, function (err) {
        if (err) throw err;
        successMessage(NOTIFY);
      });
    };

    if (OUTPUT) {
      writeFile(OUTPUT, fileOrder.map(function (item, index) {
        return obj[item].css;
      }).join(''));
      successMessage(NOTIFY);
    } else {
      var fn = function fn(resolve, file) {
        var _pathDetails = pathDetails(file, FROM, TO);

        var fullPath = _pathDetails.fullPath;
        var srcFrom = _pathDetails.srcFrom;


        if (srcFrom !== TO) {
          mkDir(srcFrom);
        }

        writeFile(fullPath, obj[file].css);

        if (MAP && typeof MAP.inline === 'boolean' && MAP.inline === false) {
          writeFile(fullPath + '.map', obj[file].map.toString());
        }

        resolve();
      };

      mapPromise(fn)(fileOrder).then(function () {
        successMessage(NOTIFY);
      }).catch(function (err) {
        return echo(err);
      });
    }

    wathchingMessage(WATCH);
  }

  function processCSS() {
    var fn = function fn(resolve, file) {
      var css = cacheFile[file];

      if (changedFile == null || changedFile === file) {
        var _pathDetails2 = pathDetails(file, FROM, TO);

        var srcTo = _pathDetails2.srcTo;

        var opts = {
          from: file,
          to: '' + srcTo,
          map: {}
        };

        if (MAP && MAP.inline === false) {
          opts.map.inline = false;
        } else if (MAP || MAP && MAP.inline === true) {
          opts.map.inline = true;
        }

        postcss.apply(undefined, toConsumableArray(PLUGINS.map(function (plugin) {
          return require(plugin)(OPTIONS[plugin]);
        }))).process(css, opts).then(function (result) {

          if (result.messages.length > 0) {
            errorReporter(NOTIFY, result.messages.map(function (mes) {
              return {
                pos: mes.line && mes.column ? 'Line ' + mes.line + ':' + mes.column : '',
                type: mes.type,
                text: mes.text,
                plugin: mes.plugin
              };
            }));
          } else {
            cachePostCSS[file] = { css: result.css, map: result.map };
            resolve(cachePostCSS);
          }
        }).catch(function (error) {
          errorReporter(NOTIFY, [{
            pos: error.line + ':' + error.column,
            type: error.reason,
            plugin: error.name
          }]);
        });
      } else {
        resolve(cachePostCSS);
      }
    };

    mapPromise(fn)(fileOrder).then(function (results) {
      concat(results[0]);
    }).catch(function (err) {
      return echo(err);
    });
  }

  function getFileContents() {
    var readFiles = function readFiles(resolve, file, index, arr) {
      if (changedFile == null || changedFile === file) {
        fs.readFile(file, 'utf8', function (err, data) {
          if (err) return echo(err);
          cacheFile[file] = data;
          resolve(cacheFile);
        });
      } else {
        resolve(cacheFile);
      }
    };

    mapPromise(readFiles)(fileOrder).then(function () {
      processCSS();
    }).catch(function (err) {
      return echo(err);
    });
  }

  return {
    proccessFiles: function proccessFiles(err, filePaths) {
      if (err) return echo(err);
      fileOrder = flatten(filePaths);

      getFileContents();
    },
    setChangedFile: function setChangedFile(file) {
      changedFile = file;
    }
  };
}

function help() {
  var echo = shell.echo;
  var exit = shell.exit;


  echo('Usage: postcssbuild <command>\n\nwhere <command> is one of:\n\t-c, --config, -d, --dir, -e, --ext, -h, --help, -s, --src,\n\t-t, --options, -o, --output, -p, --plugins,\n\npostcssbuild -c or --config\t /path/to/file\t\t Configuration file\npostcssbuild -e or --ext\t\t\t\t File extention defaults to .css\npostcssbuild -d or --dir\t /path/to/folder\t Source directory\npostcssbuild -h or --help\t\t\t\t Displays this help text\npostcssbuild -n or --notify\t\t\t\t System nofifications\npostcssbuild -o or --output\t /path/to/file\t\t Output file\npostcssbuild -p or --plugins\t [\'plugin\', \'names\']\t Postcss plugins\npostcssbuild -s or --src\t [/path/to/file]\t Source file(s)\npostcssbuild -t or --options\t\t\t\t Plugin options\npostcssbuild -w or --watch\t /path/to/watch\t\t Watches directory for changes\n\t');
  exit();
}

// Get getConfig options

function config(processArg) {
  var argv = minimist(processArg.slice(2));

  function getConfig(option) {
    if (argv.config || argv.c) {
      return require(path.resolve('' + argv.config))[option];
    }
  }

  // Print help
  if (argv == undefined || argv['help'] || argv['h']) {
    help();
  }

  // Argument constants
  var EXT = argv.ext || argv.e || getConfig('ext') || '.css';
  var DIR = argv.dir || argv.d || getConfig('dir');
  var FROM = argv.from || argv.f || getConfig('from');
  var MAP = argv.map || argv.m || getConfig('map');
  var NOTIFY = argv.notify || argv.n || getConfig('notify');
  var OPTIONS = argv.options || argv.opts || getConfig('options');
  var OUTPUT = argv.output || argv.o || getConfig('output');
  var TO = argv.to || argv.t || getConfig('to');
  var PLUGINS = argv.plugins || argv.p || getConfig('plugins');
  var SOURCE = argv.src || argv.s || getConfig('src');
  var WATCH = argv.watch || argv.w || getConfig('watch');
  var DEST = TO ? TO : OUTPUT ? OUTPUT.match(/(.*)[\/\\]/)[1] || '' : null;

  // If no source or exit files print help text
  if (DIR == undefined && SOURCE == undefined || DEST == undefined) {
    help();
  }

  return {
    EXT: EXT,
    DEST: DEST,
    DIR: DIR,
    FROM: FROM,
    MAP: MAP,
    NOTIFY: NOTIFY,
    OPTIONS: OPTIONS,
    OUTPUT: OUTPUT,
    TO: TO,
    PLUGINS: PLUGINS,
    SOURCE: SOURCE,
    WATCH: WATCH
  };
}

(function () {

	// config

	var _config = config(process.argv);

	var EXT = _config.EXT;
	var DIR = _config.DIR;
	var TO = _config.TO;
	var SOURCE = _config.SOURCE;
	var WATCH = _config.WATCH;

	var _runProcess = runProcess(config(process.argv));

	var proccessFiles = _runProcess.proccessFiles;
	var setChangedFile = _runProcess.setChangedFile;

	// Make directories

	mkDir([TO]);

	function run() {
		if (SOURCE) {
			Array.isArray(SOURCE) ? proccessFiles(null, SOURCE) : proccessFiles(null, [SOURCE]);
		} else {
			if (Array.isArray(DIR)) {
				var getFilePaths = function getFilePaths(resolve, file, index, arr) {
					glob(file + '/**/*' + EXT, {}, function (err, paths) {
						return resolve(paths);
					});
				};

				mapPromise(getFilePaths)(flatten(DIR)).then(function (results) {
					return proccessFiles(null, results);
				});
			} else {
				glob(DIR + '/**/*' + EXT, {}, proccessFiles);
			}
		}
	}

	function watchFiles() {
		wathchingMessage(WATCH);
		watch.createMonitor(WATCH, function (monitor) {
			monitor.files['' + WATCH];
			monitor.on("created", function (f, stat) {
				setChangedFile(f);
				run();
			});

			monitor.on("changed", function (f, curr, prev) {
				setChangedFile(f);
				run();
			});

			monitor.on("removed", function (f, stat) {
				run();
			});
		});
	}

	run();
	if (WATCH) watchFiles();
})();