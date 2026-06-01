---
applyTo: 'src/**/*.{ts,cts,mts}'
description: 'Copy-paste recipes: modules, controllers, services, DTOs, guards, docs, tests'
---

# Patterns

Worked recipes that follow this template's real stack (NestJS + Fastify, Zod via `#libs/zod`,
HTTP client via `#libs/http`, security via `#libs/decorators`, Vitest + vitest-mock-extended).
High-level rules live in [AGENTS.md](../../AGENTS.md); wiring in
[architecture-guide](architecture-guide.instructions.md); style in [coding-standards](coding-standards.instructions.md).
This document is the place for long worked examples.

## DTO (Zod)

```typescript
// schemas/user.dto.ts
import { z } from 'zod';
import { ZodDto } from '#libs/zod';

const UserSchema = z
	.object({
		id: z.coerce.number().optional(),
		name: z.string().min(1).max(100),
		email: z.email(),
		isActive: z.boolean().default(true),
	})
	.meta({ description: 'User DTO schema' });

export class UserDto extends ZodDto(UserSchema, 'User') {}

// create: drop server-generated fields
export class CreateUserDto extends ZodDto(
	UserSchema.omit({ id: true }),
	'CreateUser',
) {}

// update: everything optional
export class UpdateUserDto extends ZodDto(UserSchema.partial(), 'UpdateUser') {}
```

## Controller (thin, validated, documented)

```typescript
// controllers/user.controller.ts
import {
	Body,
	Controller,
	Get,
	Param,
	ParseIntPipe,
	Post,
} from '@nestjs/common';
import { ZodValidationPipe } from '#libs/zod';
import { ApiKey, AllowAnonymous } from '../../../decorators/api-key.guard.ts';
import { ApplyControllerDocs } from '../../../decorators/docs.decorator.ts';
import { CreateUserDto, UserDto } from '../schemas/user.dto.ts';
import { UserService } from '../services/user.service.ts';
import { UserControllerDocs } from './user.controller.docs.ts';

@ApiKey()
@Controller({ path: 'users', version: '1' })
@ApplyControllerDocs(UserControllerDocs)
export class UserController {
	constructor(private readonly _service: UserService) {}

	@Get(':id')
	findOne(@Param('id', ParseIntPipe) id: number): Promise<UserDto> {
		return this._service.findOne(id);
	}

	@Post()
	create(@Body(ZodValidationPipe) data: CreateUserDto): Promise<UserDto> {
		return this._service.create(data);
	}

	@Get('public/stats')
	@AllowAnonymous()
	getPublicStats(): Promise<unknown> {
		return this._service.getPublicStats();
	}
}
```

## Controller documentation

Keep OpenAPI metadata in a colocated `*.controller.docs.ts`, typed with `DecoratorsLookUp`:

```typescript
// controllers/user.controller.docs.ts
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { DecoratorsLookUp } from '#libs/decorators';
import { CreateUserDto } from '../schemas/user.dto.ts';
import type { UserController } from './user.controller.ts';

export const UserControllerDocs: DecoratorsLookUp<UserController> = {
	class: [ApiTags('User')],
	common: {
		method: [ApiResponse({ status: 500, description: 'Internal error' })],
	},
	method: {
		create: [
			ApiOperation({ summary: 'Create a new user' }),
			ApiBody({ schema: CreateUserDto.jsonSchema }),
		],
	},
};
```

## Service

```typescript
// services/user.service.ts
import { ConflictException, Injectable, Logger } from '@nestjs/common';
import type { CreateUserDto, UserDto } from '../schemas/user.dto.ts';
import type { UserRepository } from '../repositories/user.repository.ts';

@Injectable()
export class UserService {
	private readonly _logger = new Logger(UserService.name);

	constructor(private readonly _repository: UserRepository) {}

	async create(data: CreateUserDto): Promise<UserDto> {
		// business rule: email must be unique
		if (await this._repository.findByEmail(data.email)) {
			throw new ConflictException('Email already exists');
		}

		const user = await this._repository.create(data);
		this._logger.log(`User created: ${user.id}`);
		return user;
	}

	findOne(id: number): Promise<UserDto> {
		return this._repository.findById(id);
	}
}
```

## Module

```typescript
// user.module.ts
import { Module } from '@nestjs/common';
import { UserController } from './controllers/user.controller.ts';
import { UserService } from './services/user.service.ts';

@Module({
	controllers: [UserController],
	providers: [UserService],
	exports: [UserService], // only if other modules need it
})
export class UserModule {}
```

## Error handling

Catch low-level errors and re-throw the appropriate NestJS HTTP exception:

```typescript
import {
	BadRequestException,
	ConflictException,
	InternalServerErrorException,
	Logger,
} from '@nestjs/common';

try {
	return await this._service.create(dto);
} catch (error) {
	this._logger.error('Failed to create resource', { error });

	if (error instanceof ConflictException) throw error;
	if (error instanceof ValidationError) {
		throw new BadRequestException(error.message);
	}
	throw new InternalServerErrorException('Failed to create resource');
}
```

