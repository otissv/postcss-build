#PostCSS build
A postcss cli build tool. Useful if you use npm as a build tool.

## Usage
```
$ npm install -g postcss-build --save-dev

$ postcss-build --src main.css --output main.min.css --plugins [ "autoprefixer", "cssnano" ]
```


### CLI options
-c or --config  
configuration file  

-d or --dir  
Source directory  

-h or --help  
Displays help text  

-s or --src  
Path to source file  

-t or --options  
Plugin options  

-o or --output  
Path to output file  

-p or --plugins  
Array of postcss plugins names


### Config
Instead of passing arguments via the cli they can be placed inside a JSON config file.

CLI arguments overrule config.

Example
```
{
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

## TODO
- Tests

##License
MIT
