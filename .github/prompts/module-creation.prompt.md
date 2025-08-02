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
import { z } from 'zod';
import { ZodDto, phone, epoch } from '#libs/zod';

// Base entity schema
const [ModuleName]Schema = z.object({
	id: z.coerce.number().positive(),
	name: z.string().min(1).max(100),
	description: z.string().max(500).optional(),
	status: z.enum(['active', 'inactive', 'pending']).default('pending'),
	email: z.email().optional(),
	phone: phone().optional(),
	metadata: z.record(z.unknown()).optional(),
	createdAt: epoch(),
	updatedAt: epoch(),
}).describe('[ModuleName] entity');

// Response DTO
export class [ModuleName]Dto extends ZodDto([ModuleName]Schema, '[ModuleName]') {}

// Create DTO (omit generated fields)
const Create[ModuleName]Schema = [ModuleName]Schema.omit({
	id: true,
	createdAt: true,
	updatedAt: true,
});

export class Create[ModuleName]Dto extends ZodDto(Create[ModuleName]Schema, 'Create[ModuleName]') {}

// Update DTO (partial with omitted fields)
const Update[ModuleName]Schema = [ModuleName]Schema.omit({
	id: true,
	createdAt: true,
	updatedAt: true,
}).partial();

export class Update[ModuleName]Dto extends ZodDto(Update[ModuleName]Schema, 'Update[ModuleName]') {}

