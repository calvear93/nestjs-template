---
mode: agent
description: 'Create comprehensive tests following NestJS template testing patterns'
---

# Testing Strategy Prompt

Create comprehensive tests for [COMPONENT] following the NestJS template testing patterns:

## 🎯 Testing Requirements

1. **Unit Tests**: Test individual functions and methods in isolation
2. **Integration Tests**: Test component interactions and API endpoints
3. **Mock Strategy**: Use proper mocking with vitest-mock-extended and MSW
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
- [ ] HTTP requests mocked with MSW when needed
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
import { Test, TestingModule } from '@nestjs/testing';
import { beforeAll, afterEach, describe, expect, test, vi } from 'vitest';
import { mock, mockReset } from 'vitest-mock-extended';
import { [ComponentName]Controller } from './[component].controller.ts';
import { [ComponentName]Service } from '../services/[component].service.ts';
import { [ComponentName]Dto, Create[ComponentName]Dto } from '../schemas/[component].dto.ts';

describe('[ComponentName]Controller', () => {
  // shared variables
  let controller: [ComponentName]Controller;
  let module: TestingModule;

  // mocks
  const mockService = mock<[ComponentName]Service>();

  // hooks
  beforeAll(async () => {
    module = await Test.createTestingModule({
      controllers: [[ComponentName]Controller],
      providers: [
        {
          provide: [ComponentName]Service,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<[ComponentName]Controller>([ComponentName]Controller);
  });

  afterEach(() => {
    mockReset(mockService);
  });

  // tests
  describe('when finding all [component]s', () => {
    test('should return array of [component]s', async () => {
      // arrange
      const expected[ComponentName]s: [ComponentName]Dto[] = [
        { id: 1, name: 'Test [Component]' },
      ];
      mockService.findAll.mockResolvedValue(expected[ComponentName]s);

      // act
      const result = await controller.findAll();

      // assert
      expect(result).toEqual(expected[ComponentName]s);
      expect(mockService.findAll).toHaveBeenCalledOnce();
    });
  });

  describe('when creating [component]', () => {
    test('should create and return [component]', async () => {
      // arrange
      const create[ComponentName]Dto: Create[ComponentName]Dto = {
        name: 'New [Component]',
      };
      const expected[ComponentName]: [ComponentName]Dto = {
        id: 1,
        ...create[ComponentName]Dto,
      };
      mockService.create.mockResolvedValue(expected[ComponentName]);

      // act
      const result = await controller.create(create[ComponentName]Dto);

      // assert
      expect(result).toEqual(expected[ComponentName]);
      expect(mockService.create).toHaveBeenCalledWith(create[ComponentName]Dto);
    });

    test('should throw BadRequestException for invalid data', async () => {
      // arrange
      const invalidData = {} as Create[ComponentName]Dto;
      mockService.create.mockRejectedValue(new Error('Validation failed'));

      // act & assert
      expect(() => controller.create(invalidData)).rejects.toThrow();
    });
  });
});
```

### Service Unit Test Template

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { beforeAll, afterEach, describe, expect, test, vi } from 'vitest';
import { mock, mockReset } from 'vitest-mock-extended';
import { [ComponentName]Service } from './[component].service.ts';
import { [ComponentName]Repository } from '../repositories/[component].repository.ts';
import { [ComponentName]Dto, Create[ComponentName]Dto } from '../schemas/[component].dto.ts';

describe('[ComponentName]Service', () => {
  // shared variables
  let service: [ComponentName]Service;
  let module: TestingModule;

  // mocks
  const mockRepository = mock<[ComponentName]Repository>();

  // hooks
  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        [ComponentName]Service,
        {
          provide: [ComponentName]Repository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<[ComponentName]Service>([ComponentName]Service);
  });

  afterEach(() => {
    mockReset(mockRepository);
  });

  // tests
  describe('when finding all [component]s', () => {
    test('should return all [component]s from repository', async () => {
      // arrange
      const expected[ComponentName]s: [ComponentName]Dto[] = [
        { id: 1, name: 'Test [Component]' },
      ];
      mockRepository.findAll.mockResolvedValue(expected[ComponentName]s);

      // act
      const result = await service.findAll();

      // assert
      expect(result).toEqual(expected[ComponentName]s);
      expect(mockRepository.findAll).toHaveBeenCalledOnce();
    });
  });

  describe('when creating [component]', () => {
    test('should create [component] successfully', async () => {
      // arrange
      const create[ComponentName]Dto: Create[ComponentName]Dto = {
        name: 'New [Component]',
      };
      const expected[ComponentName]: [ComponentName]Dto = {
        id: 1,
        ...create[ComponentName]Dto,
      };
      mockRepository.create.mockResolvedValue(expected[ComponentName]);

      // act
      const result = await service.create(create[ComponentName]Dto);

      // assert
      expect(result).toEqual(expected[ComponentName]);
      expect(mockRepository.create).toHaveBeenCalledWith(create[ComponentName]Dto);
    });

    test('should handle repository errors', async () => {
      // arrange
      const create[ComponentName]Dto: Create[ComponentName]Dto = {
        name: 'Invalid [Component]',
      };
      mockRepository.create.mockRejectedValue(new Error('Database error'));

      // act & assert
      expect(() => service.create(create[ComponentName]Dto)).rejects.toThrow('Database error');
    });
  });
});
```

### Integration Test Template

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { beforeAll, afterAll, describe, expect, test } from 'vitest';
import { [ComponentName]Module } from '../[component].module.ts';
import { createFastifyApplication } from '../../../__tests__/utils/fastify-test-module.ts';

describe('[ComponentName] Integration', () => {
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
    await app.close();
  });

  // tests
  describe('GET /[component]', () => {
    test('should return list of [component]s', async () => {
      // act
      const response = await app.inject({
        method: 'GET',
        url: '/[component]',
        headers: {
          'x-api-key': 'test-key',
        },
      });

      // assert
      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual(expect.arrayContaining([]));
    });

    test('should return 401 without API key', async () => {
      // act
      const response = await app.inject({
        method: 'GET',
        url: '/[component]',
      });

      // assert
      expect(response.statusCode).toBe(401);
    });
  });

  describe('POST /[component]', () => {
    test('should create [component] with valid data', async () => {
      // arrange
      const create[ComponentName]Data = {
        name: 'Test [Component]',
      };

      // act
      const response = await app.inject({
        method: 'POST',
        url: '/[component]',
        headers: {
          'x-api-key': 'test-key',
          'content-type': 'application/json',
        },
        payload: create[ComponentName]Data,
      });

      // assert
      expect(response.statusCode).toBe(201);
      expect(response.json()).toMatchObject(create[ComponentName]Data);
    });

    test('should return 400 for invalid data', async () => {
      // arrange
      const invalidData = {
        name: '', // Invalid: empty name
      };

      // act
      const response = await app.inject({
        method: 'POST',
        url: '/[component]',
        headers: {
          'x-api-key': 'test-key',
          'content-type': 'application/json',
        },
        payload: invalidData,
      });

      // assert
      expect(response.statusCode).toBe(400);
    });
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
