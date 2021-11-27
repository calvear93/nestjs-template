/**
 * Flatten a object keeping depth path
 * in key using _ as level separator.
 *
 * @param {any} obj
 * @param {string} pkey first level key. Must be undefined.
 *
 * @returns {any} flatten object.
 */
function flatten(obj, pkey = '')
{
    const flattened = {};

    for (const key in obj)
    {
        const value = obj[key];

        if (typeof value !== 'object' || value === null)
        {
            flattened[`${pkey}${key}`] = value;
            continue;
        }

        if (Array.isArray(value))
            flattened[`${pkey}${key}`] = value;
        else
            Object.assign(flattened, flatten(value, `${pkey}${key}_`));
    }

    return flattened;
}

exports.flatten = flatten;
