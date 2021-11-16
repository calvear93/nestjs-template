const fs = require('node:fs');
const app = require('../../package.json');

/**
 * Loads environment variables.
 *
 * @tip in some cases, you can
 * return a promise for async
 * variables load.
 *
 * @returns {any} environment variables
 */
function buildEnv()
{
    const envs = process.argv[process.argv.indexOf('-e') + 1].split(',');

    const envName = envs[0];
    const modeName = envs[1];

    console.log(
        '\x1b[32m',
        `Executing "${modeName}" mode in "${envName}" environment`,
        '\x1b[0m'
    );

    const vars = {
        [modeName]: {
            VERSION: app.version,
            PROJECT: app.name,
            TITLE: app.title
        },
        [envName]: {
            ENV: envName,
            ...readEnvFile('env/global/default.env.json'),
            ...readEnvFile(`env/${envName}.env.json`),
            ...readEnvFile(`env/global/${modeName}.env.json`),
            ...readEnvFile(`env/${envName}.local.env.json`, true)
        }
    };

    if(modeName === 'debug')
        console.log('\n', vars)

    return vars;
}

/**
 * Loads a environment file.
 *
 * Non local files should exists and
 * contains a valid parsable JSON content.
 *
 * @param {string} filePath
 * @param {boolean} isLocal if config is a local file
 *
 * @throws {Error} on env file not found
 *
 * @returns {any} secrets object
 */
function readEnvFile(filePath, isLocal = false)
{
    try
    {
        console.log('\x1b[35m', `Loading ${filePath}`, '\x1b[0m');

        // local file exists, so loads it
        if (fs.existsSync(filePath))
            return JSON.parse(fs.readFileSync(filePath));

        // if config is local and doesn't exists
        if (isLocal)
        {
            fs.writeFileSync(filePath, '{}');

            return {};
        }

        throw new Error(`env file "${filePath}" does not found`);
    }
    catch (error)
    {
        console.error('\x1b[31m', error.message, '\x1b[0m');

        throw error;
    }
}

// exports variables for environment loading
module.exports = buildEnv();
