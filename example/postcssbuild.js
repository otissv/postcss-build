module.exports = {
	"notify" : true,

	"src": "example/src/main.css",

	"output": "example/css/main.min.css",

	"plugins": [
	"autoprefixer",
	"precss",
	"cssnano"
	],

	"options": {
		"autoprefixer": {
			"browsers": ["> 1%", "IE 7"],
			"cascade": false
		},

		// "cssnano": { "safe": true }
	}
};
