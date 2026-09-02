import { z } from 'zod';

/**
 * The shape lives in the private `_`-prefixed base; the exported
 * `___SchemaName___Schema` is its `z.compile()` clone (Zod 4.5) — an AOT fast
 * validation path with automatic fallback to the runtime parser. Same public
 * API, same inferred type. For a schema that must appear as a named OpenAPI
 * component, add `.meta({ id: 'Name' })` on the `_`-prefixed base, before
 * `z.compile()`.
 */
const ____SchemaName___Schema = z.object({
	prop: z.string().describe('my prop'),
});

export const ___SchemaName___Schema = z.compile(____SchemaName___Schema);

export type ___SchemaName___ = z.infer<typeof ___SchemaName___Schema>;
