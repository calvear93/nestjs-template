const app = require('./package.json');

module.exports = Promise.resolve({
  // default variables for all environments.
	default: {
		VERSION: app.version,
		TITLE: app.title,
    	DESCRIPTION: app.description
	},

  	// used on tests running.
	test: {
	},

	// used on project building.
	build: {
	},

  	debug: {
		ENV: 'debug'
	},
	development: {
		ENV: 'development'
	},
	qa: {
		ENV: 'qa'
	},
	production: {
		ENV: 'production'
	},
});
