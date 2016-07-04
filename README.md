#PostCSS build
A postcss cli build tool. Useful if you use npm as a build tool. As opposed to [postcss-cli](https://github.com/postcss/postcss-cli), PostCSS build can scan an entire directory and subdirectory for files.

## Usage
```
$ npm install -g postcss-build --save-dev

$ postcssbuild --src main.css --output main.min.css --plugins [ "autoprefixer", "cssnano" ]
```


### CLI options
-c or --config  
Configuration file in JSON or CommonJS.  

-d or --dir  
Source directory.  

-h or --help  
Displays help text  

-s or --src  
Path to a single source file or an array of paths to source files, where the array will be processed in sequence. --src overrules --dir;

-t or --options  
Plugin options.

-o or --output  
Path to output file.

-p or --plugins  
Array of postcss plugins names.

-n or --notify  
Show os notifications.


### Config
Instead of passing arguments via the cli they can be placed inside a JSON config file.

CLI arguments overrule config.

Example
```
{
  "notify": true,

  "dir": "src/styles/",

  "output" : dist/styles/main.css,

	"plugins": [ "autoprefixer", "cssnano" ],

	"options": {
		"autoprefixer": {
			"browsers": ["> 1%", "IE 7"],
			"cascade": false
		},

		"cssnano": { "safe": true }
	}
}
```


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
