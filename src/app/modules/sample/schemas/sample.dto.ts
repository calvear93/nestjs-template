import { z } from 'zod';
import { createZodDto } from '../../../../libs/zod/create-zod-dto.ts';

export class SampleDto extends createZodDto({
	id: z.coerce.number(),
	name: z.string(),
}) {}

// register to Swagger OpenAPI
SampleDto.register();