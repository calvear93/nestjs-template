export type Mock<T> = {
    [P in keyof T]?: Mock<T[P]>;
};

/**
 * Type assertion for
 * create type-safe
 * partial mocks.
 *
 * @export
 * @template T
 * @param {Mock<T>} mockObj
 *
 * @returns {T}
 */
export function mock<T>(mockObj: Mock<T>): T {
    return mockObj as T;
}
