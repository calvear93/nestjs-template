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
