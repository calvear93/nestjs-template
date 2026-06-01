---
mode: agent
description: 'Create a complete NestJS module following template patterns'
---

# Module Creation Prompt

Create a complete NestJS module for [MODULE_NAME] following the template's modular architecture:

## 🎯 Module Structure Requirements

1. **Feature-based organization** under `src/app/modules/[module-name]/`
2. **Complete CRUD operations** with proper error handling
3. **Zod validation** for all DTOs
4. **Security decorators** applied appropriately
5. **OpenAPI documentation** with examples
6. **Unit and integration tests** with high coverage
7. **Proper dependency injection** and configuration management

## 📁 Directory Structure

```
src/app/modules/[module-name]/
├── [module-name].module.ts          # Module definition
├── controllers/
│   ├── [module-name].controller.ts        # REST API controller
│   ├── [module-name].controller.spec.ts   # Controller unit tests
│   └── [module-name].controller.docs.ts   # OpenAPI documentation
├── services/
│   ├── [module-name].service.ts           # Business logic service
│   └── [module-name].service.spec.ts      # Service unit tests
├── schemas/
│   └── [module-name].dto.ts               # Zod schemas and DTOs
└── repositories/ (if needed)
    ├── [module-name].repository.ts        # Data access layer
    └── [module-name].repository.spec.ts   # Repository tests
```

## 📋 Implementation Checklist

### Module Definition

- [ ] `@Module` decorator with proper imports/exports
- [ ] Controllers registered in `controllers` array
- [ ] Services registered in `providers` array
- [ ] Proper imports from other modules if needed
- [ ] Configuration providers if external dependencies exist

### DTOs and Schemas

- [ ] Zod schemas with comprehensive validation rules
- [ ] Custom validators used where appropriate (`phone()`, `epoch()`)
- [ ] Schema names provided for OpenAPI generation
- [ ] CRUD DTOs: Create, Update, Response DTOs
- [ ] Proper type inference and exports

### Controller Implementation

- [ ] RESTful endpoint structure (GET, POST, PUT, PATCH, DELETE)
- [ ] Proper HTTP status codes for each operation
- [ ] Security decorators: `@ApiKey()` or `@AllowAnonymous()`
- [ ] Request validation with Zod DTOs
- [ ] Error handling with meaningful responses
- [ ] OpenAPI documentation applied

### Service Layer

- [ ] Business logic separated from controllers
- [ ] Proper error handling and validation
- [ ] Configuration injected via dependency injection
- [ ] Async/await patterns used consistently
- [ ] Logging with appropriate context

### Testing Strategy

- [ ] Unit tests for controllers with mocked services
- [ ] Unit tests for services with mocked dependencies
- [ ] Integration tests for API endpoints
- [ ] Error scenario testing
- [ ] Mock cleanup and proper test isolation

## 🛠️ Code Generation Templates

### Module Definition Template

```typescript
import { Module } from '@nestjs/common';
import { [ModuleName]Controller } from './controllers/[module-name].controller.ts';
import { [ModuleName]Service } from './services/[module-name].service.ts';

@Module({
	controllers: [[ModuleName]Controller],
	providers: [[ModuleName]Service],
	exports: [[ModuleName]Service], // Export if other modules need it
})
export class [ModuleName]Module {}
```

### Complete DTO Schema Template

```typescript
import { epoch, phone, ZodDto } from '#libs/zod';
import { z } from 'zod';

// base entity schema
const [ModuleName]Schema = z
	.object({
		id: z.coerce.number().positive(),
		name: z.string().min(1).max(100),
		description: z.string().max(500).optional(),
		status: z.enum(['active', 'inactive', 'pending']).default('pending'),
		email: z.email().optional(),
		phone: phone().optional(),
		metadata: z.record(z.string(), z.unknown()).optional(),
		createdAt: epoch(),
		updatedAt: epoch(),
	})
	.meta({ description: '[ModuleName] entity' });

// response DTO
export class [ModuleName]Dto extends ZodDto([ModuleName]Schema, '[ModuleName]') {}

// create DTO (omit generated fields)
const Create[ModuleName]Schema = [ModuleName]Schema.omit({
	id: true,
	createdAt: true,
	updatedAt: true,
});

export class Create[ModuleName]Dto extends ZodDto(
	Create[ModuleName]Schema,
	'Create[ModuleName]',
) {}

// update DTO (partial with omitted fields)
const Update[ModuleName]Schema = [ModuleName]Schema
	.omit({
		id: true,
		createdAt: true,
		updatedAt: true,
	})
	.partial();

export class Update[ModuleName]Dto extends ZodDto(
	Update[ModuleName]Schema,
	'Update[ModuleName]',
) {}

// query DTO for filtering
const [ModuleName]QuerySchema = z.object({
	page: z.coerce.number().min(1).default(1),
	limit: z.coerce.number().min(1).max(100).default(10),
	status: z.enum(['active', 'inactive', 'pending']).optional(),
	search: z.string().min(1).optional(),
	sortBy: z.enum(['name', 'createdAt', 'updatedAt']).default('createdAt'),
	sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export class [ModuleName]QueryDto extends ZodDto(
	[ModuleName]QuerySchema,
	'[ModuleName]Query',
) {}
```

### Service Template

Inject config and external dependencies through the constructor (it sorts after
the methods). Throw NestJS HTTP exceptions on the error path and log with `Logger`.
Replace the mocked bodies with real repository/HTTP calls.

