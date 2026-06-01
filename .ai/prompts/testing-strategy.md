# Testing Strategy Prompt

Create comprehensive tests for [COMPONENT] following the NestJS template testing patterns:

## 🎯 Testing Requirements

1. **Unit Tests**: Test individual functions and methods in isolation
2. **Integration Tests**: Test component interactions and API endpoints
3. **Mock Strategy**: Use proper mocking with `vitest-mock-extended` and Vitest spies; for real HTTP behavior use the built-in mock server helper
4. **Coverage Goals**: Maintain high test coverage (80%+)
5. **Test Organization**: Follow the project's test structure conventions
6. **Error Scenarios**: Test both success and failure paths

## 📋 Testing Checklist

### Test File Structure

- [ ] Test files use `.spec.ts` suffix for unit tests
- [ ] Test files use `.test.ts` suffix for integration tests
- [ ] Tests follow the project's organizational patterns
- [ ] Proper imports with path aliases (`#libs/`)

### Test Organization Pattern

- [ ] `describe` blocks for component grouping
- [ ] `test` function used instead of `it`
- [ ] Section comments: `// shared variables`, `// mocks`, `// hooks`, `// tests`
- [ ] AAA pattern: `// arrange`, `// act`, `// assert` or `// act & assert`

### Mock Configuration

- [ ] Services mocked with `vitest-mock-extended`
- [ ] HTTP requests mocked with Vitest-friendly helpers (e.g. `createHttpMockServer`) when needed
- [ ] External dependencies properly mocked
- [ ] Mock cleanup in `afterEach` hooks

### Test Coverage

- [ ] Happy path scenarios covered
- [ ] Error scenarios tested
- [ ] Edge cases handled
- [ ] Input validation tested
- [ ] Authentication/authorization scenarios

## 🛠️ Test Templates

### Controller Unit Test Template

```typescript
import { Test, type TestingModule } from '@nestjs/testing';
import { afterEach, beforeAll, describe, expect, test } from 'vitest';
import { mock, mockReset } from 'vitest-mock-extended';
import {
	type Create[ComponentName]Dto,
	type [ComponentName]Dto,
} from '../schemas/[component].dto.ts';
import { [ComponentName]Service } from '../services/[component].service.ts';
import { [ComponentName]Controller } from './[component].controller.ts';

describe([ComponentName]Controller, () => {
	// shared variables
	let controller: [ComponentName]Controller;

	// mocks
	const mockService = mock<[ComponentName]Service>();

	// hooks
	beforeAll(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [[ComponentName]Controller],
			providers: [
				{
					provide: [ComponentName]Service,
					useValue: mockService,
				},
			],
		}).compile();

		controller = module.get([ComponentName]Controller);
	});

	afterEach(() => {
		mockReset(mockService);
	});

	// tests
	test('findAll returns an array of [component]s', async () => {
		// arrange
		const expected: [ComponentName]Dto[] = [{ id: 1, name: 'a name' }];
		mockService.findAll.mockResolvedValue(expected);

		// act
		const result = await controller.findAll();

		// assert
		expect(result).toEqual(expected);
		expect(mockService.findAll).toHaveBeenCalledOnce();
	});

	test('create delegates to the service', async () => {
		// arrange
		const dto: Create[ComponentName]Dto = { name: 'a name' };
		const expected: [ComponentName]Dto = { id: 1, ...dto };
		mockService.create.mockResolvedValue(expected);

		// act
		const result = await controller.create(dto);

		// assert
		expect(result).toEqual(expected);
		expect(mockService.create).toHaveBeenCalledWith(dto);
	});

	test('create rejects when the service throws', async () => {
		// arrange
		const dto = {} as Create[ComponentName]Dto;
		mockService.create.mockRejectedValue(new Error('failed'));

		// act & assert
		await expect(controller.create(dto)).rejects.toThrow();
	});
});
```

### Service Unit Test Template

Services are tested by direct instantiation with `mock<T>()` (no testing module
needed). Reset mocks in `afterEach`.

