---
applyTo: 'src/**/*'
description: 'Structural patterns and conventions'
---

# Project Architecture Guide

## 📁 Module Structure Pattern

Each module follows a strict hierarchical pattern under `src/app/modules/`:

```
src/app/modules/{module-name}/
├── controllers/
│   ├── {module-name}.controller.ts      # Main controller with endpoints
│   ├── {module-name}.controller.docs.ts # OpenAPI/Swagger documentation
│   └── {module-name}.controller.spec.ts # Controller unit tests
├── services/
│   ├── {module-name}.service.ts         # Business logic implementation
│   └── {module-name}.service.spec.ts    # Service unit tests
├── schemas/
│   └── {module-name}.dto.ts             # Zod schemas and DTOs
├── interfaces/                          # TypeScript interfaces (optional)
├── index.ts                             # Barrel exports
└── {module-name}.module.ts              # NestJS module definition
```

## 🔧 Library Structure Pattern

Custom libraries are organized under `src/libs/` with consistent structure:

```
src/libs/{library-name}/
├── index.ts                    # Public API exports
├── README.md                   # Library documentation
├── {main-functionality}.ts     # Core implementation
├── exceptions/                 # Custom exceptions
├── decorators/                 # Custom decorators (if applicable)
├── types/                      # TypeScript type definitions
├── __mocks__/                  # Mock implementations for testing
└── {library-name}.spec.ts      # Library unit tests
```

## 🎯 Configuration Architecture

### Environment Configuration Pattern

```typescript
// config/{feature}.config.ts
import { z } from 'zod';

const FeatureConfigSchema = z.object({
	apiUrl: z.string().url(),
	timeout: z.coerce.number().default(10000),
	retries: z.coerce.number().default(3),
});

export type FeatureConfig = z.infer<typeof FeatureConfigSchema>;

export const featureConfig = (): FeatureConfig => {
	return FeatureConfigSchema.parse({
		apiUrl: process.env.FEATURE_API_URL,
		timeout: process.env.FEATURE_TIMEOUT,
		retries: process.env.FEATURE_RETRIES,
	});
};
```

### Module Configuration Injection

```typescript
@Module({
	providers: [
		{
			provide: 'FEATURE_CONFIG',
			useFactory: featureConfig,
		},
		FeatureService,
	],
	exports: ['FEATURE_CONFIG', FeatureService],
})
export class FeatureModule {}
```

## 🎯 Implementation Patterns

### DTO Creation Pattern

```typescript
// schemas/{module-name}.dto.ts
import { ZodDto } from '#libs/zod';
import { z } from 'zod';

const {ModuleName}Schema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1).max(100),
  email: z.string().email(),
  createdAt: z.date().optional(),
  isActive: z.boolean().default(true),
}).meta({ description: '{ModuleName} DTO schema' });

export class {ModuleName}Dto extends ZodDto({ModuleName}Schema, '{ModuleName}') {}

// for create operations (exclude auto-generated fields)
const Create{ModuleName}Schema = {ModuleName}Schema.omit({
  id: true,
  createdAt: true,
});

export class Create{ModuleName}Dto extends ZodDto(Create{ModuleName}Schema, 'Create{ModuleName}') {}

// for update operations (make all fields optional)
const Update{ModuleName}Schema = {ModuleName}Schema.partial();

export class Update{ModuleName}Dto extends ZodDto(Update{ModuleName}Schema, 'Update{ModuleName}') {}
```

### Controller Pattern

```typescript
// controllers/{module-name}.controller.ts
import { Body, Controller, Get, Post } from '@nestjs/common';
import { AllowAnonymous, ApiKey } from '../../../decorators/api-key.guard.ts';
import { ApplyControllerDocs } from '../../../decorators/docs.decorator.ts';
import { {ModuleName}Dto } from '../schemas/{module-name}.dto.ts';
import { {ModuleName}Service } from '../services/{module-name}.service.ts';
import { {ModuleName}ControllerDocs } from './{module-name}.controller.docs.ts';

@ApiKey()
@Controller({
    path: '{module-name}',
    version: '1',
})
@ApplyControllerDocs({ModuleName}ControllerDocs)
export class {ModuleName}Controller {
    constructor(private readonly _service: {ModuleName}Service) {}

    // methods...
}
```

### Controller Documentation Pattern

