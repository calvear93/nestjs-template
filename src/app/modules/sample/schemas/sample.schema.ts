import { z } from 'zod';

export const SampleSchema = z
	.object({
		id: z.coerce.number(),
		name: z.string().meta({ description: 'Sample name' }),
	})
	.meta({ id: 'Sample', description: 'Sample schema' });

export type Sample = z.infer<typeof SampleSchema>;
