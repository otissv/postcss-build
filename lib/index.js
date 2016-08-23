'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var fs = _interopDefault(require('fs'));
var glob = _interopDefault(require('glob'));
var postcss = _interopDefault(require('postcss'));
var shell = _interopDefault(require('shelljs'));
var watch = _interopDefault(require('watch'));
var minimist = _interopDefault(require('minimist'));
var path = _interopDefault(require('path'));
var notifier = _interopDefault(require('node-notifier'));
var chalk = _interopDefault(require('chalk'));

function help () {
  const {
    echo,
    exit,
  } = shell;

		echo(`Usage: postcssbuild <command>

where <command> is one of:
\t-c, --config, -d, --dir, -h, --help, -s, --src, -t,
\t--options, -o, --output, -p, --plugins

postcssbuild -c or --config\t /path/to/file\t\t Configuration file
postcssbuild -d or --dir\t /path/to/folder\t Source directory
postcssbuild -h or --help\t\t\t\t Displays this help text
postcssbuild -m or --map\t fileName\t Add source map inline
postcssbuild -s or --src\t [/path/to/file]\t Source file(s)
postcssbuild -t or --options\t\t\t\t Plugin options
postcssbuild -o or --output\t /path/to/file\t\t Output file
postcssbuild -p or --plugins\t ['plugin', 'names']\t Postcss plugins
postcssbuild -n or --notify\t\t\t\t System nofifications

	`);
	exit();
}

// Get getConfig options


function config (processArg) {
  const argv = minimist(processArg.slice(2));

  function getConfig (option) {
    if (argv.config || argv.c) {
      return require(path.resolve(`${argv.config}`))[option];
    }
  }


  // Print help
  if (argv == undefined || argv['help'] || argv['h']) {
    help();
  }

  // Argument constants
  const EXT = argv.ext || argv.e || getConfig('ext') || '.css';
  const DIR = argv.dir || argv.d || getConfig('dir');
  // const MAP = argv.map || argv.m || getConfig('map');
  const NOTIFY = argv.notify || argv.n || getConfig('notify');
  const OPTIONS = argv.options || argv.opts || getConfig('options');
  const OUTPUT = argv.output || argv.o || getConfig('output');
  const OUTPUT_DIR = OUTPUT.substring(0, OUTPUT.lastIndexOf('/'));
  const PLUGINS = argv.plugins || argv.p || getConfig('plugins');
  const SOURCE = argv.src || argv.s || getConfig('src');
  const WATCH = argv.watch || argv.w || getConfig('watch');

  // If no source or exit files print help text
  if ((DIR == undefined && SOURCE == undefined) || OUTPUT == undefined) {
    help();
  }

  return {
   EXT,
   DIR,
   NOTIFY,
   OPTIONS,
   OUTPUT,
   OUTPUT_DIR,
   PLUGINS,
   SOURCE,
   WATCH
  };
}

const {
  echo
} = shell;


function errorReporter (NOTIFY, errors) {
  // remove duplicate errors
  [...new Set(errors)].forEach(mes => {
    const pos = mes.pos ? `Line ${mes.pos}` : '';
    const type = mes.type ? mes.type : '';
    const text = mes.text ? mes.text : '';
    const plugin = mes.plugin ? mes.plugin : '';

    const messageColor = (type) => {
      return type === 'warning' ? 'yellow' : 'red';
    };

    let color = messageColor(type);

    const typeColor = chalk[color](`${type}`);
    const pluginColor = chalk[color](`${plugin}`);

    echo(chalk.red('PossCSSBuild Error'));
    echo(`${pos} [${pluginColor}] ${typeColor}`);
    echo(chalk[color](`${text}`));
  });


  // System notification
  if (NOTIFY) {
    notifier.notify({
      title: 'PostCSS Build',
      message: 'Error'
    });
  }
}


function successMessage (NOTIFY) {
  echo(chalk.cyan('PossCSS Build success'));

  if (NOTIFY) {
    notifier.notify({
      title: 'PostCSS Build',
      message: 'Success'
    });
  }
}


