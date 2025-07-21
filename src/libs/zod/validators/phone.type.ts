import { z } from 'zod';

const PHONE_REGEX = /^\+?\(?\d{1,3}\)?[\s\-.]?\d{3}[\s\-.]?\d{4,6}$/u;

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