```typescript
// controllers/{module-name}.controller.docs.ts
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { type DecoratorsLookUp } from '../../../../libs/decorators/apply.decorator.ts';
import { {ModuleName}Dto } from '../schemas/{module-name}.dto.ts';
import { type {ModuleName}Controller } from './{module-name}.controller.ts';

export const {ModuleName}ControllerDocs: DecoratorsLookUp<{ModuleName}Controller> = {
    class: [ApiTags('{ModuleName}')],
    common: {
        method: [
            ApiResponse({
                description: 'Internal error',
                status: 500,
            }),
        ],
    },
    method: {
        methodName: [
            ApiOperation({
                summary: 'Method description',
            }),
            ApiBody({
                schema: {ModuleName}Dto.jsonSchema,
            }),
            // additional decorators...
        ],
    },
};
```

### Service Pattern

```typescript
// services/{module-name}.service.ts
import { Injectable } from '@nestjs/common';
import { {ModuleName}Dto } from '../schemas/{module-name}.dto.ts';

@Injectable()
export class {ModuleName}Service {
    // business logic methods...
}
```

### Module Definition Pattern

```typescript
// {module-name}.module.ts
import { Module } from '@nestjs/common';
import { {ModuleName}Controller } from './controllers/{module-name}.controller.ts';
import { {ModuleName}Service } from './services/{module-name}.service.ts';

@Module({
    providers: [{ModuleName}Service],
    controllers: [{ModuleName}Controller],
    exports: [{ModuleName}Service], // if needed by other modules
})
export class {ModuleName}Module {}
```

## 📦 Module Registration Pattern

### Export from modules index

```typescript
// modules/index.ts
export { SampleModule } from './sample/sample.module.ts';
export { {ModuleName}Module } from './{module-name}/{module-name}.module.ts';
```

### Import in app module

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { SampleModule, {ModuleName}Module } from './modules/index.ts';

@Module({
    imports: [SampleModule, {ModuleName}Module],
})
export class AppModule {}
```

## 🛠️ Testing Structure

### Test file placement

- Place `.spec.ts` files alongside their corresponding source files
- Use the same directory structure for tests as for source code

### Test naming convention

- Controller tests: `{module-name}.controller.spec.ts`
- Service tests: `{module-name}.service.spec.ts`

## 🔍 Import Path Conventions

### Relative imports within module

```typescript
// Within the same module, use relative imports
import { ModuleService } from '../services/module.service.ts';
import { ModuleDto } from '../schemas/module.dto.ts';
```

### Absolute imports for libraries

```typescript
// For shared libraries, use path aliases
import { ZodDto, ZodValidationPipe } from '#libs/zod';
import { HttpStatusCode } from '#libs/http';
import { createSecurityGuard } from '#libs/decorators';

// For app-level decorators, use relative imports (with .ts extensions)
import { ApplyControllerDocs } from '../../../decorators/docs.decorator.ts';
```

### Cross-module imports

```typescript
// For other modules, use absolute paths
import { OtherModule } from '../../other-module/other-module.module.ts';
```

## 📝 Documentation Requirements

### Controller documentation

- Each controller must have a corresponding `.controller.docs.ts` file
- Use `DecoratorsLookUp` type for type-safe documentation
- Include OpenAPI tags, operations, and response schemas

### README files

- Each library must include a comprehensive README.md
- Include examples, API reference, and usage instructions
- Document all public interfaces and methods

## 🔒 Security Architecture Principles

### Guard Application

- Always apply `@ApiKey()` at the controller level
- Use `@AllowAnonymous()` to explicitly mark public endpoints
- Implement role-based access control with custom guards

### Validation Strategy

- All DTOs must use Zod schemas for validation
- Apply validation pipes consistently across endpoints
- Handle validation errors with proper HTTP status codes

## 🏗️ Performance Guidelines

### Module Organization

- Keep modules focused and cohesive
- Separate concerns between controllers, services, and DTOs
- Use dependency injection properly
- Export only necessary public interfaces

### Import Strategy

- Use barrel exports (index.ts) for clean public APIs
- Avoid circular dependencies between modules
- Use absolute imports for shared libraries (#libs/\*)

## 📝 Documentation Standards

### Required Documentation

- Each controller must have a corresponding `.controller.docs.ts` file
- Use `DecoratorsLookUp` type for type-safe OpenAPI documentation
- Include comprehensive README.md files for all libraries

### Documentation Structure

- OpenAPI tags, operations, and response schemas
- Examples for all API endpoints
- Complete API reference for public interfaces