```typescript
import { afterEach, beforeAll, describe, expect, test } from 'vitest';
import { mock, mockReset } from 'vitest-mock-extended';
import { [ComponentName]Repository } from '../repositories/[component].repository.ts';
import {
	type Create[ComponentName]Dto,
	type [ComponentName]Dto,
} from '../schemas/[component].dto.ts';
import { [ComponentName]Service } from './[component].service.ts';

describe([ComponentName]Service, () => {
	// shared variables
	let service: [ComponentName]Service;

	// mocks
	const mockRepository = mock<[ComponentName]Repository>();

	// hooks
	beforeAll(() => {
		service = new [ComponentName]Service(mockRepository);
	});

	afterEach(() => {
		mockReset(mockRepository);
	});

	// tests
	test('findAll returns [component]s from the repository', async () => {
		// arrange
		const expected: [ComponentName]Dto[] = [{ id: 1, name: 'a name' }];
		mockRepository.findAll.mockResolvedValue(expected);

		// act
		const result = await service.findAll();

		// assert
		expect(result).toEqual(expected);
		expect(mockRepository.findAll).toHaveBeenCalledOnce();
	});

	test('create persists and returns the [component]', async () => {
		// arrange
		const dto: Create[ComponentName]Dto = { name: 'a name' };
		const expected: [ComponentName]Dto = { id: 1, ...dto };
		mockRepository.create.mockResolvedValue(expected);

		// act
		const result = await service.create(dto);

		// assert
		expect(result).toEqual(expected);
		expect(mockRepository.create).toHaveBeenCalledWith(dto);
	});

	test('create propagates repository errors', async () => {
		// arrange
		const dto: Create[ComponentName]Dto = { name: 'a name' };
		mockRepository.create.mockRejectedValue(new Error('database error'));

		// act & assert
		await expect(service.create(dto)).rejects.toThrow('database error');
	});
});
```

### Integration Test Template

Integration tests boot a Fastify app via the `#testing` helper and exercise it
with `app.inject`. Use `HttpStatusCode`/`HttpMethod` from `#libs/http` and the
`#testing` alias for the helper.

```typescript
import { HttpMethod, HttpStatusCode } from '#libs/http';
import { createFastifyApplication } from '#testing';
import { type NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test, type TestingModule } from '@nestjs/testing';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { [ComponentName]Module } from '../[component].module.ts';

describe('[ComponentName] (integration)', () => {
	// shared variables
	let app: NestFastifyApplication;
	let module: TestingModule;

	// hooks
	beforeAll(async () => {
		module = await Test.createTestingModule({
			imports: [[ComponentName]Module],
		}).compile();

		app = await createFastifyApplication(module);
	});

	afterAll(async () => {
		await module.close();
		await app.close();
	});

	// tests
	test('GET /[component] returns the list', async () => {
		// act
		const response = await app.inject({
			method: HttpMethod.GET,
			url: '/[component]',
			headers: { 'ms-api-key': 'test-key' },
		});

		// assert
		expect(response.statusCode).toBe(HttpStatusCode.OK);
	});

	test('GET /[component] rejects a missing api key', async () => {
		// act
		const response = await app.inject({
			method: HttpMethod.GET,
			url: '/[component]',
		});

		// assert
		expect(response.statusCode).toBe(HttpStatusCode.UNAUTHORIZED);
	});

	test('POST /[component] rejects invalid data', async () => {
		// act
		const response = await app.inject({
			method: HttpMethod.POST,
			url: '/[component]',
			headers: {
				'ms-api-key': 'test-key',
				'content-type': 'application/json',
			},
			payload: { name: '' },
		});

		// assert
		expect(response.statusCode).toBe(HttpStatusCode.BAD_REQUEST);
	});
});
```

## 🔍 Testing Best Practices

### Test Organization

1. **Use descriptive test names** that explain the scenario being tested
2. **Group related tests** in describe blocks with clear naming
3. **Follow AAA pattern** consistently across all tests
4. **Keep tests focused** on a single behavior per test

### Mock Strategy

1. **Mock external dependencies** but not the component under test
2. **Use type-safe mocks** with vitest-mock-extended
3. **Reset mocks** between tests to avoid interference
4. **Verify mock interactions** when behavior matters

### Error Testing

1. **Test error scenarios** alongside happy paths
2. **Verify error messages** and status codes
3. **Test validation failures** with invalid inputs
4. **Test authorization failures** with missing/invalid credentials

### Performance Considerations

1. **Keep tests fast** by avoiding unnecessary setup
2. **Use beforeAll for expensive setup** that can be shared
3. **Clean up resources** in afterAll hooks
4. **Parallel test execution** when tests are independent

## 🚀 Running Tests

```bash
# Run all tests with coverage
pnpm test:dev --coverage --run

# Run tests in watch mode
pnpm test:dev

# Run tests for specific file
pnpm test:dev --run [file-pattern]

# Run mutation testing
pnpm test:mutation
```
