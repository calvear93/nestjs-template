---
applyTo: 'src/**/*.{ts,cts,mts}'
description: 'Recommended patterns and best practices for NestJS development'
---

# NestJS Development Patterns

## 🚀 Quick Development Commands Reference

```bash
# start development with hot reload
pnpm start:dev

# run tests with coverage (for CI/validation)
pnpm test:dev --coverage --run

# run tests in watch mode (for development)
pnpm test:dev

# check and fix code style issues
pnpm lint

# format code
pnpm format

# build project for production
pnpm build

# preview production build
pnpm preview
```

## 🏗️ Module Organization Patterns

### Feature-Based Module Structure

```typescript
// user.module.ts
@Module({
	imports: [HttpModule, DatabaseModule],
	providers: [
		UserService,
		UserRepository,
		{
			provide: 'USER_CONFIG',
			useFactory: () => ({
				maxUsers: 1000,
				defaultRole: 'user',
			}),
		},
	],
	controllers: [UserController],
	exports: [UserService], // export if needed by other modules
})
export class UserModule {}
```

### Barrel Exports Pattern

```typescript
// src/app/modules/user/index.ts
export * from './user.controller.ts';
export * from './user.service.ts';
export * from './user.module.ts';
export * from './schemas/index.ts';
export * from './interfaces/index.ts';

// src/app/modules/index.ts
export * from './user/index.ts';
export * from './auth/index.ts';
export * from './products/index.ts';
```

### Dynamic Module Pattern

```typescript
@Module({})
export class ConfigurableModule {
	static forRoot(options: ModuleOptions): DynamicModule {
		return {
			module: ConfigurableModule,
			providers: [
				{
					provide: 'MODULE_OPTIONS',
					useValue: options,
				},
				SomeService,
			],
			exports: [SomeService],
		};
	}

	static forRootAsync(options: ModuleAsyncOptions): DynamicModule {
		return {
			module: ConfigurableModule,
			imports: options.imports || [],
			providers: [
				{
					provide: 'MODULE_OPTIONS',
					useFactory: options.useFactory,
					inject: options.inject || [],
				},
				SomeService,
			],
			exports: [SomeService],
		};
	}
}
```

## ⚙️ Configuration Patterns

### Complete External API Configuration

This comprehensive pattern shows the complete workflow for managing external API configurations with proper separation of concerns.

#### Configuration Files Structure

```json
// env/appsettings.json (non-secrets)
{
  "PAYMENT_API": {
    "BASE_URL": "https://api.payment-provider.com",
    "TIMEOUT": 10000,
    "RETRY_ATTEMPTS": 3,
    "VERSION": "v2"
  }
}

// env/dev.env.json (secrets)
{
  "PAYMENT_API_KEY": "your-secret-api-key",
  "PAYMENT_WEBHOOK_SECRET": "webhook-secret"
}
```

#### Type-Safe Configuration Interface

```typescript
// interfaces/payment-config.interface.ts
export interface PaymentApiConfig {
	baseUrl: string;
	timeout: number;
	retryAttempts: number;
	version: string;
	apiKey: string;
	webhookSecret: string;
}
```

#### Module with Dynamic Provider

```typescript
// payment.module.ts
@Module({
	providers: [
		{
			provide: 'PAYMENT_API_CONFIG',
			useFactory: (configService: ConfigService): PaymentApiConfig => ({
				baseUrl: configService.get('PAYMENT_API.BASE_URL'),
				timeout: configService.get('PAYMENT_API.TIMEOUT'),
				retryAttempts: configService.get('PAYMENT_API.RETRY_ATTEMPTS'),
				version: configService.get('PAYMENT_API.VERSION'),
				apiKey: configService.get('PAYMENT_API_KEY'),
				webhookSecret: configService.get('PAYMENT_WEBHOOK_SECRET'),
			}),
			inject: [ConfigService],
		},
		PaymentService,
	],
	controllers: [PaymentController],
})
export class PaymentModule {}
```

#### Service Implementation

```typescript
// payment.service.ts
@Injectable()
export class PaymentService {
	constructor(
		@Inject('PAYMENT_API_CONFIG')
		private readonly config: PaymentApiConfig,
		private readonly httpClient: HttpClient,
	) {}

	async processPayment(amount: number): Promise<PaymentResult> {
		return this.httpClient.post<PaymentResult>(
			'/payments',
			{ amount },
			{
				headers: {
					Authorization: `Bearer ${this.config.apiKey}`,
					'API-Version': this.config.version,
				},
				timeout: this.config.timeout,
			},
		);
	}
}
```

### Environment-Based Configuration Pattern

