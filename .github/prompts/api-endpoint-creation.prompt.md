---
mode: agent
description: 'Create a new API endpoint following NestJS template standards and best practices'
---

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

- [ ] Controller uses proper HTTP verb (GET, POST, PUT, PATCH, DELETE)
- [ ] Correct HTTP status codes returned (200, 201, 204, 400, 404, etc.)
- [ ] Security decorator applied: `@ApiKey()` or `@AllowAnonymous()`
- [ ] Controller documentation applied: `@ApplyControllerDocs(DocsObject)`
- [ ] Proper dependency injection in constructor
- [ ] Error handling with try-catch where needed

### OpenAPI Documentation

- [ ] `@ApiOperation()` with clear summary and description
- [ ] `@ApiResponse()` for success and error responses
- [ ] `@ApiBody()` for request body documentation (POST/PUT)
- [ ] `@ApiQuery()` for query parameters
- [ ] `@ApiParam()` for path parameters
- [ ] Examples provided for request/response bodies

### Service Layer

- [ ] Business logic separated into service
- [ ] Service properly injected into controller
- [ ] Configuration injected via dynamic providers (not hardcoded)
- [ ] Async/await patterns used consistently
- [ ] Proper error handling and logging

### Testing

- [ ] Controller unit tests with mock services
- [ ] Service unit tests with proper test data
- [ ] Happy path scenarios covered
- [ ] Error scenarios tested
- [ ] Integration tests if needed

## 🛠️ Code Generation Templates

### Basic Controller Structure

```typescript
import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiKey, AllowAnonymous } from '../../decorators/api-key.guard.ts';
import { ApplyControllerDocs } from '../../decorators/docs.decorator.ts';
import { [ResourceName]Service } from '../services/[resource].service.ts';
import { [ResourceName]Dto, Create[ResourceName]Dto } from '../schemas/[resource].dto.ts';
import { [ResourceName]ControllerDocs } from './[resource].controller.docs.ts';

@ApiKey()
@Controller({
	path: '[resource]',
	version: '1',
})
@ApplyControllerDocs([ResourceName]ControllerDocs)
export class [ResourceName]Controller {
	constructor(private readonly [resource]Service: [ResourceName]Service) {}

	@Get()
	async findAll(): Promise<[ResourceName]Dto[]> {
		return this.[resource]Service.findAll();
	}

	@Post()
	async create(@Body() create[ResourceName]Dto: Create[ResourceName]Dto): Promise<[ResourceName]Dto> {
		return this.[resource]Service.create(create[ResourceName]Dto);
	}
}
```

### Zod Schema Template

```typescript
import { z } from 'zod';
import { ZodDto, phone, epoch } from '#libs/zod';

const [ResourceName]Schema = z.object({
	id: z.coerce.number().positive(),
	name: z.string().min(1).max(100),
	email: z.email(),
	phone: phone().optional(),
	createdAt: epoch(),
	updatedAt: epoch(),
}).describe('[ResourceName] entity schema');

export class [ResourceName]Dto extends ZodDto([ResourceName]Schema, '[ResourceName]') {}

const Create[ResourceName]Schema = [ResourceName]Schema.omit({
	id: true,
	createdAt: true,
	updatedAt: true
});

export class Create[ResourceName]Dto extends ZodDto(Create[ResourceName]Schema, 'Create[ResourceName]') {}
```

### Controller Documentation Template

```typescript
import { ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { HttpStatusCode } from '#libs/http';
import { [ResourceName]Dto, Create[ResourceName]Dto } from '../schemas/[resource].dto.ts';

export const [ResourceName]ControllerDocs = {
	findAll: [
		ApiOperation({
			summary: 'Get all [resource]s',
			description: 'Retrieves a list of all [resource]s with pagination support',
		}),
		ApiResponse({
			status: HttpStatusCode.OK,
			description: 'List of [resource]s retrieved successfully',
			type: [ResourceName]Dto,
			isArray: true,
		}),
	],
	create: [
		ApiOperation({
			summary: 'Create a new [resource]',
			description: 'Creates a new [resource] with the provided data',
		}),
		ApiBody({
			type: Create[ResourceName]Dto,
			description: '[ResourceName] creation data',
			examples: {
				'valid-example': {
					description: 'Valid [resource] data',
					value: {
						name: 'Example [Resource]',
						email: 'example@domain.com',
					},
				},
			},
		}),
		ApiResponse({
			status: HttpStatusCode.CREATED,
			description: '[ResourceName] created successfully',
			type: [ResourceName]Dto,
		}),
		ApiResponse({
			status: HttpStatusCode.BAD_REQUEST,
			description: 'Invalid input data',
		}),
	],
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
