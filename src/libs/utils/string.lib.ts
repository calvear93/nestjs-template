/**
 * Removes the string underscores.
 *
 * @param {string} str string.
 * @returns {string} string without underscores.
 */
export function removeUnderscore(str: string): string {
    return str.replace(/_/g, ' ');
}

/**
 * Capitalizes first char after period symbol.
 *
 * @param {string} str string.
 * @returns {string} string normalized.
 */
export function capitalizeAfterPeriod(str: string): string {
    if (!str) return '';

    return str.replace(
        /([!.?-]+\s*)([a-z])/g,
        (_, $1, $2) => $1 + $2.toUpperCase()
    );
}

/**
 * Capitalizes every word in the string.
 *
 * @param {string} str string.
 * @returns {string} string capitalized.
 */
export function capitalizeEvery(str: string): string {
    if (!str) return '';

    return capitalizeAfterPeriod(
        str.replace(/\w\S*/g, (txt) => {
            return txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase();
        })
    );
}

/**
 * Normalizes the string removing diacritics.
 *
 * @param {string} str string.
 * @returns {string} string without diacritics.
 */
export function removeDiacritics(str: string): string {
    if (!str) return '';

    return str
        .toString()
        .normalize('NFD')
        .replace(/[\p{Diacritic}|\u0142|\u0027]/gu, '');
}

/**
 * Changes case to upper and add extra space
 * to every char for emphasize string,
 *
 * @param {string} str string.
 * @returns {string} string emphasized.
 */
export function empathize(str: string): string {
    if (!str) return '';

    return [...str.toUpperCase()].reduce(
        (result: string, char: string, index: number): string => {
            result += char;

            if (index !== str.length - 1) result += ' ';

            return result;
        },
        ''
    );
}
