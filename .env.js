const app = require('./package.json');

// environment variables
// each object represents
// a execution environment
module.exports = Promise.resolve({
  	// default variables for all environments.
	default: {
		PORT: 4001,
		VERSION: app.version,
		TITLE: app.title,
		DESCRIPTION: app.description,
	},

  	// used on tests running.
	test: {
	},

	// used on project building.
	build: {
		PORT: 80
	},

  	debug: {
		ENV: 'debug',

		// TYPEORM_CONNECTION: "postgres",
		// TYPEORM_HOST: "localhost",
		// TYPEORM_USERNAME: "local",
		// TYPEORM_PASSWORD: "123",
		// TYPEORM_DATABASE: "test",
		// TYPEORM_PORT: 5432,
		// TYPEORM_SYNCHRONIZE: true,
		// TYPEORM_LOGGING: true
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
