import { z } from 'zod';

/**
 * The shape lives in `_SampleSchema`; the exported `SampleSchema` is its
 * `z.compile()` clone (Zod 4.5) — an AOT fast validation path that falls
 * back to the runtime parser for anything it can't model. Same public API,
 * same inferred type.
 *
 * `.meta({ id })` goes on the base **before** `z.compile()`: it registers
 * this as a named, reusable OpenAPI component. Order matters — `.meta()`
 * after `z.compile()` re-clones and drops the compiled fast path. See
 * `#libs/zod`'s README, "`z.compile()` and the OpenAPI document".
 */
const _SampleSchema = z
	.object({
		id: z.coerce.number(),
		name: z.string().meta({ description: 'Sample name' }),
	})
	.meta({ id: 'Sample', description: 'Sample schema' });

export const SampleSchema = z.compile(_SampleSchema);

export type Sample = z.infer<typeof SampleSchema>;
