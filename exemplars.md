# Code Exemplars

This document identifies high-quality, representative code examples from the NestJS Template project. These exemplars demonstrate our coding standards, architectural patterns, and best practices to help maintain consistency across development teams.

## Introduction

The NestJS Template is a modern, production-ready foundation for building scalable API applications with TypeScript. It emphasizes type safety, comprehensive testing, and developer experience through:

- **Type-safe development** using TypeScript and Zod validation
- **Modern tooling** with Vite, Vitest, and pnpm
- **Built-in libraries** for common patterns (HTTP client, decorators, validation)
- **Comprehensive testing** setup with unit tests, integration tests, and mutation testing
- **Production-ready** configuration with Docker support and environment management

## Core Architecture Patterns

### Application Bootstrap & Configuration

#### Exemplar: Clean Application Initialization

**File**: `src/main.ts` and `src/app/app.ts`

These files demonstrate proper application bootstrap with environment-driven configuration:

Note: reading from `process.env` is fine at the application boundary (entrypoints/bootstrap). Avoid using `process.env` directly inside services/controllers; inject configuration via providers.

```typescript
// src/main.ts - Entry point with environment variables
const PORT = +process.env.PORT;
const BASE_URL = process.env.BASE_URL;
const SWAGGER_ENABLED = process.env.SWAGGER_UI === 'true';

const { dispose } = await start({
	port: PORT,
	prefix: BASE_URL,
	swagger: SWAGGER_ENABLED,
});
```

**Key Principles Demonstrated**:

- Environment variable configuration (no hardcoded values)
- Clean separation of concerns between entry point and app logic
- Hot module replacement support for development
- Proper resource cleanup on shutdown

#### Exemplar: Fastify Integration with Swagger

**File**: `src/app/app.ts`

Shows comprehensive setup including HTTP server, API documentation, and global validation:

```typescript
export const start = async ({ port = 0, prefix, swagger }: AppStartConfig) => {
	const adapter = new FastifyAdapter();
	const app = await NestFactory.create(AppModule, adapter, {
		cors: true,
	});

	app.enableVersioning();
	app.setGlobalPrefix(prefix);
	app.useGlobalPipes(new ZodValidationPipe());

	if (swagger) addSwagger(app, prefix);
	// ...
};
```

**Key Principles Demonstrated**:

- Fastify adapter for high-performance HTTP server
- Global validation pipes for consistent input validation
- API versioning support
- CORS configuration
- Conditional Swagger documentation setup

### Module Organization

#### Exemplar: Feature-Based Module Structure

**File**: `src/app/modules/sample/sample.module.ts`

Demonstrates clean module organization following NestJS best practices:

```typescript
@Module({
	imports: [],
	providers: [SampleService],
	controllers: [SampleController],
})
export class SampleModule {}
```

**Key Principles Demonstrated**:

- Clear separation of providers and controllers
- Feature-based organization (modules by domain)
- Proper dependency injection setup
- No business logic in module files

### Controller Patterns

#### Exemplar: RESTful Controller with Security & Validation

**File**: `src/app/modules/sample/controllers/sample.controller.ts`

Shows comprehensive controller implementation with proper decorators and patterns:

```typescript
@ApiKey()
@Controller({
	path: 'basic',
	version: '1',
})
@ApplyControllerDocs(SampleControllerDocs)
export class SampleController {
	@Post('/dto')
	dto(@Body() sample: SampleDto): SampleDto {
		return sample;
	}

	@Get()
	@AllowAnonymous()
	run(): string {
		return this._service.sample();
	}

	constructor(private readonly _service: SampleService) {}
}
```

**Key Principles Demonstrated**:

- API key authentication with selective anonymous endpoints
- Proper HTTP method decorators
- Parameter validation with pipes (ParseIntPipe)
- Dependency injection with readonly services
- API versioning
- Separation of documentation concerns

#### Exemplar: Comprehensive API Documentation

**File**: `src/app/modules/sample/controllers/sample.controller.docs.ts`

