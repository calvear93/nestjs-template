import { z } from 'zod';
import { ZodDto } from '#libs/zod';

/**
 * ___DtoName___ Schema.
 */
const ___DtoName___Schema = z.object({
	prop: z.string().describe('my prop'),
});

/**
 * ___DtoName___ Dto.
 */
export class ___DtoName___Dto extends ZodDto(
	___DtoName___Schema,
	'___DtoName___',
) {}
