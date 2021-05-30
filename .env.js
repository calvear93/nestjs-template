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
        DESCRIPTION: app.description
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

        DEFAULT_DB_CONNECTION: "postgres",
        DEFAULT_DB_HOST: "localhost",
        DEFAULT_DB_PORT: 5432,

        DEFAULT_DB_USERNAME: "local",
        DEFAULT_DB_PASSWORD: "123",
        DEFAULT_DB_DATABASE: "test",
        DEFAULT_DB_SCHEMA: "public_test",

        DEFAULT_DB_ORM_AUTO_MIGRATE: false,
        DEFAULT_DB_ORM_SYNCHRONIZE: false,
        DEFAULT_DB_ORM_LOGGING: true
    },
    development: {
        ENV: 'development'
    },
    qa: {
        ENV: 'qa'
    },
    production: {
        ENV: 'production'
    }
});