Demonstrates detailed OpenAPI documentation with examples:

```typescript
export const SampleControllerDocs: DecoratorsLookUp<SampleController> = {
	class: [ApiTags('Sample')],
	method: {
		dto: [
			ApiOperation({
				summary: 'Receives, validate and returns a DTO',
			}),
			ApiBody({
				schema: SampleDto.jsonSchema,
				examples: {
					example: {
						value: { id: 1, name: 'a name' },
					},
					'coercion-example': {
						value: { id: '1', name: 'a name' },
					},
				},
			}),
		],
	},
};
```

**Key Principles Demonstrated**:

- Structured documentation with operation summaries
- Request/response schema definitions
- Multiple examples including edge cases
- Proper HTTP status codes
- Type-safe documentation using DTO schemas

### Service Layer

#### Exemplar: Clean Business Logic Implementation

**File**: `src/app/modules/sample/services/sample.service.ts`

Shows simple yet well-documented service implementation:

```typescript
@Injectable()
export class SampleService {
	/**
	 * Returns Hello World.
	 *
	 * @returns sample string
	 */
	sample(): string {
		return 'Hello World';
	}
}
```

**Key Principles Demonstrated**:

- Injectable decorator for dependency injection
- Comprehensive JSDoc documentation
- Single responsibility principle
- Clean, readable method signatures

### Data Transfer Objects & Validation

#### Exemplar: Type-Safe DTO with Zod Schema

**File**: `src/app/modules/sample/schemas/sample.dto.ts`

Demonstrates Zod integration for runtime type validation:

```typescript
const SampleSchema = z
	.object({
		id: z.coerce.number(),
		name: z.string().meta({ description: 'Sample name' }),
	})
	.meta({ description: 'Sample DTO schema' });

export class SampleDto extends ZodDto(SampleSchema, 'Sample') {}
```

**Key Principles Demonstrated**:

- Schema-first approach with Zod
- Automatic type coercion
- OpenAPI schema generation
- Metadata for documentation
- Type-safe class generation

#### Exemplar: Advanced Zod DTO Implementation

**File**: `src/libs/zod/zod-dto.ts`

Shows sophisticated DTO factory with validation and schema generation:

```typescript
export const ZodDto = <Z extends ZodShape, I = z.input<Z>>(
	schema: Z,
	schemaName?: string,
) => {
	return class {
		constructor(input?: I) {
			if (input) Object.assign(this, schema.parse(input));
		}

		static safeFrom(input: I) {
			const { data, error, success } = schema.safeParse(input);
			if (!success) return { error, success: false };
			const instance = Object.assign(new this(), data);
			return { data: instance, success: true };
		}

		static readonly jsonSchema = toJSONSchema(schema, schemaName);
		static readonly schema = schema;
	} as ZodTypeDto<Z, I>;
};
```

**Key Principles Demonstrated**:

- Generic factory pattern for DTO creation
- Safe parsing with error handling
- Automatic JSON schema generation for OpenAPI
- Type-safe constructor with validation
- Static methods for validation utilities

### HTTP Client Library

#### Exemplar: Comprehensive HTTP Client Implementation

**File**: `src/libs/http/http.client.ts`

Demonstrates robust HTTP client with proper error handling:

```typescript
export class HttpClient {
	delete<R>(
		url: RequestURL,
		config: HttpRequestOptions = {},
	): Promise<HttpResponse<R>> | never {
		config.method = HttpMethod.DELETE;
		return this.request(url, config);
	}

	get<R>(
		url: RequestURL,
		config: HttpRequestOptions = {},
	): Promise<HttpResponse<R>> | never {
		config.method = HttpMethod.GET;
		return this.request(url, config);
	}
	// ... additional methods
}
```

**Key Principles Demonstrated**:

- Generic type parameters for response typing
- Consistent method signatures across HTTP verbs
- Proper error handling with custom exceptions
- Timeout and retry capabilities
- Request/response interceptors support

### Custom Decorators & Security

