import glob from "glob";
import watch from 'watch';
import runProcess from './run-process';
import config from './config';
import mapPromise from 'map-async-promise';
import { wathchingMessage } from './messages.js';
import {
	flatten,
	mkDir
} from './utils';


(function() {

	// config
	const {
		EXT,
		DIR,
		TO,
		SOURCE,
		WATCH
	} = config(process.argv);

	const {
		proccessFiles,
		setChangedFile
	} = runProcess(config(process.argv));

	// Make directories
	mkDir([ TO ]);


	function run() {
		if (SOURCE) {
			Array.isArray(SOURCE)
			? proccessFiles(null, SOURCE)
			: proccessFiles(null, [SOURCE]);

		} else {
			if (Array.isArray(DIR)) {
				const getFilePaths = (resolve, file, index, arr) => {
					glob(`${file}/**/*${EXT}`, {}, (err, paths) => resolve(paths));
				};

				mapPromise(getFilePaths)(flatten(DIR))
					.then(results => proccessFiles(null, results));


			} else {
				glob(`${DIR}/**/*${EXT}`, {}, proccessFiles);
			}
		}
	}


	function watchFiles () {
		wathchingMessage(WATCH);
		watch.createMonitor(WATCH, function (monitor) {
			monitor.files[`${WATCH}`];
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
