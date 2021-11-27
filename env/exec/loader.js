const fs = require('node:fs');
const app = require('../../package.json');
const base = require('../base.env.json');
const { flatten } = require('./utils/flatten.util');

const debug = process.argv.indexOf('--verbose') > 0;

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
        '\n',
        `Executing "${modeName}" mode in "${envName}" environment`,
        '\x1b[0m'
    );

    if(!fs.existsSync('env/secrets'))
        fs.mkdirSync('env/secrets');

    const vars = {
        [modeName]: {
            VERSION: app.version,
            PROJECT: app.project,
            NAME: app.name,
            TITLE: app.title,
            DESCRIPTION: app.description
        },
        [envName]: {
            ENV: envName,
            ...flatten(base.default),
            ...flatten(base.env?.[envName]),
            ...flatten(readEnvFile(`env/secrets/.${envName}.env.json`)),
            ...flatten(base.mode?.[modeName]),
            ...flatten(readEnvFile(`env/secrets/.${envName}.local.env.json`, true))
        }
    };

    if(debug)
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
        if(debug)
            console.log('\x1b[35m\x1b[2m', `Loading ${filePath}`, '\x1b[0m');

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
