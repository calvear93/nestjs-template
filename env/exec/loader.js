const fs = require('fs');
const app = require('../../package.json');
const appsettings = require('../appsettings.json');
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
    const [envName, ...modes] = process
        .argv[process.argv.indexOf('-e') + 1]
        .split(',');

    console.log(
        '\x1b[36m',
        '\n',
        `Executing "${envName}" environment in "${modes.join('+')}" mode`,
        '\x1b[0m'
    );

    if(!fs.existsSync('env/secrets'))
        fs.mkdirSync('env/secrets');

    const vars = {
        [envName]: {
            ENV: envName,

            VERSION: app.version,
            PROJECT: app.project,
            NAME: app.name,
            TITLE: app.title,
            DESCRIPTION: app.description,

            ...flatten(appsettings['[DEFAULT]']),
            ...flatten(appsettings['[ENV]']?.[envName]),
            ...flatten(readEnvFile(`env/secrets/${envName}.env.json`)),
            ...mergeModes(modes),
            ...flatten(readEnvFile(`env/secrets/${envName}.local.env.json`, true))
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

/**
 * Merges multiple execution modes
 * a single variables object.
 *
 * @param {string[]} modes names of execution modes
 *
 * @returns {any} secrets object from modes
 */
function mergeModes(modes)
{
    return modes.reduce((merge, modeName) => {
        merge = {
            ...merge,
            ...flatten(appsettings['[MODE]']?.[modeName]),
        };

        return merge;
    }, {});
}

// exports variables for environment loading
module.exports = buildEnv();
