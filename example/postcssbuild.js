module.exports = {
	"notify" : true,

	"watch" : "example/src/",

	"src": [
		"example/src/main.css",
		"example/src/about/about.css",
		"example/src/home/home.css"
	],

	"output": "example/css/main.min.css",

	"plugins": [
	"autoprefixer",
	"precss"
	],

	"options": {
		"autoprefixer": {
			"browsers": ["> 1%", "IE 7"],
			"cascade": false
		},

		"cssnano": { "safe": true }
	}
};