```typescript
// config/database.config.ts
import { z } from 'zod';

const DatabaseConfigSchema = z.object({
	host: z.string(),
	port: z.coerce.number().default(5432),
	username: z.string(),
	password: z.string(),
	database: z.string(),
	ssl: z.coerce.boolean().default(false),
});

export type DatabaseConfig = z.infer<typeof DatabaseConfigSchema>;

export const databaseConfig = (): DatabaseConfig => {
	return DatabaseConfigSchema.parse({
		host: process.env.DB_HOST,
		port: process.env.DB_PORT,
		username: process.env.DB_USERNAME,
		password: process.env.DB_PASSWORD,
		database: process.env.DB_DATABASE,
		ssl: process.env.DB_SSL,
	});
};
```

### Dynamic Module Configuration

```typescript
@Module({})
export class ConfigurableModule {
	static forRoot(options: ModuleOptions): DynamicModule {
		return {
			module: ConfigurableModule,
			providers: [
				{
					provide: 'MODULE_OPTIONS',
					useValue: options,
				},
				SomeService,
			],
			exports: [SomeService],
		};
	}

	static forRootAsync(options: ModuleAsyncOptions): DynamicModule {
		return {
			module: ConfigurableModule,
			imports: options.imports || [],
			providers: [
				{
					provide: 'MODULE_OPTIONS',
					useFactory: options.useFactory,
					inject: options.inject || [],
				},
				SomeService,
			],
			exports: [SomeService],
		};
	}
}
```

## 🎮 Controller Patterns

### RESTful Controller Pattern

```typescript
@ApiKey()
@Controller({
	path: 'users',
	version: '1',
})
@ApplyControllerDocs(UserControllerDocs)
export class UserController {
	constructor(
		private readonly userService: UserService,
		private readonly logger: Logger,
	) {}

	@Get()
	@ApiOperation({ summary: 'Get all users' })
	async findAll(
		@Query() query: PaginationDto,
	): Promise<PaginatedResponse<UserDto>> {
		return this.userService.findAll(query);
	}

	@Get(':id')
	@ApiOperation({ summary: 'Get user by ID' })
	async findOne(@Param('id', ParseIntPipe) id: number): Promise<UserDto> {
		return this.userService.findOne(id);
	}

	@Post()
	@ApiOperation({ summary: 'Create a new user' })
	async create(
		@Body(ZodValidationPipe) createUserDto: CreateUserDto,
	): Promise<UserDto> {
		return this.userService.create(createUserDto);
	}

	@Put(':id')
	@ApiOperation({ summary: 'Update user' })
	async update(
		@Param('id', ParseIntPipe) id: number,
		@Body(ZodValidationPipe) updateUserDto: UpdateUserDto,
	): Promise<UserDto> {
		return this.userService.update(id, updateUserDto);
	}

	@Delete(':id')
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiOperation({ summary: 'Delete user' })
	async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
		return this.userService.remove(id);
	}

	@Get('public/stats')
	@AllowAnonymous()
	@ApiOperation({ summary: 'Get public user statistics' })
	async getPublicStats(): Promise<UserStatsDto> {
		return this.userService.getPublicStats();
	}
}
```

### Error Handling Pattern

```typescript
@Controller('resources')
export class ResourceController {
	constructor(
		private readonly service: ResourceService,
		private readonly logger: Logger,
	) {}

	@Post()
	async create(@Body() dto: CreateResourceDto): Promise<ResourceDto> {
		try {
			return await this.service.create(dto);
		} catch (error) {
			this.logger.error('Failed to create resource', {
				error: error.message,
				dto,
			});

			if (error instanceof ConflictException) {
				throw new ConflictException('Resource already exists');
			}

			if (error instanceof ValidationError) {
				throw new BadRequestException(error.message);
			}

			throw new InternalServerErrorException('Failed to create resource');
		}
	}
}
```

## 🔧 Service Patterns

### Repository Service Pattern

```typescript
@Injectable()
export class UserService {
	constructor(
		private readonly userRepository: UserRepository,
		private readonly emailService: EmailService,
		private readonly logger: Logger,
	) {}

	async create(createUserDto: CreateUserDto): Promise<UserDto> {
		// business logic validation
		await this.validateUniqueEmail(createUserDto.email);

		// create user
		const user = await this.userRepository.create(createUserDto);

		// side effects
		await this.emailService.sendWelcomeEmail(user.email);
		this.logger.log(`User created: ${user.id}`);

		return user;
	}

	async findAll(
		pagination: PaginationDto,
	): Promise<PaginatedResponse<UserDto>> {
		const { page, limit } = pagination;
		const offset = (page - 1) * limit;

		const [users, total] = await Promise.all([
			this.userRepository.findMany({ offset, limit }),
			this.userRepository.count(),
		]);

		return {
			data: users,
			pagination: {
				page,
				limit,
				total,
				totalPages: Math.ceil(total / limit),
			},
		};
	}

	private async validateUniqueEmail(email: string): Promise<void> {
		const existingUser = await this.userRepository.findByEmail(email);
		if (existingUser) {
			throw new ConflictException('Email already exists');
		}
	}
}
```