## HTTP client (external API)

Inject `HttpClient` from `#libs/http` plus an injected config (never read `process.env` here).
Map transport errors to HTTP exceptions:

```typescript
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { HttpClient, HttpError, TimeoutError } from '#libs/http';
import type { ExternalApiConfig } from '../config/external-api.config.ts';

@Injectable()
export class ExternalApiService {
	constructor(
		private readonly _http: HttpClient,
		@Inject('EXTERNAL_API_CONFIG')
		private readonly _config: ExternalApiConfig,
	) {}

	async getResource(id: string): Promise<ExternalResourceDto> {
		try {
			return await this._http.get<ExternalResourceDto>(
				`/resources/${id}`,
			);
		} catch (error) {
			if (error instanceof HttpError && error.status === 404) {
				throw new NotFoundException(`Resource ${id} not found`);
			}
			if (error instanceof TimeoutError) {
				throw new RequestTimeoutException('External API timeout');
			}
			throw error;
		}
	}
}
```

Register it with the HTTP module and an injected config factory (see
[architecture-guide](architecture-guide.instructions.md) → Configuration architecture):

```typescript
import { Module } from '@nestjs/common';
import { HttpModule } from '#libs/http';
import { externalApiConfig } from '../config/external-api.config.ts';

@Module({
	imports: [HttpModule],
	providers: [
		ExternalApiService,
		{ provide: 'EXTERNAL_API_CONFIG', useFactory: externalApiConfig },
	],
	exports: [ExternalApiService],
})
export class ExternalApiModule {}
```

## Custom security guard

Implement `SecurityGuard` and turn it into decorators with `createSecurityGuard`:

```typescript
import { Injectable, type ExecutionContext } from '@nestjs/common';
import { createSecurityGuard, type SecurityGuard } from '#libs/decorators';

@Injectable()
export class RoleGuard implements SecurityGuard {
	canActivate(context: ExecutionContext, requiredRole?: string): boolean {
		const { user } = context.switchToHttp().getRequest();
		if (!user) return false;
		return !requiredRole || user.role === requiredRole;
	}
}

// requireAuth = true by default
export const [RequireAdmin, RequireUser, AllowAnonymous] = createSecurityGuard(
	RoleGuard,
	true,
);
```

## Testing

### Service test — direct instantiation with typed mocks

```typescript
import { beforeEach, describe, expect, test } from 'vitest';
import { mock } from 'vitest-mock-extended';
import { UserService } from './user.service.ts';
import type { UserRepository } from '../repositories/user.repository.ts';

describe('UserService', () => {
	// shared variables
	let service: UserService;

	// mocks
	const repository = mock<UserRepository>();

	// hooks
	beforeEach(() => {
		service = new UserService(repository);
	});

	// tests
	test('creates a user when the email is unique', async () => {
		// arrange
		const data = {
			name: 'John',
			email: 'john@example.com',
			isActive: true,
		};
		repository.findByEmail.mockResolvedValue(null);
		repository.create.mockResolvedValue({ id: 1, ...data });

		// act
		const result = await service.create(data);

		// assert
		expect(result).toEqual({ id: 1, ...data });
		expect(repository.create).toHaveBeenCalledWith(data);
	});

	test('throws when the email already exists', async () => {
		// arrange
		repository.findByEmail.mockResolvedValue({ id: 9 });

		// act & assert
		await expect(
			service.create({
				name: 'J',
				email: 'dup@example.com',
				isActive: true,
			}),
		).rejects.toThrow('Email already exists');
		expect(repository.create).not.toHaveBeenCalled();
	});
});
```

### Controller test — NestJS TestingModule

```typescript
import { beforeAll, describe, expect, test } from 'vitest';
import { Test, type TestingModule } from '@nestjs/testing';
import { mock } from 'vitest-mock-extended';
import { UserController } from './user.controller.ts';
import { UserService } from '../services/user.service.ts';

describe('UserController', () => {
	// shared variables
	let controller: UserController;

	// mocks
	const service = mock<UserService>();

	// hooks
	beforeAll(async () => {
		const moduleRef: TestingModule = await Test.createTestingModule({
			controllers: [UserController],
			providers: [{ provide: UserService, useValue: service }],
		}).compile();

		controller = moduleRef.get(UserController);
	});

	// tests
	test('delegates findOne to the service', async () => {
		// arrange
		service.findOne.mockResolvedValue({ id: 1, name: 'John' } as never);

		// act
		const result = await controller.findOne(1);

		// assert
		expect(result).toEqual({ id: 1, name: 'John' });
		expect(service.findOne).toHaveBeenCalledWith(1);
	});
});
```
