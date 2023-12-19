import { z } from 'zod';
import { ZodDto } from '@libs/zod';

export class SampleDto extends ZodDto({
	id: z.coerce.number(),
	name: z.string(),
}) {}

// register DTO OpenApi schema to Swagger
SampleDto.registerOpenApi();