### HTTP Client Service Pattern

```typescript
@Injectable()
export class ExternalApiService {
	constructor(
		private readonly httpClient: HttpClient,
		@Inject('EXTERNAL_API_CONFIG')
		private readonly config: ExternalApiConfig,
		private readonly logger: Logger,
	) {}

	async getResource(id: string): Promise<ExternalResourceDto> {
		try {
			const resource = await this.httpClient.get<ExternalResourceDto>(
				`/resources/${id}`,
			);

			this.logger.debug(`Retrieved resource: ${id}`);
			return resource;
		} catch (error) {
			if (error instanceof HttpError) {
				this.logger.error(
					`HTTP Error: ${error.status} - ${error.message}`,
				);

				if (error.status === 404) {
					throw new NotFoundException(`Resource ${id} not found`);
				}

				if (error.status >= 500) {
					throw new ServiceUnavailableException(
						'External service unavailable',
					);
				}
			}

			if (error instanceof TimeoutError) {
				this.logger.error('External API timeout');
				throw new RequestTimeoutException('External API timeout');
			}

			throw error;
		}
	}

	async createResource(
		data: CreateExternalResourceDto,
	): Promise<ExternalResourceDto> {
		const retryConfig = { maxRetries: 3, backoffMs: 1000 };

		return this.retryWithBackoff(
			() => this.httpClient.post<ExternalResourceDto>('/resources', data),
			retryConfig,
		);
	}

	private async retryWithBackoff<T>(
		operation: () => Promise<T>,
		config: { maxRetries: number; backoffMs: number },
	): Promise<T> {
		let lastError: Error;

		for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
			try {
				return await operation();
			} catch (error) {
				lastError = error;

				if (attempt === config.maxRetries) {
					break;
				}

				const delay = config.backoffMs * Math.pow(2, attempt);
				await new Promise((resolve) => setTimeout(resolve, delay));
			}
		}

		throw lastError;
	}
}

// module configuration for HTTP client injection
@Module({
	imports: [HttpModule],
	providers: [
		ExternalApiService,
		{
			provide: 'EXTERNAL_API_CONFIG',
			useFactory: () => ({
				baseUrl: process.env.EXTERNAL_API_URL,
				timeout: parseInt(process.env.EXTERNAL_API_TIMEOUT) || 10000,
				apiKey: process.env.EXTERNAL_API_KEY,
			}),
		},
	],
	exports: [ExternalApiService],
})
export class ExternalApiModule {}
```

## 🛡️ Security Patterns

### Custom Security Guard Pattern

```typescript
@Injectable()
export class RoleGuard implements SecurityGuard {
	constructor(private readonly reflector: Reflector) {}

	canActivate(context: ExecutionContext, requiredRole: string): boolean {
		const request = context.switchToHttp().getRequest();
		const user = request.user;

		if (!user) {
			return false;
		}

		// check if user has required role
		if (requiredRole && user.role !== requiredRole) {
			return false;
		}

		return true;
	}
}

// create reusable decorators
export const [RequireAdmin, RequireUser, AllowAnonymous] = createSecurityGuard(
	RoleGuard,
	true, // requireAuth by default
);

// usage
@RequireAdmin()
@Controller('admin')
export class AdminController {
	@Get('dashboard')
	dashboard() {
		return { message: 'Admin dashboard' };
	}
}
```

### Permission-Based Guard Pattern

```typescript
@Injectable()
export class PermissionGuard implements SecurityGuard {
	constructor(
		private readonly reflector: Reflector,
		private readonly permissionService: PermissionService,
	) {}

	async canActivate(
		context: ExecutionContext,
		requiredPermission: string,
	): Promise<boolean> {
		const request = context.switchToHttp().getRequest();
		const user = request.user;

		if (!user) {
			return false;
		}

		const hasPermission = await this.permissionService.userHasPermission(
			user.id,
			requiredPermission,
		);

		return hasPermission;
	}
}

// create permission decorators
export const [RequirePermission] = createSecurityGuard(PermissionGuard, true);

// usage
@Controller('documents')
export class DocumentController {
	@Get()
	@RequirePermission('documents:read')
	async findAll() {
		// ...
	}

	@Post()
	@RequirePermission('documents:create')
	async create(@Body() dto: CreateDocumentDto) {
		// ...
	}
}
```

