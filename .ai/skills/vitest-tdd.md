# Skill: Vitest TDD (NestJS)

Drive implementation test-first with Vitest + `vitest-mock-extended`, the way this template's
ESLint (`vitest`) expects.

## When to use

Writing or reviewing any test; implementing a task in the SDD loop.

## Red → green → refactor

1. **Red:** write the test for the next acceptance criterion; run `pnpm test:dev --run` and
   see it fail for the right reason.
2. **Green:** implement the minimum to pass.
3. **Refactor:** clean up while green. Keep assertions meaningful (mutation-aware).

## Rules (lint-enforced)

- Use `test()` (not `it`) and group with `describe(...)`.
- Structure each test as arrange/act/assert, and order the file with the section comments
  `// shared variables` / `// mocks` / `// hooks` / `// tests`.
- **Services:** test by direct instantiation, passing `mock<T>()` dependencies from
  `vitest-mock-extended`. **Controllers / DI graphs:** build with `Test.createTestingModule`
  and override providers via `useValue`.
- Async rejections: `await expect(promise).rejects.toThrow(...)`.
- Test files: `*.spec.ts`, co-located with source.

## Shape

```typescript
import { beforeAll, describe, expect, test } from 'vitest';
import { mock } from 'vitest-mock-extended';
import { HttpClient } from '#libs/http';
import { UserService } from './user.service.ts';

describe(UserService, () => {
	// mocks
	const httpClient = mock<HttpClient>();

	// shared variables
	let _service: UserService;

	// hooks
	beforeAll(() => {
		_service = new UserService(httpClient);
	});

	// tests
	test('returns the user when found', async () => {
		const user = { id: 1, name: 'John Doe' };
		httpClient.get.mockResolvedValue(user);

		const result = await _service.findOne(1);

		expect(result).toEqual(user);
	});
});
```

Cover happy path + error path + ≥ 1 edge case. Target ≥ 80% coverage; use
`pnpm test:mutation` to validate test strength on critical logic. Full recipes:
`.github/instructions/patterns.instructions.md` → Testing patterns.
