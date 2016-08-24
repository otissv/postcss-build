import glob from "glob";
import watch from 'watch';
import process from 'process';
import config from './config';
import { wathchingMessage } from './messages.js';
import {
	flatten,
	forEachPromise,
	mkDir
} from './utils';


(function() {

	// config
	const {
		EXT,
		DIR,
		OUTPUT_DIR,
		SOURCE,
		WATCH
	} = config(process.argv);

	const runProcess = process(config(process.argv));

	// Make directories
	mkDir([ OUTPUT_DIR ]);


	function run() {
		if (SOURCE) {
			Array.isArray(SOURCE)
			? runProcess.getFileContents(null, SOURCE)
			: runProcess.getFileContents(null, [SOURCE]);

		} else {
			if (Array.isArray(DIR)) {
				const getFilePaths = (resolve, file, index, arr) => {
					glob(`${file}/**/*${EXT}`, {}, (err, paths) => resolve(paths));
				};

				forEachPromise(getFilePaths)(flatten(DIR))
					.then(results => runProcess.getFileContents(null, results));


			} else {
				glob(`${DIR}/**/*${EXT}`, {}, runProcess.getFileContents);
			}
		}
	}


	function watchFiles () {
		wathchingMessage(WATCH);
		watch.createMonitor(WATCH, function (monitor) {
			monitor.files[`${WATCH}`];
			monitor.on("created", function (f, stat) {
				runProcess.setChangedFile = f;
				run();
			});

			monitor.on("changed", function (f, curr, prev) {
				runProcess.setChangedFile = f;
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
