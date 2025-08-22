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

- Replace globally these terms:
    - `(((base-path)))` api base path, i.e. sample (for get /api/sample/v*/*)
    - `(((app-name)))` app name, i.e. sample-api
    - `(((app-title)))` app title, i.e. Sample API
    - `(((project-name)))` project name, i.e. my-project

- Install [NodeJS](https://nodejs.org/es/).
- Install [PNPM](https://pnpm.io/installation)
- Execute `pnpm install` command.
- Run either `pnpm start:dev` or `pnpm test:dev` commands.

- Using Docker.
    - Exec `pnpm exec env export -p ".env" -e dev -m build`
    - Exec `docker build --no-cache -f Dockerfile --tag image_name .`
    - Exec `docker run --env-file .env -d -it -p 8080:8080/tcp --name container_name image_name`
    - Open `http://localhost:8080/api/(((base-path)))` in browser

## 📋 **Branches and Environments**

Project has 2 environments (infrastructure) base for project building.

- **dev (development)**: environment with breaking changes and new features.
- **release (production)**: release environment.

## 🧪 **Executing**

Project uses **npm scripts** for eases execution, testing and building.
Many of these script run on a defined environment, specified after ':', and
it environment may be 'dev' or 'release'.

| Command                      | Action                       |
| ---------------------------- | ---------------------------- |
| node start:`<env>`           | executes the app             |
| pnpm build:`<env>`           | build the app                |
| pnpm preview                 | builds and serves the app    |
| pnpm test:`<env>`            | executes tests               |
| pnpm test:`<env>` --coverage | executes tests with coverage |
| pnpm env:schema              | updates env JSON schema      |
| pnpm format                  | code format                  |
| pnpm lint                    | code style review            |

## 🔥 **Helping Commands**

| Command                     | Action                    |
| --------------------------- | ------------------------- |
| (get-command node.exe).Path | get current node exe path |

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

| Feature                | Usage                        |
| ---------------------- | ---------------------------- |
| **Basic Requests**     | `client.get<T>(url)`         |
| **Module Integration** | `HttpModule.forRoot(config)` |
| **Error Handling**     | `HttpError`, `TimeoutError`  |
| **Authentication**     | Built-in basic auth support  |

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
	canActivate(context: ExecutionContext): boolean {
		const request = context.switchToHttp().getRequest();
		return request.headers['x-api-key'] === process.env.API_KEY;
	}
}

export const [ApiKeySecurity, AllowAnonymous] =
	createSecurityGuard(ApiKeyGuard);
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
import { UserDto } from '../schemas/user.dto';

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
import { ApiKey, AllowAnonymous } from '../../../decorators/api-key.guard';
import { ApplyControllerDocs } from '../../../decorators/docs.decorator';
import { UserDto } from '../schemas/user.dto';
import { UserService } from '../services/user.service';
import { UserControllerDocs } from './user.controller.docs';

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
import { UserController } from './controllers/user.controller';
import { UserService } from './services/user.service';

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
import { SampleModule, UserModule } from './modules';

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
