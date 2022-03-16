/**
 * Calculates the check digit of a rut/ci.
 *
 * @param {string} id RUT (Rol Único Tributario), RUN (Rol Único Nacional).
 * @returns {string} check digit.
 */
export function checkDigit(id: string): string {
    let sum = 0;
    let mul = 2;

    for (let i = id.length - 1; i >= 0; i--) {
        sum += +id[i] * mul;
        mul = (mul + 1) % 8 || 2;
    }

    const result = sum % 11;

    switch (result) {
        case 1:
            return 'K';

        case 0:
            return '0';

        default:
            return `${11 - result}`;
    }
}

/**
 * Removes all dots and the hyphen.
 *
 * @param {string | undefined} rut chilean id.
 * @returns {string} cleaned id.
 */
export function clean(rut?: string): string {
    return rut ? rut.replace(/[.-]/g, '') : '';
}

/**
 * Validates chilean Id.
 *
 * @param {string | undefined} id RUT (Rol Único Tributario), RUN (Rol Único Nacional).
 * @returns {boolean} whether id is valid.
 */
export function isValid(id?: string): boolean {
    id = clean(id);

    if (id.length < 7) return false;

    let dv = id[id.length - 1];
    dv = dv === 'k' ? 'K' : dv;

    const dvC = checkDigit(id.slice(0, Math.max(0, id.length - 1)));

    return dv === dvC;
}
