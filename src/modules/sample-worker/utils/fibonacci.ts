/**
 * Calculates fibonacci value.
 *
 * @export
 * @param {number} num iterations
 * @returns {number} fibonacci number
 */
export function fibonacci(num: number): number
{
    if (num <= 1)
        return 1;

    return fibonacci(num - 1) + fibonacci(num - 2);
}
