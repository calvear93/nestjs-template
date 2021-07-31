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
            ...readEnvFile(`environment/env/${envName}.local.env.json`, true)
        },
    });
});

/**
 * Loads a environment file.
 *
 * @param {string} filePath
 * @param {boolean} isLocal if config is a local file
 *
 * @returns {any} secrets object
 */
function readEnvFile(filePath, isLocal = false) {
    // local file exists, so loads it
    if (fs.existsSync(filePath))
        return JSON.parse(fs.readFileSync(filePath));

    // if config is local and doesn't exists
    if (isLocal) {
        fs.writeFileSync(filePath, '{}');

        return {};
    }

    throw new Error(`env file "${filePath}" does not found`);
}
