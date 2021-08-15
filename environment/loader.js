const fs = require('fs');
const app = require('../package.json');

/**
 * Loads a environment variables.
 *
 * @param {string} filePath
 * @param {string} envName environment name (dev|qa|prod)
 *
 * @returns {any} environment object
 */
module.exports = new Promise((resolve) => {
    const envs = process.argv[process.argv.indexOf('-e') + 1].split(',');

    const envName = envs[0];
    const modeName = envs[1];

    console.log(
        '\x1b[32m',
        `Loading "${envName}" environment in "${modeName}" mode`,
        '\x1b[0m'
    );

    resolve({
        [modeName]: {
            VERSION: app.version,
            PROJECT: app.name,
            TITLE: app.title,
        },
        [envName]: {
            ENV: envName,
            ...readEnvFile('environment/base/default.env.json'),
            ...readEnvFile(`environment/env/${envName}.env.json`),
            ...readEnvFile(`environment/base/${modeName}.env.json`),
            ...readEnvFile(`environment/env/${envName}.local.env.json`, true),
        },
    });
});

/**
 * Loads a environment file.
 *
 * Non local files should exists and
 * contains a valid parsable JSON content.
 *
 * @param {string} filePath
 * @param {boolean} isLocal if config is a local file
 *
 * @returns {any} secrets object
 */
function readEnvFile(filePath, isLocal = false) {
    try {
        console.log('\x1b[35m', `Loading ${filePath}`, '\x1b[0m');

        // local file exists, so loads it
        if (fs.existsSync(filePath))
            return JSON.parse(fs.readFileSync(filePath));

        // if config is local and doesn't exists
        if (isLocal) {
            fs.writeFileSync(filePath, '{}');

            return {};
        }

        throw new Error(`env file "${filePath}" does not found`);
    } catch (error) {
        console.error('\x1b[31m', error.message, '\x1b[0m');

        throw error;
    }
}
