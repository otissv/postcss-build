module.exports = {

	"notify" : true,

	"ext": ".css",

	// "watch" : "example/src/",
	//
	"before": ["example/src/main.css"],
	"after": {"example/src/content.css"},

	"src": [
		[
			"example/src/about/about1.css",
			"example/src/about/about2.css"
		],
		[
			"example/src/home/home1.css",
			"example/src/home/home2.css"
		],

	],

	// "output": "example/css/main.min.css",

	"from": "example/src",
	"to": "example/css",
	"map" : { inline: false },

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
