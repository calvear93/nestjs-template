# API Endpoint Creation Prompt

Create a new API endpoint for [ENDPOINT_DESCRIPTION] following the NestJS template patterns:

## 🎯 Core Requirements

1. **Zod Schema & DTOs**: Define request/response schemas with proper validation
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
- [ ] Schema names provided for OpenAPI: `ZodDto(schema, 'SchemaName')`
- [ ] Request/response DTOs extend ZodDto properly

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
- [ ] Request/response schemas referenced via `Dto.jsonSchema`

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

`ZodValidationPipe` is registered globally (`app.useGlobalPipes`), so a plain
`@Body()` already validates the incoming `ZodDto`. Note the constructor sorts
**after** the public methods (perfectionist class-member order), and private
members are underscore-prefixed.

```typescript
import { Body, Controller, Get, Post } from '@nestjs/common';
import { AllowAnonymous, ApiKey } from '../../../decorators/api-key.guard.ts';
import { ApplyControllerDocs } from '../../../decorators/docs.decorator.ts';
import { Create[ResourceName]Dto, [ResourceName]Dto } from '../schemas/[resource].dto.ts';
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
	findAll(): Promise<[ResourceName]Dto[]> {
		return this._service.findAll();
	}

	@Post()
	create(@Body() dto: Create[ResourceName]Dto): Promise<[ResourceName]Dto> {
		return this._service.create(dto);
	}

	constructor(private readonly _service: [ResourceName]Service) {}
}
```

### Zod Schema Template

```typescript
import { epoch, phone, ZodDto } from '#libs/zod';
import { z } from 'zod';

const [ResourceName]Schema = z
	.object({
		id: z.coerce.number().positive(),
		name: z.string().min(1).max(100),
		email: z.email(),
		phone: phone().optional(),
		createdAt: epoch(),
		updatedAt: epoch(),
	})
	.meta({ description: '[ResourceName] entity' });

export class [ResourceName]Dto extends ZodDto([ResourceName]Schema, '[ResourceName]') {}

const Create[ResourceName]Schema = [ResourceName]Schema.omit({
	id: true,
	createdAt: true,
	updatedAt: true,
});

export class Create[ResourceName]Dto extends ZodDto(
	Create[ResourceName]Schema,
	'Create[ResourceName]',
) {}
```

### Controller Documentation Template

Keep heavy `@Api*()` decorators out of the controller body. Type the docs map
with `DecoratorsLookUp<Controller>`; keys are `class`, `common`, and `method`
(one entry per handler). Reference the DTO schema via `Dto.jsonSchema`.

```typescript
import { HttpStatusCode } from '#libs/http';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { type DecoratorsLookUp } from '../../../../libs/decorators/apply.decorator.ts';
import { Create[ResourceName]Dto, [ResourceName]Dto } from '../schemas/[resource].dto.ts';
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
					schema: [ResourceName]Dto.jsonSchema,
					isArray: true,
				}),
			],
			create: [
				ApiOperation({ summary: 'Create a new [resource]' }),
				ApiBody({ schema: Create[ResourceName]Dto.jsonSchema }),
				ApiResponse({
					description: '[ResourceName] created',
					status: HttpStatusCode.CREATED,
					schema: [ResourceName]Dto.jsonSchema,
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
