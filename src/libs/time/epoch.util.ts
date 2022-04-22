/**
 * Returns epoch UTC time for expiration.
 *
 * @static
 * @param {seconds} [time] expiration time from now in seconds
 *
 * @returns {epoch} expiration epoch time
 */
export function calcExpirationEpoch(time: seconds = 0): epoch {
    return Math.trunc(Date.now() / 1000) + time;
}

/**
 * Validates if epoch is expired.
 *
 * @static
 * @param {epoch} exp expiration epoch time
 * @param {seconds} [tolerance] latency tolerance threshold in seconds
 *
 * @returns {boolean} whether is expired
 */
export function epochIsExpired(exp: epoch, tolerance: seconds = 0): boolean {
    const now = calcExpirationEpoch(-tolerance);

    return now > exp;
}
