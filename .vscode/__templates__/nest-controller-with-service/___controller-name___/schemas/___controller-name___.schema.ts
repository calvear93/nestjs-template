import { z } from 'zod';

/**
 * The shape lives in the private `_`-prefixed base; the exported
 * `___ControllerName___Schema` is its `z.compile()` clone (Zod 4.5) — an AOT
 * fast validation path with automatic fallback to the runtime parser. Same
 * public API, same inferred type.
 *
 * `.meta({ id })` goes on the `_`-prefixed base **before** `z.compile()`: it
 * registers this as a named, reusable OpenAPI component. Without an `id` a
 * schema always renders inline and never appears under the document's
 * `components.schemas`. See #libs/zod's README, "OpenAPI Integration".
 */
const ____ControllerName___Schema = z
	.object({
		prop: z.string().describe('my prop'),
	})
	.meta({ id: '___ControllerName___' });

export const ___ControllerName___Schema = z.compile(
	____ControllerName___Schema,
);

export type ___ControllerName___ = z.infer<typeof ___ControllerName___Schema>;
