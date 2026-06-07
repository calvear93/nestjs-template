import { z } from 'zod';

/**
 * ___SchemaName___ Schema.
 */
export const ___SchemaName___Schema = z.object({
	prop: z.string().describe('my prop'),
});

export type ___SchemaName___ = z.infer<typeof ___SchemaName___Schema>;
