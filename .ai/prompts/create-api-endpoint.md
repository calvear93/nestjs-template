# API Endpoint Creation Prompt

Create a new API endpoint for [ENDPOINT_DESCRIPTION] following the NestJS template patterns:

## 🎯 Core Requirements

1. **Zod Schemas**: Define request/response schemas with proper validation
2. **Controller Implementation**: Use proper HTTP methods and status codes
3. **Security**: Apply `@ApiKey()` or `@AllowAnonymous()` decorators appropriately
4. **OpenAPI Documentation**: Include comprehensive Swagger documentation
5. **Error Handling**: Implement proper error responses with meaningful messages
6. **Testing**: Create unit tests for controller and service methods
7. **Type Safety**: Ensure end-to-end type safety from request to response
8. **Configuration**: Use dependency injection for any external dependencies

## 📋 Implementation Checklist

### Schema & Validation

- [ ] Zod schema defined with proper validation rules
- [ ] Custom validators used where appropriate (`phone()`, `epoch()`)
- [ ] Schema registered for OpenAPI: `.meta({ id: 'SchemaName' })`
- [ ] Request schema passed via `@Body`/`@Query`/`@Param({ schema })`

### Controller Implementation

- [ ] Thin controller (HTTP only); business logic lives in the service
- [ ] Proper HTTP verb and status code (`@HttpCode` for 201/204)
- [ ] Security decorator applied: `@ApiKey()` (class) / `@AllowAnonymous()`
- [ ] Documentation applied: `@ApplyControllerDocs([Resource]ControllerDocs)`
- [ ] Constructor injection with underscore-prefixed private deps

### OpenAPI Documentation

- [ ] Heavy `@Api*()` decorators live in the colocated `*.controller.docs.ts`,
      typed as `DecoratorsLookUp<Controller>` (not in the controller body)
- [ ] `ApiOperation` per handler; `ApiResponse` for success and error cases
- [ ] Response schemas referenced via `ApiResponse({ standardSchema: Schema })`; `ApiBody`'s
      `schema:` is inert (overwritten by the reflected `@Body({ schema })`) — only its
      `examples:` matters

### Service Layer

- [ ] Business logic separated into the service
- [ ] Config injected via DI tokens from `src/app/config/` (never `process.env`)
- [ ] `async`/`await` with NestJS HTTP exceptions on the error path
- [ ] Logging via NestJS `Logger` (never `console.log`)

### Testing

- [ ] Controller unit tests with mock services
- [ ] Service unit tests with proper test data
- [ ] Happy path scenarios covered
- [ ] Error scenarios tested
- [ ] Integration tests if needed

## 🛠️ Code Generation Templates

### Basic Controller Structure

The global `StandardSchemaValidationPipe` validates any parameter decorated with a `schema`
option, so `@Body({ schema: Create[ResourceName]Schema })` is all the validation a handler
needs. Note the constructor sorts **after** the public methods (perfectionist class-member
order), and private members are underscore-prefixed.

```typescript
import { Body, Controller, Get, Post } from '@nestjs/common';
import { AllowAnonymous, ApiKey } from '../../../decorators/api-key.guard.ts';
import { ApplyControllerDocs } from '../../../decorators/docs.decorator.ts';
import {
	type Create[ResourceName],
	Create[ResourceName]Schema,
	type [ResourceName],
} from '../schemas/[resource].schema.ts';
import { [ResourceName]Service } from '../services/[resource].service.ts';
import { [ResourceName]ControllerDocs } from './[resource].controller.docs.ts';

@ApiKey()
@Controller({
	path: '[resource]',
	version: '1',
})
@ApplyControllerDocs([ResourceName]ControllerDocs)
export class [ResourceName]Controller {
	@Get()
	findAll(): Promise<[ResourceName][]> {
		return this._service.findAll();
	}

	@Post()
	create(
		@Body({ schema: Create[ResourceName]Schema }) dto: Create[ResourceName],
	): Promise<[ResourceName]> {
		return this._service.create(dto);
	}

	constructor(private readonly _service: [ResourceName]Service) {}
}
```

### Zod Schema Template

```typescript
import { epoch, phone } from '#libs/zod';
import { z } from 'zod';

// private `_`-prefixed base; the exported schema is its `z.compile()` clone
// (Zod 4.5 AOT fast path, runtime-parser fallback — same API and type)
const _[ResourceName]Schema = z
	.object({
		id: z.coerce.number().positive(),
		name: z.string().min(1).max(100),
		email: z.email(),
		phone: phone().optional(), // left uncompiled — building block
		createdAt: epoch(), // left uncompiled — building block
		updatedAt: epoch(),
	})
	.meta({ id: '[ResourceName]' });

export const [ResourceName]Schema = z.compile(_[ResourceName]Schema);

export type [ResourceName] = z.infer<typeof [ResourceName]Schema>;

// derived schemas are not compiled by inheritance — re-wrap them
export const Create[ResourceName]Schema = z.compile(
	_[ResourceName]Schema.omit({
		id: true,
		createdAt: true,
		updatedAt: true,
	}).meta({ id: 'Create[ResourceName]' }),
);

export type Create[ResourceName] = z.infer<typeof Create[ResourceName]Schema>;
```

### Controller Documentation Template

Keep heavy `@Api*()` decorators out of the controller body. Type the docs map
with `DecoratorsLookUp<Controller>`; keys are `class`, `common`, and `method`
(one entry per handler). Reference response schemas via `ApiResponse({ standardSchema })`
(`isArray: true` combines with it for list responses); `ApiBody`'s `schema:` is inert
(NestJS overwrites it from the reflected `@Body({ schema })`) — pass a placeholder and rely
on `examples:` for anything worth documenting there.

```typescript
import { HttpStatusCode } from '#libs/http';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { type DecoratorsLookUp } from '#libs/decorators';
import { [ResourceName]Schema } from '../schemas/[resource].schema.ts';
import { type [ResourceName]Controller } from './[resource].controller.ts';

export const [ResourceName]ControllerDocs: DecoratorsLookUp<[ResourceName]Controller> =
	{
		class: [ApiTags('[ResourceName]')],
		method: {
			findAll: [
				ApiOperation({ summary: 'Get all [resource]s' }),
				ApiResponse({
					description: 'List of [resource]s',
					status: HttpStatusCode.OK,
					standardSchema: [ResourceName]Schema,
					isArray: true,
				}),
			],
			create: [
				ApiOperation({ summary: 'Create a new [resource]' }),
				ApiBody({
					// inert placeholder — NestJS overwrites it with the schema
					// derived from @Body({ schema }) on the controller method
					schema: { type: 'object' },
				}),
				ApiResponse({
					description: '[ResourceName] created',
					status: HttpStatusCode.CREATED,
					standardSchema: [ResourceName]Schema,
				}),
				ApiResponse({
					description: 'Invalid input data',
					status: HttpStatusCode.BAD_REQUEST,
				}),
			],
		},
	};
```

## 🔍 Quality Validation

Before considering the endpoint complete, verify:

1. **Security**: Is the endpoint properly secured with appropriate decorators?
2. **Validation**: Are all inputs validated with Zod schemas?
3. **Documentation**: Does the OpenAPI documentation clearly explain the endpoint?
4. **Error Handling**: Are errors handled gracefully with meaningful messages?
5. **Testing**: Do tests cover both success and failure scenarios?
6. **Type Safety**: Is the entire flow type-safe from request to response?
7. **Performance**: Are there any obvious performance issues?
8. **Standards**: Does the code follow the project's coding standards?
