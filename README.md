<h2 align="center"><b>NestJS Skeleton</b></h2>
<h3 align="center"><b>API</b></h3>

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

<p align="center">
  A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.
</p>

<p align="center">
  <a href="https://github.com/calvear93/nestjs-template" target="_blank">
	<img src="https://img.shields.io/github/license/calvear93/nestjs-template" alt="Package License" />
  </a>
</p>

## 📥 **Getting Started**

> ⚡ **Quick start:** run `pwsh ./INIT.ps1` to configure the project interactively — it fills the placeholders below, formats the result, and removes itself.

Otherwise, replace these terms across the project by hand:

- `(((project-name)))` — repo/project name, e.g. `my-project`
- `(((app-name)))` — package/app name, e.g. `sample-api`
- `(((app-title)))` — human-readable title, e.g. `Sample API`
- `(((app-description)))` — short description of the app
- `(((base-path)))` — base API path segment, e.g. `sample` (empty = `/api`)

1. Install [Node.js](https://nodejs.org/) — see `engines.node` in `package.json` (**Node `>=24`**).
2. Install [pnpm](https://pnpm.io/installation).
3. Run `pnpm install`.
4. Start with `pnpm start:dev` (or run tests with `pnpm test:dev`).

> The `env` CLI (`@calvear/env`) loads variables from `env/` before each command. The app runs on Fastify with API versioning enabled.

### Docker

- Export environment variables for build mode:
    - `pnpm exec env export -e dev -m build -p .env`
- Build and run:
    - `docker build --no-cache -f Dockerfile --tag image_name .`
    - `docker run --env-file .env -d -it -p 8080:8080/tcp --name container_name image_name`
- Open `http://localhost:8080/api/(((base-path)))`.

## 📋 **Environments**

This template ships with two `env` environments:

- **dev**: development environment
- **release**: production-like environment

These are environment profiles loaded by the `env` CLI (not necessarily Git branches).

## 🧪 **Executing**

Project uses **pnpm scripts** to run, test and build.
Some scripts are environment-specific, using the suffix `:<env>` where `<env>` is `dev` or `release`.

| Command                      | Action                       |
| ---------------------------- | ---------------------------- |
| pnpm start:`<env>`           | executes the app             |
| pnpm build:`<env>`           | build the app                |
| pnpm preview                 | builds and serves the app    |
| pnpm test:`<env>`            | executes tests               |
| pnpm test:`<env>` --coverage | executes tests with coverage |
| pnpm env:schema              | updates env JSON schema      |
| pnpm format                  | code format                  |
| pnpm lint                    | code style review            |

## 🔥 **Helping Commands**

| Command                       | Action                    |
| ----------------------------- | ------------------------- |
| `(Get-Command node.exe).Path` | get current node exe path |

## 📚 **Built-in Libraries**

This template includes several custom libraries to accelerate development:

### **Zod Integration Library**

Type-safe validation with automatic OpenAPI documentation.

📖 **[Full Documentation](src/libs/zod/README.md)**

| Feature               | Usage                          |
| --------------------- | ------------------------------ |
| **ZodDto Creation**   | `ZodDto(schema, 'ModelName')`  |
| **Array Validation**  | `ZodIterableDto(schema, name)` |
| **Validation Pipe**   | `@Body(ZodValidationPipe)`     |
| **Custom Validators** | `phone()`, `epoch()`           |

```typescript
// Example: Create typed DTO
const UserSchema = z.object({
	name: z.string().min(1),
	email: z.email(),
	age: z.number().optional(),
});

export class UserDto extends ZodDto(UserSchema, 'User') {}
```

### **HTTP Client Library**

Modern Fetch-based HTTP client with NestJS integration.

📖 **[Full Documentation](src/libs/http/README.md)**

| Feature                | Usage                         |
| ---------------------- | ----------------------------- |
| **Basic Requests**     | `client.get<T>(url)`          |
| **Module Integration** | `HttpModule.register(config)` |
| **Error Handling**     | `HttpError`, `TimeoutError`   |
| **Authentication**     | Built-in basic auth support   |

```typescript
// Example: HTTP Client usage
const client = new HttpClient({
	url: 'https://api.example.com',
	timeout: 5000,
	headers: { Authorization: 'Bearer token' },
});

const users = await client.get<User[]>('/users');
```

### **Security Decorators Library**

Type-safe security guard factory with argument injection.

📖 **[Full Documentation](src/libs/decorators/README.md)**

| Feature                  | Usage                          |
| ------------------------ | ------------------------------ |
| **Guard Creation**       | `createSecurityGuard(Guard)`   |
| **Argument Injection**   | Pre-configure guard parameters |
| **Conditional Security** | Enable/disable by environment  |
| **Allow Anonymous**      | `@AllowAnonymous()`            |

```typescript
// Example: Security Guard
@Injectable()
export class ApiKeyGuard implements SecurityGuard {
	canActivate(
		context: ExecutionContext,
		headerName: string,
		apiKey: string,
	): boolean {
		const request = context.switchToHttp().getRequest();
		return request.headers[headerName] === apiKey;
	}
}

const HEADER_NAME = process.env.SECURITY_HEADER_NAME;
const API_KEY = process.env.SECURITY_API_KEY;
const ENABLED = process.env.SECURITY_ENABLED === 'true' && !!API_KEY;

export const [ApiKeySecurity, AllowAnonymous] = createSecurityGuard(
	ApiKeyGuard,
	ENABLED,
	HEADER_NAME,
	API_KEY,
);
```

## 🚀 **Creating New Modules**

Follow this step-by-step guide to create new feature modules:

### **1. Module Structure**

Create a new module following the established pattern:

```bash
src/app/modules/your-module/
├── controllers/
│   ├── your-module.controller.ts      # Main controller
│   ├── your-module.controller.docs.ts # OpenAPI docs
│   └── your-module.controller.spec.ts # Tests
├── services/
│   ├── your-module.service.ts         # Business logic
│   └── your-module.service.spec.ts    # Tests
├── schemas/
│   └── your-module.dto.ts             # DTOs with Zod
└── your-module.module.ts              # Module definition
```

### **2. Implementation Steps**

| Step  | File                                         | Description                        |
| ----- | -------------------------------------------- | ---------------------------------- |
| **1** | `schemas/your-module.dto.ts`                 | Define Zod schemas and DTOs        |
| **2** | `services/your-module.service.ts`            | Implement business logic           |
| **3** | `controllers/your-module.controller.ts`      | Create API endpoints               |
| **4** | `controllers/your-module.controller.docs.ts` | Add OpenAPI documentation          |
| **5** | `your-module.module.ts`                      | Register providers and controllers |
| **6** | `modules/index.ts`                           | Export the new module              |
| **7** | `app.module.ts`                              | Import the module                  |

### **3. Code Templates**

#### **DTO Schema**

```typescript
// schemas/user.dto.ts
import { ZodDto } from '#libs/zod';
import { z } from 'zod';

const UserSchema = z
	.object({
		id: z.coerce.number(),
		name: z.string().min(1),
		email: z.email(),
		age: z.number().optional(),
	})
	.meta({ description: 'User DTO schema' });

export class UserDto extends ZodDto(UserSchema, 'User') {}
```

#### **Service**

```typescript
// services/user.service.ts
import { Injectable } from '@nestjs/common';
import { UserDto } from '../schemas/user.dto.ts';

@Injectable()
export class UserService {
	async findAll(): Promise<UserDto[]> {
		// Business logic here
		return [];
	}

	async create(user: UserDto): Promise<UserDto> {
		// Creation logic here
		return user;
	}
}
```

#### **Controller**

```typescript
// controllers/user.controller.ts
import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiKey, AllowAnonymous } from '../../../decorators/api-key.guard.ts';
import { ApplyControllerDocs } from '../../../decorators/docs.decorator.ts';
import { UserDto } from '../schemas/user.dto.ts';
import { UserService } from '../services/user.service.ts';
import { UserControllerDocs } from './user.controller.docs.ts';

@ApiKey()
@Controller({ path: 'users', version: '1' })
@ApplyControllerDocs(UserControllerDocs)
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Get()
	async findAll(): Promise<UserDto[]> {
		return this.userService.findAll();
	}

	@Post()
	async create(@Body() user: UserDto): Promise<UserDto> {
		return this.userService.create(user);
	}
}
```

#### **Module Definition**

```typescript
// user.module.ts
import { Module } from '@nestjs/common';
import { UserController } from './controllers/user.controller.ts';
import { UserService } from './services/user.service.ts';

@Module({
	providers: [UserService],
	controllers: [UserController],
	exports: [UserService], // Export if needed by other modules
})
export class UserModule {}
```

#### **Module Registration**

```typescript
// modules/index.ts
export { SampleModule } from './sample/sample.module';
export { UserModule } from './user/user.module'; // Add your module

// app.module.ts
import { Module } from '@nestjs/common';
import { SampleModule, UserModule } from './modules/index.ts';

@Module({
	imports: [SampleModule, UserModule], // Import your module
})
export class AppModule {}
```

### **4. Best Practices**

| Practice                   | Description                                                 |
| -------------------------- | ----------------------------------------------------------- |
| **Consistent Naming**      | Use `kebab-case` for files, `PascalCase` for classes        |
| **Separation of Concerns** | Keep controllers thin, put logic in services                |
| **Type Safety**            | Use Zod DTOs for validation and type inference              |
| **Documentation**          | Always create `.docs.ts` files for OpenAPI                  |
| **Testing**                | Create `.spec.ts` files for unit tests                      |
| **Security**               | Apply appropriate guards (`@ApiKey()`, `@AllowAnonymous()`) |

## 🧰 Configuring fnm (Fast Node Manager)

fnm (Fast Node Manager) is a lightweight Node.js version manager used by this template to run multiple Node versions easily.

- Install fnm following the official instructions: https://github.com/Schniz/fnm
- On Windows, fnm stores the default Node alias file at:
  `C:\Users\{username}\AppData\Roaming\fnm\aliases\default`

Important: Add `C:\Users\{username}\AppData\Roaming\fnm\aliases\default` to your Windows System PATH so Node MCP servers can find the fnm-managed Node; then restart your terminals.
