#PostCSS Build
A postcss cli build tool. Useful if you use npm as a build tool. As opposed to [postcss-cli](https://github.com/postcss/postcss-cli), PostCSS build can scan an entire directory and subdirectory for files as well as process files in sequence.




## Usage
PostCSS Build takes a number of source files and passes them through PostCSS and outputs a single file.
```
$ npm install -g postcss-build --save-dev

$ postcssbuild --src main.css --output main.min.css --plugins [ "autoprefixer", "cssnano" ]
```


### CLI options
-c or --config  
Configuration file in JSON or CommonJS.  

-d or --dir  
Source directory as string or directories as array. This is recursive.

-e or --ext
When in dir mode, will only process file extensions specified.
Defaults to ".css".

-h or --help  
Displays help text .

-n or --notify  
Show os notifications.

-o or --output  
Path to output file.

-p or --plugins  
Array of postcss plugins names.

-s or --src  
Path to a single source file or a list of arrays and strings with source file paths, where they will be processed in sequence. --src overrules --dir.

-t or --options  
Plugin options.

-w or --watch
Recursively watch a directory for changes.


### Config
Instead of passing arguments via the cli they can be placed inside a JSON config file.

CLI arguments overrule config.

Example
```
module.exports = {
	"notify" : true,

	"ext": ".css",

	"watch" : "example/src/",

	"src": [
		"example/src/main.css",
		[
			"example/src/about/about1.css",
			"example/src/about/about2.css"
		],
		[
			"example/src/home/home1.css",
			"example/src/home/home2.css"
		],
		"example/src/content.css",
	],

	"output": "example/css/main.min.css",

	"plugins": [
	"autoprefixer",
	"precss",
	// "cssnano"
	],

	"options": {
		"autoprefixer": {
			"browsers": ["> 1%", "IE 7"],
			"cascade": false
		},

		"cssnano": { "safe": true }
	}
};
```

## Example
npm start

## Change Log
All notable changes to this project will be documented in CHANGELOG.md.

This project adheres to [Semantic Versioning](http://semver.org/).
```
{
  "version": "1.1.0"
}
```
MAJOR.MINOR.PATCH

1. MAJOR: Breaking changes.  
2. MINOR: New features.  
3. PATCH: Bug fixes.

## Credits
[postcss]('https://github.com/postcss/postcss')

##License
MIT