## 📋 DTO and Validation Patterns

### Comprehensive DTO Pattern

```typescript
import { ZodDto } from '#libs/zod';
import { phone, epoch } from '#libs/zod/validators';
import { z } from 'zod';

// base schemas for reusability
const BaseUserSchema = z.object({
	email: z.string().email(),
	firstName: z.string().min(1).max(50),
	lastName: z.string().min(1).max(50),
	phone: phone().optional(),
});

// create User DTO
const CreateUserSchema = BaseUserSchema.extend({
	password: z.string().min(8),
	role: z.enum(['admin', 'user', 'moderator']).default('user'),
}).meta({ description: 'Create user request' });

export class CreateUserDto extends ZodDto(CreateUserSchema, 'CreateUser') {}

// update User DTO (all fields optional)
const UpdateUserSchema = BaseUserSchema.partial()
	.extend({
		isActive: z.boolean().optional(),
		lastLoginAt: epoch().optional(),
	})
	.meta({ description: 'Update user request' });

export class UpdateUserDto extends ZodDto(UpdateUserSchema, 'UpdateUser') {}

// response DTO (excludes sensitive fields)
const UserResponseSchema = BaseUserSchema.extend({
	id: z.number(),
	role: z.enum(['admin', 'user', 'moderator']),
	isActive: z.boolean(),
	createdAt: epoch(),
	updatedAt: epoch(),
}).meta({ description: 'User response' });

export class UserDto extends ZodDto(UserResponseSchema, 'User') {}

// pagination DTO
const PaginationSchema = z
	.object({
		page: z.coerce.number().min(1).default(1),
		limit: z.coerce.number().min(1).max(100).default(10),
		sortBy: z.string().optional(),
		sortOrder: z.enum(['asc', 'desc']).default('asc'),
	})
	.meta({ description: 'Pagination parameters' });

export class PaginationDto extends ZodDto(PaginationSchema, 'Pagination') {}

// query DTO with filters
const UserQuerySchema = PaginationSchema.extend({
	search: z.string().optional(),
	role: z.enum(['admin', 'user', 'moderator']).optional(),
	isActive: z.coerce.boolean().optional(),
	createdAfter: epoch().optional(),
	createdBefore: epoch().optional(),
}).meta({ description: 'User query parameters' });

export class UserQueryDto extends ZodDto(UserQuerySchema, 'UserQuery') {}
```

### Generic Response Patterns

```typescript
// generic response wrapper
const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
	z.object({
		success: z.boolean(),
		data: dataSchema,
		message: z.string().optional(),
		timestamp: epoch(),
	});

// paginated response
const PaginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
	z.object({
		data: z.array(itemSchema),
		pagination: z.object({
			page: z.number(),
			limit: z.number(),
			total: z.number(),
			totalPages: z.number(),
		}),
	});

export class PaginatedResponse<T> extends ZodDto(
	PaginatedResponseSchema(z.any()),
	'PaginatedResponse',
) {}

// error response
const ErrorResponseSchema = z
	.object({
		success: z.literal(false),
		error: z.object({
			code: z.string(),
			message: z.string(),
			details: z.any().optional(),
		}),
		timestamp: epoch(),
	})
	.meta({ description: 'Error response' });

export class ErrorResponseDto extends ZodDto(
	ErrorResponseSchema,
	'ErrorResponse',
) {}
```

## 🎭 Mock Server Patterns

### Built-in Node HTTP Mock Server (Vitest)

For tests that must exercise real HTTP behavior (status codes, headers, body parsing) without calling the network, use the built-in helper:

- `src/libs/http/__mocks__/create-http-mock-server.mock.ts`

This approach keeps tests fast and dependency-free.

#### Example: Mock an external API for HttpClient

