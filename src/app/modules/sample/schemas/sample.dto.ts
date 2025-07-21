import { ZodObjectDto } from '#libs/zod';
import { z } from 'zod';

const SampleSchema = z.object({
	id: z.coerce.number(),
	name: z.string(),
});

export class SampleDto extends ZodObjectDto(SampleSchema) {}

// register DTO OpenApi schema to Swagger
SampleDto.registerOpenApi();
