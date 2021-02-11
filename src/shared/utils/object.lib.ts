/**
 * Object utility functions.
 *
 * @summary Object utility functions.
 * @author Alvear Candia, Cristopher Alejandro <calvear93@gmail.com>
 *
 * Created at     : 2020-05-16 16:42:09
 * Last modified  : 2021-06-06 16:06:12
 */

/**
 * Validates emptiness of an object.
 *
 * @param {object | undefined} obj object for validate.
 *
 * @returns {boolean} true if object is empty or null/undefined, false in otherwise.
 */
export function isEmpty(obj: any | undefined): boolean
{
    return !obj || Object.keys(obj).length === 0;
}

/**
 * Reduces a empty object to a undefined,
 * 'cause in many cases,  it's meaning is the same.
 *
 * @param {object | undefined} obj object for validate.
 *
 * @returns {object | undefined} object if is not null, undefined or empty, undefined in otherwise.
 */
export function reduceEmptiness(obj: any | undefined): any | undefined
{
    return isEmpty(obj) ? undefined : obj;
}

/**
 * Safely calls a function over a object,
 * validating nullity of it.
 *
 * @param {Function} func func for apply.
 * @param {object} obj object for apply function.
 * @param {object} def default value in case of nullity/undefined.
 * @param {Array} [args] other function args.
 *
 * @returns {boolean} function result on object ok, def if object us null/undefined.
 */
export function callSafe(func: (obj: any, args: Array<any>)=> any, obj: any, def: any, ...args: Array<any>): boolean
{
    return (obj && func(obj, args)) ?? def;
}

/**
 * Filters object properties by keys array.
 *
 * @param {object} obj object for filter.
 * @param {Function} func filter func for keys/attributes.
 *
 * @returns {object} object with filtered props.
 */
export function filter(obj: any, func: (value: string, index: number, array: string[])=> unknown): any
{
    return !obj ? obj : Object.keys(obj)
        .filter(func)
        .reduce((mapper, key) =>
        {
            mapper[key] = obj[key];

            return mapper;
        }, {});
}

/**
 * Validates whether a value contains data,
 * it means the value cannot be undefined,
 * null, NaN or empty object.
 *
 * @param {any} value value for validation (undefined, null, NaN).
 * @param {boolean} [allowsEmpty] whether allows empty as valid ({}, [], '' or ' ').
 *
 * @returns {boolean} true if is valid, false in otherwise.
 */
export function isData(value: any, allowsEmpty?: boolean): boolean
{
    if (value === undefined || value === null)
        return false;

    const type = typeof value;
    const isDate = value instanceof Date;

    if ((type === 'number' || isDate) && isNaN(value))
        return false;

    if (!allowsEmpty && type === 'string' && value.trim() === '')
        return false;

    if (!allowsEmpty && Array.isArray(value) && value.length === 0)
        return false;

    if (!allowsEmpty && value instanceof Date && Number.isNaN(value))
        return false;

    if (!allowsEmpty && (type === 'object' && !isDate) && Object.keys(value).length === 0)
        return false;

    return true;
}
