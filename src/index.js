import chalk from 'chalk';
import fs from 'fs';
import glob from "glob";
import notifier from 'node-notifier';
import minimist from 'minimist';
import path from 'path';
import postcss from 'postcss';
import shell from 'shelljs';
import watch from 'watch';


(function() {

	// shell commands
	const {
		echo,
		error,
		exit,
		ls,
		mkdir,
		tempdir
	} = shell;

	let changedFile;
	let memoiseFiles = {};

	// CLI arguments
	const argv = minimist(process.argv.slice(2));


	// Print help
	if (argv == undefined || argv['help'] || argv['h']) {
		help();
	}


	// Get config options
	function config (option) {
		if (argv.config || argv.c) {
			return require(path.resolve(`${argv.config}`))[option];
		}
	}


	// Argument constants
	const EXT = argv.ext || argv.e || config('map') || '.css';
	const DIR = argv.dir || argv.d || config('dir');
	// const MAP = argv.map || argv.m || config('map');
	const NOTIFY = argv.notify || argv.n || config('notify');
	const OPTIONS = argv.options || argv.opts || config('options');
	const OUTPUT = argv.output || argv.o || config('output');
	const OUTPUT_DIR = OUTPUT.substring(0, OUTPUT.lastIndexOf('/'));
	const PLUGINS = argv.plugins || argv.p || config('plugins');
	const SOURCE = argv.src || argv.s || config('src');
	const TMP_DIR = `${tempdir()}/postcssbuild`;
	const WATCH = argv.watch || argv.w || config('watch');

	// If no source or exit files print help text
	if ((DIR == undefined && SOURCE == undefined) || OUTPUT == undefined) {
		help();
	}

	// Wacthing message
	function wathchingMessage () {
		if (WATCH) echo(`Watching files in ${WATCH}\n`);
	}

	//Report Errors
	function reporter (errors) {
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


			echo(chalk.red('PossCSSBuild Error'));

			const typeColor = chalk[color](`${type}`);
			const pluginColor = chalk[color](`${plugin}`);
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


	// Process postcss
	function processCSS (css) {
		postcss(...PLUGINS.map(plugin => require(plugin)(OPTIONS[plugin])))
			.process(css)
			.then(function (result) {

				if (result.messages.length > 0) {
					//if ( result.map ) fs.writeFileSync('docs/styles/app.uikit.map', result.map);
					reporter(result.messages.map(mes => {
						return {
							pos:  mes.line && mes.column ? `Line ${mes.line}:${mes.column}` : '',
							type: mes.type,
							text: mes.text,
							plugin: mes.plugin
						};
					}));

				} else {
					fs.writeFile(OUTPUT, result.css);
					echo(chalk.cyan('PossCSS Build success'));
					wathchingMessage();

					if (NOTIFY) {
						notifier.notify({
							title: 'PostCSS Build',
							message: 'Success'
						});
					}
				}

			})
			.catch(function (error) {
				reporter([{
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


	// Help
	function help () {
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


	// Make directories
	mkDir([ TMP_DIR, OUTPUT_DIR ]);

	function flatten (arr) {
		return arr.reduce((a, b) => [...a.concat(b)], []);
	}

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

	run();


	wathchingMessage();

	if (WATCH) {
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

})();
