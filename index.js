import colors from 'colors';
import concat from 'concat-files';
import fs from 'fs';
import glob from "glob";
import minimist from 'minimist';
import path from 'path';
import postcss from 'postcss';
import shell from 'shelljs';


// shell commands
const {
	echo,
	error,
	exit,
	ls,
	mkdir,
	tempdir
} = shell;


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
const OUTPUT = argv.output || argv.o || config('output');
const SOURCE = argv.src || argv.s || config('src');
const PLUGINS = argv.plugins || argv.p || config('plugins');
const OPTIONS = argv.options || argv.opts || config('options');
const TMP_DIR = `${tempdir()}/postcssbuild`;
const OUTPUT_DIR = OUTPUT.substring(0, OUTPUT.lastIndexOf('/'));


// If no source or exit files print help text
if (SOURCE == undefined || OUTPUT == undefined) {
	help();
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
			fs.writeFile(OUTPUT, result.css);
			if ( result.map ) fs.writeFileSync('docs/styles/app.uikit.map', result.map);
		});
}


// Concatenate files
function concatFiles (err, contents) {
	concat(contents, `${TMP_DIR}/postcssbuild.css`, () => {

		fs.readFile(`${TMP_DIR}/postcssbuild.css`, 'utf8', function (err, data) {
			if (err) {
				return echo(err);
			}

			processCSS(data);
		});
	});
}


// Help
function help () {
	echo(`Postcss build help:
Usage: pcss <command>

where <command> is one of:
-c, --config	-h, --help, -s, --src, -t, --options, -o, --output, -p, --plugins, -w, --watch

pcss -h, --help\t
`);
	exit();
}


// Make directories
mkDir([ TMP_DIR, OUTPUT_DIR ]);

glob(`${SOURCE}/**/*.css`, {}, concatFiles);
