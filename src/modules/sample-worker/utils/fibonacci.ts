/**
 * Calculates fibonacci value.
 *
 * @param {number} num iterations
 * @returns {number} fibonacci number
 */
export function fibonacci(num: number): number {
    if (num <= 1) return num;

    return fibonacci(num - 1) + fibonacci(num - 2);
}
