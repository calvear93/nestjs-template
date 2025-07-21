import { z } from 'zod';

const EPOCH_REGEXP = /^(?:\/date\()?(?<epoch>[\d.]+)(?:\)\/)?$/iu;

export const epoch = ({ seconds }: { seconds: boolean } = { seconds: false }) =>
	z
		.string()
		.transform<Date>((value, context) => {
			const matcher = EPOCH_REGEXP.exec(value);

			if (!matcher?.groups) {
				context.issues.push({
					code: 'invalid_value',
					inclusive: true,
					input: value,
					message: `Expected a valid Unix Timestamp, received '${value}'`,
					origin: 'epoch',
					values: [],
				});
				return null as any;
			}

			const epoch = seconds
				? +matcher.groups.epoch * 1000
				: +matcher.groups.epoch;
			const date = new Date(0);
			date.setUTCMilliseconds(epoch);

			return date;
		})
		.meta({ examples: [1_753_134_591], format: 'epoch', type: 'number' });