```typescript
import type { RequestListener, Server } from 'node:http';
import type { Mock } from 'vitest';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { HttpClient } from '#libs/http';
import { createHttpMockServer } from '#libs/http/__mocks__/create-http-mock-server.mock.ts';

describe('HttpClient + mock server', () => {
	let _server: Server;
	let _handler: Mock<RequestListener>;
	let _port: number;
	let _client: HttpClient;

	beforeAll(async () => {
		const [server, handler, port] = await createHttpMockServer();
		_server = server;
		_handler = handler;
		_port = port;

		_client = new HttpClient({
			url: `http://localhost:${_port}`,
			timeout: 2_000,
		});
	});

	afterAll(async () => {
		await new Promise<void>((resolve) => {
			_server.close(() => resolve());
		});
	});

	test('should return JSON from mocked endpoint', async () => {
		// arrange
		_handler.mockImplementation((req, res) => {
			if (req.url === '/users/1' && req.method === 'GET') {
				res.writeHead(200, { 'content-type': 'application/json' });
				res.end(JSON.stringify({ id: 1, name: 'Test' }));
				return;
			}

			res.writeHead(404);
			res.end();
		});

		// act
		const response = await _client.get<{ id: number; name: string }>(
			'/users/1',
		);

		// assert
		await expect(response.json()).resolves.toEqual({ id: 1, name: 'Test' });
	});
});
```

For pure unit tests (no HTTP involved), prefer `vi.fn()` / `vi.spyOn()` and inject a mocked dependency instead of running a server.

## 🧪 Testing Patterns

### Service Unit Test Pattern with Comprehensive Structure

```typescript
import { describe, test, expect, beforeAll, afterAll, vi } from 'vitest';
import { UserService } from './user.service.ts';
import { CreateUserDto } from '../schemas/user.dto.ts';

describe('UserService', () => {
	interface UserRepository {
		findById(id: number): Promise<unknown>;
		findByEmail(email: string): Promise<unknown>;
		create(data: CreateUserDto): Promise<unknown>;
		update(id: number, data: Partial<CreateUserDto>): Promise<unknown>;
		delete(id: number): Promise<void>;
	}

	interface EmailService {
		sendWelcomeEmail(email: string): Promise<boolean>;
	}

	let _userService: UserService;
	let _mockRepository: import('vitest-mock-extended').MockProxy<UserRepository>;
	let _mockEmailService: import('vitest-mock-extended').MockProxy<EmailService>;

	// hooks section
	beforeAll(async () => {
		const { mock } = await import('vitest-mock-extended');

		// mocks setup
		_mockRepository = mock<UserRepository>();
		_mockEmailService = mock<EmailService>();

		_userService = new UserService(_mockRepository, _mockEmailService);
	});

	afterAll(async () => {
		vi.clearAllMocks();
	});

	// tests section
	test('should create user successfully', async () => {
		// arrange
		const _userData: CreateUserDto = {
			name: 'John Doe',
			email: 'john@example.com',
			age: 30,
		};

		const _expectedUser = {
			id: 'user-123',
			..._userData,
			createdAt: new Date(),
		};

		_mockRepository.findByEmail.mockResolvedValue(null);
		_mockRepository.create.mockResolvedValue(_expectedUser);
		_mockEmailService.sendWelcomeEmail.mockResolvedValue(true);

		// act
		const _result = await _userService.create(_userData);

		// assert
		expect(_result).toEqual(
			expect.objectContaining({
				id: expect.any(String),
				name: _userData.name,
				email: _userData.email,
				age: _userData.age,
			}),
		);

		expect(_mockRepository.findByEmail).toHaveBeenCalledWith(
			_userData.email,
		);
		expect(_mockRepository.create).toHaveBeenCalledWith(_userData);
		expect(_mockEmailService.sendWelcomeEmail).toHaveBeenCalledWith(
			_userData.email,
		);
	});

	test('should throw error when email already exists', async () => {
		// arrange
		const _userData: CreateUserDto = {
			name: 'John Doe',
			email: 'existing@example.com',
			age: 30,
		};

		_mockRepository.findByEmail.mockResolvedValue({ id: 'existing-user' });

		// act & assert
		await expect(_userService.create(_userData)).rejects.toThrow(
			'Email already exists',
		);

		expect(_mockRepository.create).not.toHaveBeenCalled();
		expect(_mockEmailService.sendWelcomeEmail).not.toHaveBeenCalled();
	});
});
```

### Controller Unit Test Pattern

```typescript
import { describe, test, expect, beforeAll, afterAll, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller.ts';
import { UserService } from '../services/user.service.ts';
import { CreateUserDto } from '../schemas/user.dto.ts';

describe('UserController', () => {
	let _controller: UserController;
	let _userService: UserService;

	// hooks section
	beforeAll(async () => {
		const _module: TestingModule = await Test.createTestingModule({
			controllers: [UserController],
			providers: [
				{
					provide: UserService,
					useValue: {
						findById: vi.fn(),
						create: vi.fn(),
						update: vi.fn(),
						delete: vi.fn(),
						getPublicUsers: vi.fn(),
					},
				},
			],
		}).compile();

		_controller = _module.get<UserController>(UserController);
		_userService = _module.get<UserService>(UserService);
	});

	afterAll(async () => {
		vi.clearAllMocks();
	});

	// tests section
	test('should create user successfully', async () => {
		// arrange
		const _createUserDto: CreateUserDto = {
			name: 'John Doe',
			email: 'john@example.com',
			age: 30,
		};

		const _expectedResult = {
			id: 'user-123',
			..._createUserDto,
			createdAt: new Date(),
		};

		vi.mocked(_userService.create).mockResolvedValue(_expectedResult);

		// act
		const _result = await _controller.createUser(_createUserDto);

		// assert
		expect(_result).toEqual(_expectedResult);
		expect(_userService.create).toHaveBeenCalledWith(_createUserDto);
	});

	test('should handle validation errors gracefully', async () => {
		// arrange
		const _invalidDto = {
			name: '',
			email: 'invalid-email',
		} as CreateUserDto;

		vi.mocked(_userService.create).mockRejectedValue(
			new Error('Validation failed'),
		);

		// act & assert
		await expect(_controller.createUser(_invalidDto)).rejects.toThrow(
			'Validation failed',
		);
	});
});
```

### Mock Factory Pattern for Vitest

```typescript
import { MockedObject } from 'vitest';

export const createMockFactory = <T extends Record<string, unknown>>(
	methods: (keyof T)[],
): MockedObject<T> => {
	const mock = {} as MockedObject<T>;
	methods.forEach((method) => {
		mock[method] = vi.fn() as unknown as MockedObject<T>[typeof method];
	});
	return mock;
};

// usage in tests
describe('UserService with Mock Factory', () => {
	let service: UserService;
	let userRepository: MockedObject<UserRepository>;

	beforeEach(async () => {
		userRepository = createMockFactory<UserRepository>([
			'create',
			'findByEmail',
			'findMany',
			'count',
		]);

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				UserService,
				{
					provide: UserRepository,
					useValue: userRepository,
				},
			],
		}).compile();

		service = module.get<UserService>(UserService);
	});

	// ...tests
});
```

### Test Data Builders Pattern

```typescript
import { faker } from '@faker-js/faker';

