import { z } from 'zod';

const PHONE_REGEX = /^\+?\(?\d{1,3}\)?[\s\-.]?\d{3}[\s\-.]?\d{4,6}$/u;

/**
 * Creates a Zod validator for international phone numbers.
 *
 * Supported formats:
 * - international: "+1234567890", "+56 9 9264 1781"
 * - US: "(555) 123-4567", "555-123-4567", "555.123.4567"
 * - simple: "555 123 4567", "5551234567"
 *
 * @returns zod transformer that validates phone numbers and removes spaces
 *
 * @example
 * Basic usage:
 * ```ts
 * import { z } from 'zod';
 * import { phone } from '#libs/zod';
 *
 * const ContactSchema = z.object({
 *	name: z.string(),
 *	phoneNumber: phone(),
 * });
 *
 * const contact = ContactSchema.parse({
 *	name: "John Doe",
 *	phoneNumber: "+1 (555) 123-4567" // Spaces will be removed
 * });
 *
 * console.log(contact.phoneNumber); // "+1(555)123-4567"
 * ```
 *
 * @example
 * In a DTO:
 * ```ts
 * import { ZodDto, phone } from '#libs/zod';
 *
 * const UserSchema = z.object({
 *	name: z.string(),
 *	primaryPhone: phone(),
 *	secondaryPhone: phone().optional(),
 * });
 *
 * export class UserDto extends ZodDto(UserSchema, 'User') {}
 * ```
 *
 * @example
 * Validation errors:
 * ```ts
 * // These will throw validation errors:
 * phone().parse("123"); // Too short
 * phone().parse("not-a-phone"); // Invalid format
 * phone().parse(""); // Empty string
 * ```
 */

export const phone = () =>
	z
		.string()
		.transform((value) => {
			return value.replaceAll(' ', '');
		})
		.check(({ issues, value }) => {
			if (!PHONE_REGEX.test(value)) {
				issues.push({
					code: 'invalid_value',
					inclusive: true,
					input: value,
					message: `Expected a valid phone, received '${value}'`,
					origin: 'phone',
					values: [],
				});
			}
		})
		.meta({
			examples: ['+56992641781'],
			format: 'phone',
			pattern: PHONE_REGEX.source,
			type: 'string',
		});
