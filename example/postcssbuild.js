module.exports = {
	"notify" : true,

	"ext": ".sass",

	// "watch" : "example/src/",

	"src": [
		"example/src/main.sass",
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


	// "dir": [
	// 	"example/src/about/",
	// 	"example/src/home",
	// ],

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
