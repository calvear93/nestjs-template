export type Mock<T> = {
	[P in keyof T]?: Mock<T[P]>;
};

/**
 * Type assertion for
 * create type-safe
 * partial mocks.
 *
 * @typeParam T - type
 * @param mockObj - obj for mock
 *
 * @returns type narrowed object
 */
export const mock = <T>(mockObj: Mock<T>): T => {
	return mockObj as T;
};
