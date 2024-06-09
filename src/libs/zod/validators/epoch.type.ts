import { z } from 'zod';

const EPOCH_REGEXP = /^(?:\/date\()?(?<epoch>\d+)(?:\)\/)?$/iv;

export const epoch = () =>
	z
		.string()
		.transform<Date>((value, context) => {
			(context as any).originalValue = value;
			const matcher = EPOCH_REGEXP.exec(value);

			if (!matcher || !matcher.groups) return null as any;

			const date = new Date(0);
			date.setUTCSeconds(+matcher.groups.epoch);

			return date;
		})
		.superRefine((value, context) => {
			const originalValue = (context as any).originalValue as unknown;

			if (!value) {
				context.addIssue({
					code: z.ZodIssueCode.invalid_date,
					message: `Expected a valid Unix Timestamp, received '${originalValue}'`,
				});

				return z.INVALID;
			}
		});
