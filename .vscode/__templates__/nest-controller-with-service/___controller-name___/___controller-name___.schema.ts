import { z } from 'zod';

/**
 * ___ControllerName___ Schema.
 */
export const ___ControllerName___Schema = z
	.object({
		prop: z.string().describe('my prop'),
	})
	.meta({ id: '___ControllerName___' });

export type ___ControllerName___ = z.infer<typeof ___ControllerName___Schema>;