#### Exemplar: Security Guard Factory Pattern

**File**: `src/libs/decorators/security-guard.factory.ts`

Shows advanced decorator patterns for authentication and authorization:

```typescript
export const createSecurityGuard = <
	T extends Record<string, any> = Record<string, any>,
>(
	canActivate: CanActivate<T>,
	options: SecurityGuardOptions = {},
) => {
	class Guard implements CanActivate {
		canActivate(context: ExecutionContext): boolean | Promise<boolean> {
			// implementation
		}
	}
	return Guard;
};
```

**Key Principles Demonstrated**:

- Factory pattern for reusable guards
- Generic type constraints
- Execution context handling
- Metadata reflection for configuration
- Type-safe decorator composition

### Testing Patterns

#### Exemplar: Unit Test Structure with Vitest

**File**: `src/app/modules/sample/services/sample.service.spec.ts`

Demonstrates clean unit testing practices:

```typescript
describe(SampleService, () => {
	let _service: SampleService;

	beforeAll(async () => {
		const module = await Test.createTestingModule({
			providers: [SampleService],
		}).compile();

		_service = module.get(SampleService);
	});

	test('should be defined', () => {
		expect(_service).toBeDefined();
	});

	test('sample() should return Hello World', () => {
		expect(_service.sample()).toBe('Hello World');
	});
});
```

**Key Principles Demonstrated**:

- NestJS testing module setup
- Proper test isolation with beforeAll hooks
- Clear test descriptions
- Assertion best practices

#### Exemplar: Controller Integration Testing

**File**: `src/app/modules/sample/controllers/sample.controller.spec.ts`

Shows controller testing with dependency injection:

```typescript
describe(SampleController, () => {
	let _controller: SampleController;

	beforeAll(async () => {
		const module = await Test.createTestingModule({
			providers: [SampleService],
			controllers: [SampleController],
		}).compile();

		_controller = module.get(SampleController);
	});

	test('sum() of 1 and 2 returns 3', () => {
		const [num1, num2] = [1, 2];
		const expected = num1 + num2;
		expect(_controller.sum(num1, num2)).toBe(expected);
	});
});
```

**Key Principles Demonstrated**:

- Testing module compilation
- Controller instantiation with dependencies
- Parameterized testing
- Clear expected vs actual comparisons

## Architectural Consistency Patterns

### Configuration Management

- **Environment Variables**: All configuration uses `process.env` with proper typing
- **No Hardcoded Values**: Configuration is externalized and environment-specific
- **Schema Validation**: Environment configurations use JSON schema validation

### Import Organization

```typescript
// ✅ CORRECT import order and style
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ZodDto } from '#libs/zod';
import { HttpClient } from '#libs/http';
import { UserService } from '../services/user.service.ts';
```

### Error Handling

- Custom exception classes for domain-specific errors
- Proper HTTP status code mapping
- Structured error responses with consistent format

### Naming Conventions

- PascalCase for classes and interfaces
- camelCase for properties and methods
- Prefix with underscore for private members (`_service`)
- Descriptive names that reflect purpose

## Anti-patterns to Avoid

1. **Don't use `any` type** - Always provide explicit types
2. **Don't hardcode configuration** - Use environment variables
3. **Don't skip validation** - Apply ZodValidationPipe globally
4. **Don't mix concerns** - Keep controllers thin, logic in services
5. **Don't forget testing** - Maintain comprehensive test coverage
6. **Don't ignore documentation** - Document all APIs with OpenAPI

## Recommendations for Maintaining Code Quality

1. **Follow the established patterns** shown in these exemplars
2. **Use the built-in libraries** (Zod, HTTP client, decorators) for consistency
3. **Maintain test coverage** above 80% with both unit and integration tests
4. **Document APIs** comprehensively using the controller.docs.ts pattern
5. **Use conventional commits** with gitmojis for all changes
6. **Run mutation testing** periodically to verify test quality
7. **Follow the linting and formatting** rules established in the project