function wathchingMessage (WATCH) {
  if (WATCH) echo(`Watching files in ${WATCH}\n`);
}

// flatten array
function flatten (arr) {
  return arr.reduce((a, b) => [...a.concat(b)], []);
}


// forEach async
function forEachPromise (fn) {
  return function (arr) {
    let contents = arr.map((item, index) => {
      return new Promise((resolve) => {
        fn(resolve, item, index, arr);
      });
    });

    return Promise.all(contents).then(res => [...new Set(res)]);
  };
}


// Create directories
function mkDir (paths) {
  const {
		echo,
		error,
		ls,
		mkdir,
	} = shell;

  if (Array.isArray(paths)) {
    paths.forEach(path => {
      if (ls(path) && error()) {
        echo(`Creating directory ${path}`.blue);
        mkdir('-p', path);
      }
    });
  } else {
    if (ls(paths) && error()) {
      echo(`Creating directory ${path}`.blue);
      mkdir('-p', paths);
    }
  }
}

(function() {

	// shell commands
	const {
		echo,
	} = shell;

	// config
	const {
		EXT,
		DIR,
		NOTIFY,
		OPTIONS,
		OUTPUT,
		OUTPUT_DIR,
		PLUGINS,
		SOURCE,
		WATCH
	} = config(process.argv);

	let changedFile;
	let memoiseFiles = {};


	// Process postcss
	function processCSS (css) {
		postcss(...PLUGINS.map(plugin => require(plugin)(OPTIONS[plugin])))
			.process(css)
			.then(function (result) {

				if (result.messages.length > 0) {
					//if ( result.map ) fs.writeFileSync('docs/styles/app.uikit.map', result.map);
					errorReporter(NOTIFY, result.messages.map(mes => {
						return {
							pos:  mes.line && mes.column ? `Line ${mes.line}:${mes.column}` : '',
							type: mes.type,
							text: mes.text,
							plugin: mes.plugin
						};
					}));

				} else {
					fs.writeFile(OUTPUT, result.css);
					successMessage(NOTIFY);
					wathchingMessage(WATCH);
				}

			})
			.catch(function (error) {
				errorReporter(NOTIFY, [{
					pos:  `${error.line}:${error.column}`,
					type: error.reason,
					plugin: error.name
				}]);
			});
	}


	function getFileContents(err, filePaths) {
		if (err) return echo(err);
		const flattenfilePaths = flatten(filePaths);

		const fn = (resolve, file, index, arr) => {
			if (changedFile == null || changedFile === file) {
				fs.readFile(file, 'utf8', function (err, data) {
					if (err) return echo(err);
					memoiseFiles[file] = data;
					resolve(memoiseFiles);
				});

			} else {
				resolve(memoiseFiles);
			}
		};


		forEachPromise(fn)(flattenfilePaths)
			.then(results => {
				processCSS(flattenfilePaths.map(i => results[0][i]).join(''));
			})
			.catch(err => echo(err));
	}


	// Make directories
	mkDir([ OUTPUT_DIR ]);


	function run() {
		if (SOURCE) {
			Array.isArray(SOURCE)
			? getFileContents(null, SOURCE)
			: getFileContents(null, [SOURCE]);

		} else {
			if (Array.isArray(DIR)) {
				const getFilePaths = (resolve, file, index, arr) => {
					glob(`${file}/**/*${EXT}`, {}, (err, paths) => resolve(paths));
				};

				forEachPromise(getFilePaths)(flatten(DIR))
					.then(results => getFileContents(null, results));


			} else {
				glob(`${DIR}/**/*${EXT}`, {}, getFileContents);
			}
		}
	}

	function wathFiles () {
		wathchingMessage(WATCH);
		watch.createMonitor(WATCH, function (monitor) {
			monitor.files[`${WATCH}`];
			monitor.on("created", function (f, stat) {
				changedFile = f;
				run();
			});

			monitor.on("changed", function (f, curr, prev) {
				changedFile = f;
				run();
			});

			monitor.on("removed", function (f, stat) {
				run();
			});
		});
	}

	run();

	if (WATCH) wathFiles();

})();