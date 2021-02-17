const app = require('./package.json');

// shared keys
const common = {
	tenantId: '6d4bbe0a-5654-4c69-a682-bf7dcdaed8e7',
	clientId: '91678a4b-5262-4611-a60b-6dc9e0ca00f3'
}

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

		JWT_AAD_TENANT_ID: common.tenantId,
		JWT_AAD_CLIENT_ID: common.clientId,
		JWT_AAD_ISSUER: `https://login.microsoftonline.com/${common.tenantId}/v2.0`,

		JWT_OPEN_ID_JWKS: `https://login.microsoftonline.com/${common.tenantId}/discovery/v2.0/keys`
	},

  	// used on tests running.
	test: {
	},

	// used on project building.
	build: {
		PORT: 80
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