export class UserDtoBuilder {
	private user: Partial<UserDto> = {};

	static create(): UserDtoBuilder {
		return new UserDtoBuilder();
	}

	withId(id: number): this {
		this.user.id = id;
		return this;
	}

	withEmail(email: string): this {
		this.user.email = email;
		return this;
	}

	withRandomData(): this {
		this.user = {
			id: faker.number.int({ min: 1, max: 1000 }),
			email: faker.internet.email(),
			firstName: faker.person.firstName(),
			lastName: faker.person.lastName(),
			role: faker.helpers.arrayElement(['admin', 'user', 'moderator']),
			isActive: faker.datatype.boolean(),
			createdAt: faker.date.past(),
			updatedAt: faker.date.recent(),
		};
		return this;
	}

	build(): UserDto {
		return this.user as UserDto;
	}

	buildMany(count: number): UserDto[] {
		return Array.from({ length: count }, () =>
			UserDtoBuilder.create().withRandomData().build(),
		);
	}
}

// usage in tests
describe('UserService with Test Builders', () => {
	it('should handle multiple users', async () => {
		// arrange
		const users = UserDtoBuilder.create().buildMany(5);
		const testUser = UserDtoBuilder.create()
			.withEmail('specific@example.com')
			.withRandomData()
			.build();

		userRepository.findMany.mockResolvedValue(users);

		// act
		const result = await service.findAll({ page: 1, limit: 10 });

		// assert
		expect(result.data).toEqual(users);
	});
});
```

## 📊 Repository Patterns

### ORM-Agnostic Repository Pattern

This template does not ship with a database/ORM by default. Keep repositories ORM-agnostic so you can plug in Prisma, TypeORM, SQL clients, HTTP backends, etc.

```typescript
export interface FindManyOptions<Where = unknown, OrderBy = unknown> {
	offset?: number;
	limit?: number;
	where?: Where;
	orderBy?: OrderBy;
}

export interface BaseRepository<
	T,
	ID = number,
	Where = unknown,
	OrderBy = unknown,
> {
	create(data: Partial<T>): Promise<T>;
	findById(id: ID): Promise<T | null>;
	findMany(options?: FindManyOptions<Where, OrderBy>): Promise<T[]>;
	update(id: ID, data: Partial<T>): Promise<T>;
	delete(id: ID): Promise<void>;
	count(where?: Where): Promise<number>;
}
```

## 🚀 Performance Patterns

### Caching Pattern

```typescript
@Injectable()
export class CacheService {
	private readonly cache = new Map<
		string,
		{ data: unknown; expiry: number }
	>();

