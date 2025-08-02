import { ZodDto } from '#libs/zod';
import { z } from 'zod';

const SampleSchema = z
	.object({
		id: z.coerce.number(),
		name: z.string().meta({ description: 'Sample name' }),
	})
	.meta({ description: 'Sample DTO schema' });

export class SampleDto extends ZodDto(SampleSchema, 'Sample') {}
