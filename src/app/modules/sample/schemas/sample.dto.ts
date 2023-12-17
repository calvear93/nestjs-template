import { z } from 'zod';
import { zodDto } from '@libs/zod';

export class SampleDto extends zodDto({
	id: z.coerce.number(),
	name: z.string(),
}) {}

// register DTO OpenApi schema to Swagger
SampleDto.registerOpenApi();
