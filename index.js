import postcss from 'postcss';
import fs from 'fs';
import minimist from 'minimist';
import concat from 'concat-files';
import glob from "glob";
import shell from 'shelljs';
import path from 'path';


// shell commands
const {
	ls,
	error,
	mkdir,
	tempdir
} = shell;


// config and cli arguments
const argv = minimist(process.argv.slice(2));
const CONFIG = argv.config ? require(path.resolve(`${argv.config}`)) : null;


const OUTPUT = argv.output || argv.o || CONFIG.output;
const SOURCE = argv.src || argv.s || CONFIG.src;
const PLUGINS = argv.plugins || argv.p || CONFIG.plugins;
const OPTION = argv.options || argv.s || CONFIG.options;


// OS temp directory
const TMP_DIR = `${tempdir()}/postcssbuild`;

const FILE = OUTPUT.substr(OUTPUT.lastIndexOf('/') + 1);
const OUTPUT_DIR = OUTPUT.substring(0, OUTPUT.lastIndexOf('/'));


// Create directories
function mkDir (paths) {
	if (Array.isArray(paths)) {
		paths.forEach(path => {
			if (ls(path) && error()) {
				/*eslint-disable no-console */
				console.log(`Creating directory ${path}`);
				/*eslint-enable no-console */

				mkdir('-p', path);
			}
		});
	} else {
		if (ls(paths) && error()) {
			/*eslint-disable no-console */
			console.log(`Creating directory ${path}`);
			/*eslint-enable no-console */

			mkdir('-p', paths);
		}
	}
}


// Process postcss
const processCSS = (css) => {
	postcss(...PLUGINS.map(plugin => require(plugin)))
	 .process(css)
	 .then(function (result) {
	     fs.writeFile(OUTPUT, result.css);
	     if ( result.map ) fs.writeFileSync('docs/styles/app.uikit.map', result.map);
	 });
};


// Concatenate files
const concatFiles = (err, contents) => {
	concat(contents, `${TMP_DIR}/postcssbuild.css`, () => {

		fs.readFile(`${TMP_DIR}/postcssbuild.css`, 'utf8', function (err, data) {
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
mkDir([ TMP_DIR, OUTPUT_DIR ]);

if (SOURCE == undefined || OUTPUT == undefined) {
  console.log('0');
} else {
	glob(`${SOURCE}/**/*.css`, {}, concatFiles);
}