```typescript
import {
	ConflictException,
	Injectable,
	Logger,
	NotFoundException,
} from '@nestjs/common';
import {
	type Create[ModuleName]Dto,
	type [ModuleName]Dto,
	type [ModuleName]QueryDto,
	type Update[ModuleName]Dto,
} from '../schemas/[module-name].dto.ts';

@Injectable()
export class [ModuleName]Service {
	/**
	 * retrieves all [module-name]s with optional filtering and pagination.
	 *
	 * @param query - filtering and pagination parameters
	 * @returns array of [module-name]s
	 */
	async findAll(query: [ModuleName]QueryDto): Promise<[ModuleName]Dto[]> {
		this._logger.log(`finding [module-name]s`, query);

		// TODO: replace with repository call
		return Promise.resolve([]);
	}

	/**
	 * retrieves a single [module-name] by id.
	 *
	 * @param id - [module-name] id
	 * @returns the [module-name]
	 * @throws NotFoundException when it does not exist
	 */
	async findById(id: number): Promise<[ModuleName]Dto> {
		const result = await this._repository.findById(id);

		if (!result) {
			throw new NotFoundException(`[module-name] ${id} not found`);
		}

		return result;
	}

	/**
	 * creates a new [module-name].
	 *
	 * @param dto - [module-name] creation data
	 * @returns the created [module-name]
	 * @throws ConflictException when the name already exists
	 */
	async create(dto: Create[ModuleName]Dto): Promise<[ModuleName]Dto> {
		if (await this._repository.existsByName(dto.name)) {
			throw new ConflictException(`'${dto.name}' already exists`);
		}

		const result = await this._repository.create(dto);
		this._logger.log(`created [module-name] ${result.id}`);

		return result;
	}

	/**
	 * updates an existing [module-name].
	 *
	 * @param id - [module-name] id
	 * @param dto - [module-name] update data
	 * @returns the updated [module-name]
	 * @throws NotFoundException when it does not exist
	 */
	async update(
		id: number,
		dto: Update[ModuleName]Dto,
	): Promise<[ModuleName]Dto> {
		await this.findById(id);

		return this._repository.update(id, dto);
	}

	/**
	 * deletes a [module-name] by id.
	 *
	 * @param id - [module-name] id
	 * @throws NotFoundException when it does not exist
	 */
	async delete(id: number): Promise<void> {
		await this.findById(id);
		await this._repository.delete(id);
	}

	private readonly _logger = new Logger([ModuleName]Service.name);

	constructor(
		private readonly _repository: [ModuleName]Repository,
		// inject config via a DI token, e.g.:
		// @Inject('[MODULE_NAME]_CONFIG') private readonly _config: [ModuleName]Config,
	) {}
}
```

### Controller Template

Thin controller: `@Body()` is validated by the global `ZodValidationPipe`; query
DTOs (with coercion) are too. The constructor sorts after the handlers.

```typescript
import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	ParseIntPipe,
	Post,
	Put,
	Query,
} from '@nestjs/common';
import { ApiKey } from '../../../decorators/api-key.guard.ts';
import { ApplyControllerDocs } from '../../../decorators/docs.decorator.ts';
import {
	type Create[ModuleName]Dto,
	type [ModuleName]Dto,
	type [ModuleName]QueryDto,
	type Update[ModuleName]Dto,
} from '../schemas/[module-name].dto.ts';
import { [ModuleName]Service } from '../services/[module-name].service.ts';
import { [ModuleName]ControllerDocs } from './[module-name].controller.docs.ts';

@ApiKey()
@Controller({
	path: '[module-name]',
	version: '1',
})
@ApplyControllerDocs([ModuleName]ControllerDocs)
export class [ModuleName]Controller {
	@Get()
	findAll(@Query() query: [ModuleName]QueryDto): Promise<[ModuleName]Dto[]> {
		return this._service.findAll(query);
	}

	@Get(':id')
	findById(
		@Param('id', ParseIntPipe) id: number,
	): Promise<[ModuleName]Dto> {
		return this._service.findById(id);
	}

	@Post()
	@HttpCode(HttpStatus.CREATED)
	create(@Body() dto: Create[ModuleName]Dto): Promise<[ModuleName]Dto> {
		return this._service.create(dto);
	}

	@Put(':id')
	update(
		@Param('id', ParseIntPipe) id: number,
		@Body() dto: Update[ModuleName]Dto,
	): Promise<[ModuleName]Dto> {
		return this._service.update(id, dto);
	}

	@Delete(':id')
	@HttpCode(HttpStatus.NO_CONTENT)
	delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
		return this._service.delete(id);
	}

	constructor(private readonly _service: [ModuleName]Service) {}
}
```

## 🔍 Quality Checklist

Before considering the module complete, verify:

### Architecture

- [ ] Module follows feature-based organization
- [ ] Proper separation of concerns (controller/service/repository)
- [ ] Configuration managed through dependency injection
- [ ] No hardcoded values or direct `process.env` usage

### Security

- [ ] Appropriate security decorators applied
- [ ] Input validation with Zod schemas
- [ ] Error handling doesn't leak sensitive information
- [ ] Authorization implemented where needed

### Documentation

- [ ] OpenAPI documentation for all endpoints
- [ ] JSDoc comments on public methods
- [ ] README updates if needed
- [ ] Examples provided in documentation

### Testing

- [ ] Unit tests for all public methods
- [ ] Integration tests for API endpoints
- [ ] Error scenarios covered
- [ ] High test coverage (80%+)

### Performance

- [ ] No obvious performance bottlenecks
- [ ] Proper pagination for list endpoints
- [ ] Efficient database queries (when applicable)
- [ ] Appropriate caching strategies considered

## 🚀 Integration Steps

1. **Register Module**: Add to `src/app/modules/index.ts`
2. **Import in AppModule**: Add to `src/app/app.module.ts`
3. **Update Documentation**: Add to project README if needed
4. **Run Tests**: Ensure all tests pass with `pnpm test:dev --coverage --run`
5. **Run Linting**: Ensure code quality with `pnpm lint`
