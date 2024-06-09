import { z } from 'zod';

const EPOCH_REGEXP = /^(?:\/date\()?(?<epoch>\d+)(?:\)\/)?$/iv;

const addTransformIssue = (context: z.RefinementCtx, value: unknown) => {
	context.addIssue({
		code: z.ZodIssueCode.invalid_date,
		message: `Expected a valid Unix Timestamp, received '${value}'`,
	});

	return false as any;
};

export const epoch = () =>
	z
		.string()
		.transform<Date>((value, context) => {
			const matcher = EPOCH_REGEXP.exec(value);

			if (!matcher || !matcher.groups)
				return addTransformIssue(context, value);

			const date = new Date(0);
			date.setUTCSeconds(+matcher.groups.epoch);

			return date;
		})
		.superRefine((value) => {
			if (!value) return z.INVALID;
		});
