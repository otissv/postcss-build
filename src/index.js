import fs from 'fs';
import glob from "glob";
import postcss from 'postcss';
import shell from 'shelljs';
import watch from 'watch';


import config from './config';
import {
	errorReporter,
	successMessage,
	wathchingMessage
} from './messages.js';
import {
	flatten,
	forEachPromise,
	mkDir
} from './helpers';


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
