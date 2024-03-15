import { type StringValidation, z } from 'zod';

const PHONE_REGEX = /^\+?\(?\d{1,3}\)?[\s.-]?\d{3}[\s.-]?\d{4,6}$/;

export const phone = () =>
	z
		.string()
		.transform((value) => {
			return value.replaceAll(' ', '');
		})
		.superRefine((value, context) => {
			if (!PHONE_REGEX.test(value)) {
				context.addIssue({
					code: z.ZodIssueCode.invalid_string,
					message: `Expected a valid phone, received '${value}'`,
					validation: 'phone' as StringValidation,
				});

				return z.INVALID;
			}
		});