	set(key: string, value: unknown, ttlMs: number = 300000): void {
		const expiry = Date.now() + ttlMs;
		this.cache.set(key, { data: value, expiry });
	}

	get<T>(key: string): T | null {
		const cached = this.cache.get(key);

		if (!cached) {
			return null;
		}

		if (Date.now() > cached.expiry) {
			this.cache.delete(key);
			return null;
		}

		return cached.data;
	}

	invalidate(pattern: string): void {
		const regex = new RegExp(pattern);
		for (const key of this.cache.keys()) {
			if (regex.test(key)) {
				this.cache.delete(key);
			}
		}
	}
}

// cache decorator
export function Cacheable(ttlMs: number = 300000) {
	return function (
		target: unknown,
		propertyName: string,
		descriptor: PropertyDescriptor,
	) {
		const method = descriptor.value;

		descriptor.value = async function (...args: unknown[]) {
			const cacheKey = `${target.constructor.name}:${propertyName}:${JSON.stringify(args)}`;
			const cacheService: CacheService = this.cacheService;

			// try to get from cache
			const cached = cacheService.get(cacheKey);
			if (cached !== null) {
				return cached;
			}

			// execute method and cache result
			const result = await method.apply(this, args);
			cacheService.set(cacheKey, result, ttlMs);

			return result;
		};
	};
}

// usage
@Injectable()
export class UserService {
	constructor(
		private readonly userRepository: UserRepository,
		private readonly cacheService: CacheService,
	) {}

	@Cacheable(600000) // cache for 10 minutes
	async getExpensiveUserData(userId: number): Promise<unknown> {
		// expensive operation
		return this.userRepository.findUserWithComplexData(userId);
	}
}
```

### Background Job Pattern

```typescript
@Injectable()
export class BackgroundJobService {
	private readonly jobs = new Map<string, NodeJS.Timeout>();

	scheduleJob(
		name: string,
		handler: () => Promise<void>,
		intervalMs: number,
	): void {
		// clear existing job if exists
		if (this.jobs.has(name)) {
			clearInterval(this.jobs.get(name));
		}

		const jobId = setInterval(async () => {
			try {
				await handler();
			} catch (error) {
				console.error(`Job ${name} failed:`, error);
			}
		}, intervalMs);

		this.jobs.set(name, jobId);
	}

	cancelJob(name: string): void {
		const jobId = this.jobs.get(name);
		if (jobId) {
			clearInterval(jobId);
			this.jobs.delete(name);
		}
	}

	onModuleDestroy(): void {
		// clean up all jobs
		for (const [name] of this.jobs) {
			this.cancelJob(name);
		}
	}
}

// usage
@Injectable()
export class UserService implements OnModuleInit {
	constructor(
		private readonly backgroundJobs: BackgroundJobService,
		private readonly userRepository: UserRepository,
	) {}

	onModuleInit(): void {
		// schedule cleanup job every hour
		this.backgroundJobs.scheduleJob(
			'cleanup-inactive-users',
			() => this.cleanupInactiveUsers(),
			60 * 60 * 1000, // 1 hour
		);
	}

	private async cleanupInactiveUsers(): Promise<void> {
		const cutoffDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000); // 90 days ago
		await this.userRepository.deleteInactiveUsersBefore(cutoffDate);
	}
}
```

## 📝 OpenAPI Documentation Patterns

### Complete Controller with Documentation

```typescript
// user.controller.ts
import {
	Controller,
	Get,
	Post,
	Put,
	Delete,
	Param,
	Body,
} from '@nestjs/common';
import { ApiKey, AllowAnonymous } from '#common/security';
import { ZodValidationPipe } from '#libs/zod';
import { ApplyDocs } from '#common/decorators/apply.decorator.ts';
import { UserService } from '../services/user.service.ts';
import {
	CreateUserDto,
	UpdateUserDto,
	UserResponseDto,
} from '../schemas/user.dto.ts';
import { UserControllerDocs } from './user.controller.docs.ts';

