# Skill: testing

Vitest 5 + `vitest-mock-extended`. Reference code: `src/app/modules/sample/**/*.spec.ts` and
`src/__tests__/app.test.ts`. Scaffolds: `nest-test`, `vitest-test`.

## Where

- Unit specs sit next to the source as `*.spec.ts`. App-level HTTP integration tests go in
  `src/__tests__/*.test.ts`. Benchmarks are `*.bench.ts`, run with `pnpm test:bench`.

## Shape

```ts
// describe() takes the class reference, not a string
describe(UsersService, () => {
	let _service: UsersService;
	const _httpMock = mock<HttpClient>();

	// hooks
	beforeAll(() => {
		_service = new UsersService(_httpMock);
	});

	// tests
	test('findOne() throws NotFoundException when missing', async () => { … });
});
```

- Use the `// hooks` / `// tests` section comments and arrange → act → assert.
- **Services:** construct them directly with `mock<T>()` dependencies.
- **Controllers:** `Test.createTestingModule({ controllers, providers })`, overriding with
  `{ provide, useValue }`.
- **HTTP level:** `createFastifyApplication(module)` from `#testing` mirrors the global pipe and
  versioning; then call `app.inject({ method, url })`. Use `.overrideProvider(X).useValue(mock)`
  on the testing module.
- **Env:** `mockEnv` / `restoreEnv` / `restoreAllEnv` from `#testing`. Modules that read env at
  import (the API key guard) need the env set before a dynamic `import()`.
- **External HTTP:** `src/libs/http/__mocks__/create-http-mock-server.mock.ts`.
- Cover the happy path, edge cases and the error path. The coverage target is ≥ 80%:
  `--coverage` reports it and no threshold fails the run; what it leaves out is
  `vitest.config.ts` → `coverage.exclude` (bootstrap, barrels, mocks, fixtures, `__tests__`).
