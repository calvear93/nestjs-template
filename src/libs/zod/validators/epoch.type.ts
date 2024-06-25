import { z } from 'zod';

const EPOCH_REGEXP = /^(?:\/date\()?(?<epoch>[\d.]+)(?:\)\/)?$/iu;

const addTransformIssue = (context: z.RefinementCtx, value: unknown) => {
	context.addIssue({
		code: z.ZodIssueCode.invalid_date,
		message: `Expected a valid Unix Timestamp, received '${value}'`,
	});

	return false as any;
};

export const epoch = ({ seconds }: { seconds: boolean } = { seconds: false }) =>
	z
		.string()
		.transform<Date>((value, context) => {
			const matcher = EPOCH_REGEXP.exec(value);

			if (!matcher?.groups) return addTransformIssue(context, value);

			const epoch = seconds
				? +matcher.groups.epoch * 1000
				: +matcher.groups.epoch;
			const date = new Date(0);
			date.setUTCMilliseconds(epoch);

			return date;
		})
		.superRefine((value) => {
			if (!value) return z.INVALID;
		});