@Controller({ path: 'users', version: '1' })
@ApiKey()
@ApplyDocs(UserControllerDocs)
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Get('public')
	@AllowAnonymous()
	async getPublicUsers(): Promise<UserResponseDto[]> {
		return this.userService.getPublicUsers();
	}

	@Get(':id')
	async getUserById(@Param('id') id: string): Promise<UserResponseDto> {
		return this.userService.findById(id);
	}

	@Post()
	async createUser(
		@Body(ZodValidationPipe) userData: CreateUserDto,
	): Promise<UserResponseDto> {
		return this.userService.create(userData);
	}

	@Put(':id')
	async updateUser(
		@Param('id') id: string,
		@Body(ZodValidationPipe) userData: UpdateUserDto,
	): Promise<UserResponseDto> {
		return this.userService.update(id, userData);
	}

	@Delete(':id')
	async deleteUser(@Param('id') id: string): Promise<void> {
		return this.userService.delete(id);
	}
}
```

### Comprehensive Documentation File

```typescript
// user.controller.docs.ts
import { HttpStatus } from '@nestjs/common';
import {
	ApiTags,
	ApiOperation,
	ApiParam,
	ApiBody,
	ApiResponse,
} from '@nestjs/swagger';
import { type DecoratorsLookUp } from '#common/decorators/apply.decorator.ts';
import { UserController } from './user.controller.ts';
import {
	CreateUserDto,
	UpdateUserDto,
	UserResponseDto,
} from '../schemas/user.dto.ts';

export const UserControllerDocs: DecoratorsLookUp<UserController> = {
	class: [ApiTags('Users')],

	common: {
		method: [
			ApiResponse({
				description: 'Internal server error',
				status: HttpStatus.INTERNAL_SERVER_ERROR,
			}),
		],
	},

	method: {
		getPublicUsers: [
			ApiOperation({
				summary: 'Get public user list',
				description:
					'Retrieves a list of public user profiles without sensitive information',
			}),
			ApiResponse({
				description: 'List of public users',
				status: HttpStatus.OK,
				schema: {
					type: 'array',
					items: UserResponseDto.jsonSchema,
				},
			}),
		],

		getUserById: [
			ApiOperation({
				summary: 'Get user by ID',
				description:
					'Retrieves detailed user information by unique identifier',
			}),
			ApiParam({
				name: 'id',
				description: 'User unique identifier',
				example: '123e4567-e89b-12d3-a456-426614174000',
			}),
			ApiResponse({
				description: 'User found successfully',
				status: HttpStatus.OK,
				schema: UserResponseDto.jsonSchema,
			}),
			ApiResponse({
				description: 'User not found',
				status: HttpStatus.NOT_FOUND,
			}),
		],

		createUser: [
			ApiOperation({
				summary: 'Create new user',
				description:
					'Creates a new user account with validation and email verification',
			}),
			ApiBody({
				schema: CreateUserDto.jsonSchema,
				examples: {
					basic: {
						summary: 'Basic user',
						value: {
							name: 'John Doe',
							email: 'john.doe@example.com',
							age: 30,
						},
					},
					withRole: {
						summary: 'User with role',
						value: {
							name: 'Jane Smith',
							email: 'jane.smith@example.com',
							age: 25,
							role: 'admin',
						},
					},
				},
			}),
			ApiResponse({
				description: 'User created successfully',
				status: HttpStatus.CREATED,
				schema: UserResponseDto.jsonSchema,
			}),
			ApiResponse({
				description: 'Validation error or email already exists',
				status: HttpStatus.BAD_REQUEST,
			}),
		],

		updateUser: [
			ApiOperation({
				summary: 'Update user',
				description: 'Updates user information with partial data',
			}),
			ApiParam({
				name: 'id',
				description: 'User unique identifier',
			}),
			ApiBody({
				schema: UpdateUserDto.jsonSchema,
				examples: {
					nameUpdate: {
						summary: 'Update name only',
						value: { name: 'Updated Name' },
					},
					fullUpdate: {
						summary: 'Update multiple fields',
						value: {
							name: 'Updated Name',
							age: 35,
						},
					},
				},
			}),
			ApiResponse({
				description: 'User updated successfully',
				status: HttpStatus.OK,
				schema: UserResponseDto.jsonSchema,
			}),
			ApiResponse({
				description: 'User not found',
				status: HttpStatus.NOT_FOUND,
			}),
		],

		deleteUser: [
			ApiOperation({
				summary: 'Delete user',
				description:
					'Permanently deletes a user account and all associated data',
			}),
			ApiParam({
				name: 'id',
				description: 'User unique identifier',
			}),
			ApiResponse({
				description: 'User deleted successfully',
				status: HttpStatus.NO_CONTENT,
			}),
			ApiResponse({
				description: 'User not found',
				status: HttpStatus.NOT_FOUND,
			}),
		],
	},
};
```

These patterns provide a solid foundation for building maintainable, scalable, and well-structured NestJS applications. Each pattern follows the established conventions and best practices outlined in the coding standards while leveraging the built-in libraries and tools available in the template.
