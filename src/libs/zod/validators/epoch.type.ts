import { z } from 'zod';

const EPOCH_REGEXP = /^(?:\/date\()?(?<epoch>[\d.]+)(?:\)\/)?$/iu;

/**
 * Creates a Zod validator for Unix timestamps that converts to Date objects.
 *
 * Supports multiple timestamp formats:
 * 	- plain numbers as strings: "1753134591"
 * 	- .NET Date format: "/Date(1753134591)/"
 * 	- numbers with decimal points: "1753134591.123"
 *
 * @param options - configuration options
 * @param options.seconds - if true, treats the timestamp as seconds instead of milliseconds (default: false)
 * @returns zod transformer that validates and converts timestamps to Date objects
 *
 * @example
 * Basic usage (milliseconds):
 * ```ts
 * import { z } from 'zod';
 * import { epoch } from '#libs/zod';
 *
 * const EventSchema = z.object({
 *	name: z.string(),
 *	createdAt: epoch(), // Expects milliseconds
 * });
 *
 * const event = EventSchema.parse({
 *	name: "Meeting",
 *	createdAt: "1753134591000" // Will be converted to Date
 * });
 * ```
 *
 * @example
 * Using seconds:
 * ```ts
 * const EventSchema = z.object({
 *	name: z.string(),
 *	createdAt: epoch({ seconds: true }), // Expects seconds
 * });
 *
 * const event = EventSchema.parse({
 *	name: "Meeting",
 *	createdAt: "1753134591" // Will be converted to Date
 * });
 * ```
 *
 * @example
 * .NET Date format:
 * ```ts
 * const data = EventSchema.parse({
 *	name: "Meeting",
 *	createdAt: "/Date(1753134591)/" // .NET format
 * });
 * ```
 */

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