// Query DTO for filtering
const [ModuleName]QuerySchema = z.object({
	page: z.coerce.number().min(1).default(1),
	limit: z.coerce.number().min(1).max(100).default(10),
	status: z.enum(['active', 'inactive', 'pending']).optional(),
	search: z.string().min(1).optional(),
	sortBy: z.enum(['name', 'createdAt', 'updatedAt']).default('createdAt'),
	sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export class [ModuleName]QueryDto extends ZodDto([ModuleName]QuerySchema, '[ModuleName]Query') {}
```

### Service Template

```typescript
import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { [ModuleName]Dto, Create[ModuleName]Dto, Update[ModuleName]Dto, [ModuleName]QueryDto } from '../schemas/[module-name].dto.ts';

@Injectable()
export class [ModuleName]Service {
	private readonly logger = new Logger([ModuleName]Service.name);

	constructor(
		// Inject repositories or external services here
		// @Inject('CONFIG') private readonly config: [ModuleName]Config,
	) {}

	/**
	 * Retrieves all [module-name]s with optional filtering and pagination.
	 *
	 * @param query - query parameters for filtering and pagination
   * @returns promise resolving to array of [module-name]s
   */
  async findAll(query: [ModuleName]QueryDto): Promise<[ModuleName]Dto[]> {
    try {
      this.logger.log(`Finding all [module-name]s with query: ${JSON.stringify(query)}`);

      // TODO: Implement repository call
      // const result = await this.repository.findAll(query);

      const mockResult: [ModuleName]Dto[] = [];
      return mockResult;
    } catch (error) {
      this.logger.error(`Failed to find [module-name]s: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Retrieves a single [module-name] by ID.
   *
   * @param id - [module-name] ID
   * @returns promise resolving to [module-name] entity
   * @throws NotFoundException if [module-name] doesn't exist
   */
  async findById(id: number): Promise<[ModuleName]Dto> {
    try {
      this.logger.log(`Finding [module-name] with ID: ${id}`);

      // TODO: Implement repository call
      // const result = await this.repository.findById(id);
      // if (!result) {
      //   throw new NotFoundException(`[ModuleName] with ID ${id} not found`);
      // }

      // Mock implementation
      throw new NotFoundException(`[ModuleName] with ID ${id} not found`);
    } catch (error) {
      this.logger.error(`Failed to find [module-name] ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Creates a new [module-name].
   *
   * @param create[ModuleName]Dto - [module-name] creation data
   * @returns promise resolving to created [module-name]
   * @throws ConflictException if [module-name] already exists
   */
  async create(create[ModuleName]Dto: Create[ModuleName]Dto): Promise<[ModuleName]Dto> {
    try {
      this.logger.log(`Creating [module-name]: ${JSON.stringify(create[ModuleName]Dto)}`);

      // TODO: Implement validation and repository call
      // const exists = await this.repository.existsByName(create[ModuleName]Dto.name);
      // if (exists) {
      //   throw new ConflictException(`[ModuleName] with name '${create[ModuleName]Dto.name}' already exists`);
      // }

      // const result = await this.repository.create(create[ModuleName]Dto);

      // Mock implementation
      const result: [ModuleName]Dto = {
        id: 1,
        ...create[ModuleName]Dto,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as [ModuleName]Dto;

      this.logger.log(`Created [module-name] with ID: ${result.id}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to create [module-name]: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Updates an existing [module-name].
   *
   * @param id - [module-name] ID
   * @param update[ModuleName]Dto - [module-name] update data
   * @returns promise resolving to updated [module-name]
   * @throws NotFoundException if [module-name] doesn't exist
   */
  async update(id: number, update[ModuleName]Dto: Update[ModuleName]Dto): Promise<[ModuleName]Dto> {
    try {
      this.logger.log(`Updating [module-name] ${id}: ${JSON.stringify(update[ModuleName]Dto)}`);

      // TODO: Implement repository call
      // const existing = await this.findById(id);
      // const result = await this.repository.update(id, update[ModuleName]Dto);

      // Mock implementation
      throw new NotFoundException(`[ModuleName] with ID ${id} not found`);
    } catch (error) {
      this.logger.error(`Failed to update [module-name] ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Deletes a [module-name] by ID.
   *
   * @param id - [module-name] ID
   * @returns promise resolving when deletion is complete
   * @throws NotFoundException if [module-name] doesn't exist
   */
  async delete(id: number): Promise<void> {
    try {
      this.logger.log(`Deleting [module-name] with ID: ${id}`);

      // TODO: Implement repository call
      // const existing = await this.findById(id);
      // await this.repository.delete(id);

      // Mock implementation
      throw new NotFoundException(`[ModuleName] with ID ${id} not found`);
    } catch (error) {
      this.logger.error(`Failed to delete [module-name] ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }
}
```

### Controller Template

```typescript
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiKey } from '../../decorators/api-key.guard.ts';
import { ApplyControllerDocs } from '../../decorators/docs.decorator.ts';
import { [ModuleName]Service } from '../services/[module-name].service.ts';
import {
  [ModuleName]Dto,
  Create[ModuleName]Dto,
  Update[ModuleName]Dto,
  [ModuleName]QueryDto,
} from '../schemas/[module-name].dto.ts';
import { [ModuleName]ControllerDocs } from './[module-name].controller.docs.ts';

@ApiKey()
@Controller({
  path: '[module-name]',
  version: '1',
})
@ApplyControllerDocs([ModuleName]ControllerDocs)
export class [ModuleName]Controller {
  constructor(private readonly [moduleName]Service: [ModuleName]Service) {}

  /**
   * Retrieves all [module-name]s with optional filtering.
   *
   * @param query - query parameters for filtering and pagination
   * @returns promise resolving to array of [module-name]s
   */
  @Get()
  async findAll(@Query() query: [ModuleName]QueryDto): Promise<[ModuleName]Dto[]> {
    return this.[moduleName]Service.findAll(query);
  }

  /**
   * Retrieves a single [module-name] by ID.
   *
   * @param id - [module-name] ID
   * @returns promise resolving to [module-name] entity
   */
  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number): Promise<[ModuleName]Dto> {
    return this.[moduleName]Service.findById(id);
  }

  /**
   * Creates a new [module-name].
   *
   * @param create[ModuleName]Dto - [module-name] creation data
   * @returns promise resolving to created [module-name]
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() create[ModuleName]Dto: Create[ModuleName]Dto): Promise<[ModuleName]Dto> {
    return this.[moduleName]Service.create(create[ModuleName]Dto);
  }

  /**
   * Updates an existing [module-name].
   *
   * @param id - [module-name] ID
   * @param update[ModuleName]Dto - [module-name] update data
   * @returns promise resolving to updated [module-name]
   */
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() update[ModuleName]Dto: Update[ModuleName]Dto,
  ): Promise<[ModuleName]Dto> {
    return this.[moduleName]Service.update(id, update[ModuleName]Dto);
  }

  /**
   * Deletes a [module-name] by ID.
   *
   * @param id - [module-name] ID
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.[moduleName]Service.delete(id);
  }
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
