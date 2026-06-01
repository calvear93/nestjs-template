---
applyTo: 'src/**/*.{ts,cts,mts}'
description: 'TypeScript code style: formatting, naming, suffixes, comments, test style, anti-patterns'
---

# Coding Standards

Deep reference for **how a line of code should look**. High-level rules are in
[AGENTS.md](../../AGENTS.md); structure/wiring is in [architecture-guide](architecture-guide.instructions.md);
worked recipes are in [patterns](patterns.instructions.md). This document does not repeat those.

## Formatting

- **Indentation:** tabs, width 4 (never spaces).
- **Line length:** ~80 characters; break long lines.
- **Quotes:** single quotes.
- **Semicolons:** always.
- **Trailing commas:** in all multi-line constructs.
- **Arrow params:** always parenthesized — `(x) => ...`.
- **Bracket spacing:** spaces inside object braces; closing bracket on its own line.
- **Complexity:** max cyclomatic complexity 15; avoid magic numbers (use named constants).
- **Cleanliness:** remove unused imports/vars; prefer `const`; never `var`.

## Naming conventions

### Classes, interfaces, types, enums — PascalCase

```typescript
export class UserService {}
export interface UserData {}
export type UserRole = 'admin' | 'user';

// PascalCase enum, SCREAMING_SNAKE_CASE members; prefer const enum for performance
const enum UserStatus {
	ACTIVE,
	INACTIVE,
	PENDING_VERIFICATION,
}
```

### Methods, variables, properties — camelCase; private members `_`-prefixed

```typescript
const userData = {};
const isUserActive = true;

@Injectable()
export class UserService {
	constructor(private readonly _repository: UserRepository) {}

	private _validateInput() {}
}
```

Avoid `#` private fields — use the `private` modifier for better DI/introspection.

### Constants — SCREAMING_SNAKE_CASE

```typescript
const MAX_RETRY_ATTEMPTS = 3;
const DEFAULT_TIMEOUT_MS = 10_000;
// NOTE: never hardcode environment-specific URLs — inject them via config.
```

### Booleans — meaningful prefixes (`is`, `has`, `can`, `are`)

```typescript
const isEnabled = false;
const hasAccess = true;
// avoid negative names (isNotEnabled) except as a deliberate optimization
```

### Files & directories — kebab-case

`user.service.ts`, `user.controller.ts`, `create-user.dto.ts`, `user-management/`.

## File suffixes

| Suffix                | Purpose                 | Example                     |
| --------------------- | ----------------------- | --------------------------- |
| `.module.ts`          | NestJS module           | `user.module.ts`            |
| `.controller.ts`      | Controller (endpoints)  | `user.controller.ts`        |
| `.controller.docs.ts` | OpenAPI documentation   | `user.controller.docs.ts`   |
| `.service.ts`         | Business logic service  | `user.service.ts`           |
| `.dto.ts`             | Zod schemas + DTOs      | `create-user.dto.ts`        |
| `.guard.ts`           | Guards                  | `api-key.guard.ts`          |
| `.decorator.ts`       | Custom decorators       | `docs.decorator.ts`         |
| `.pipe.ts`            | Pipes                   | `zod.pipe.ts`               |
| `.interface.ts`       | Interfaces              | `user.interface.ts`         |
| `.type.ts`            | Type definitions        | `user.type.ts`              |
| `.config.ts`          | Configuration factories | `feature.config.ts`         |
| `.factory.ts`         | Factory functions       | `security-guard.factory.ts` |
| `.spec.ts`            | Unit tests              | `user.service.spec.ts`      |

## TypeScript rules

### Explicit types; interfaces for objects, type aliases for unions

```typescript
interface UserConfig {
	readonly apiKey: string;
	timeout: number;
}

type UserRole = 'admin' | 'user' | 'moderator';
```

Always type function parameters and return types. Never `any` — prefer `unknown` + narrowing.

### Prefer arrow functions and inline typing

```typescript
const sum = (n1: number, n2: number) => n1 + n2;
export type SumFn = typeof sum;
```

### Default params over post-assignment; optional over `| undefined`

```typescript
const greet = (name = 'world') => `hello ${name}`;
const find = (id?: string) => {};
```

### Parameter objects for more than 3 arguments

```typescript
interface ProcessUserInput {
	id: number;
	name: string;
	email: string;
	age: number;
}

const processUser = ({ id, name, email, age }: ProcessUserInput) => {};
```

### Nullish coalescing & assignment

```typescript
const value = maybe ?? 'default'; // not `maybe || 'default'`
config.timeout ??= 10_000;
```

### DTOs with Zod

```typescript
// provide a schema name so OpenAPI documents the model correctly
const UserSchema = z
	.object({
		id: z.coerce.number(),
		name: z.string().min(1),
		email: z.email(),
		phone: phone(), // custom validator from #libs/zod
		createdAt: epoch(), // custom validator from #libs/zod
	})
	.meta({ description: 'User DTO schema' });

export class UserDto extends ZodDto(UserSchema, 'User') {}
```

## Comments

### Inline — lowercase (except proper nouns/acronyms), single leading space

```typescript
const userData = {}; // user information object
const jwtToken = '...'; // JWT authentication token
// never leave a blank line directly after a single-line comment
```

### Anchor comments

```typescript
// TODO: #123456 add case-insensitive support
// FIXME: #123457 handle empty lists
// NOTE: this requires special attention
```

### JSDoc — main description starts uppercase; tags/params lowercase

```typescript
/**
 * Creates a new user in the system.
 *
 * @param userData - the user data to create
 * @returns the created user
 * @throws {BadRequestException} when user data is invalid
 * @throws {NotFoundException} when the user id is not found
 */
async createUser(userData: CreateUserDto): Promise<UserDto> {}
```

### Meaningful over obvious

```typescript
// ❌ restates the code
this.users.push(user); // adds user to users array

// ✅ explains the why / business rule
// trial users have limited access until they upgrade
if (user.trialExpired && !user.isPremium) {
	throw new ForbiddenException('Trial period expired');
}
```

## Test style

Worked test examples live in [patterns](patterns.instructions.md). The required **style** for every test:

- Use `test()` (not `it()`).
- Section comments, in order: `// shared variables`, `// mocks`, `// hooks`, `// tests`.
- Case structure: `// arrange`, `// act`, `// assert` (or `// act & assert` when combined).

```typescript
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
	test('returns the user when the id exists', async () => {
		// arrange
		repository.findById.mockResolvedValue({ id: 1, name: 'John' });

		// act
		const result = await service.findById(1);

		// assert
		expect(result).toEqual({ id: 1, name: 'John' });
	});
});
```

## Anti-patterns to avoid

- `any` types — always provide explicit types.
- Unhandled promises — always `await` and handle errors with proper HTTP exceptions.
- `var`, function declarations (prefer `const` arrow functions), mixing tabs/spaces.
- Regular `enum` where `const enum` suffices.
- Reading `process.env` outside the config layer.
- Fat controllers — keep HTTP concerns in controllers, logic in services.
- Skipping `ZodDto`/validation on inputs, or OpenAPI docs on endpoints.
- Non-meaningful names, redundant context (`Car.carModel` → `Car.model`).
- Obvious, outdated, or commented-out code (use version control instead).
- Too many positional parameters (use a parameter object); `||` for null coalescing (use `??`).
