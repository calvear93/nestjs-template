# Decorators Library for NestJS

This library provides advanced decorator utilities for NestJS applications, including a powerful security guard factory and a decorator application system for clean and maintainable code organization.

## 📋 Table of Contents

- [Key Features](#key-features)
- [Basic Usage](#basic-usage)
- [Security Guard Factory](#security-guard-factory)
- [Apply Decorators](#apply-decorators)
- [Advanced Examples](#advanced-examples)
- [API Reference](#api-reference)

## ✨ Key Features

- ✅ **Security Guard Factory** - Type-safe security guard creation with argument injection
- ✅ **Conditional Security** - Enable/disable guards based on environment or configuration
- ✅ **Argument Injection** - Pre-configure guard parameters for flexible reuse
- ✅ **Allow Anonymous** - Selective bypass of security for specific endpoints
- ✅ **Decorator Application** - Clean way to apply multiple decorators to classes and methods
- ✅ **TypeScript Support** - Full type safety with generic types and inference
- ✅ **Swagger Integration** - Automatic API security schema generation

## 🎯 Basic Usage

### Import the library

```typescript
import {
	createSecurityGuard,
	SecurityGuard,
	ApplyToClass,
	ApplyToProperty,
} from '#libs/decorators';
```

### Create a basic security guard

```typescript
// guards/api-key.guard.ts
import { Injectable, ExecutionContext } from '@nestjs/common';
import { SecurityGuard } from '#libs/decorators';

@Injectable()
export class ApiKeyGuard implements SecurityGuard {
	canActivate(
		context: ExecutionContext,
		headerName: string,
		expectedApiKey: string,
	): boolean {
		const request = context.switchToHttp().getRequest();
		const providedApiKey = request.headers[headerName];
		return providedApiKey === expectedApiKey;
	}
}

// Create the decorators
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

Note: keep configuration (API keys, header names, enable flags) out of business logic. If you must read environment variables, do it once at the application boundary and pass values into the guard via arguments.

### Use in controllers

```typescript
// controllers/protected.controller.ts
import { Controller, Get } from '@nestjs/common';
import { ApiKeySecurity, AllowAnonymous } from '../guards/api-key.guard';

@Controller('protected')
@ApiKeySecurity()
export class ProtectedController {
	@Get('secure')
	secureEndpoint() {
		return { message: 'This endpoint requires API key' };
	}

	@Get('public')
	@AllowAnonymous()
	publicEndpoint() {
		return { message: 'This endpoint is public' };
	}
}
```

## 🛡️ Security Guard Factory

The `createSecurityGuard` function is the core feature of this library, enabling you to create reusable, type-safe security decorators with advanced argument injection capabilities.

### Basic Security Guard

```typescript
import { Injectable, ExecutionContext } from '@nestjs/common';
import { createSecurityGuard, SecurityGuard } from '#libs/decorators';

@Injectable()
export class BasicAuthGuard implements SecurityGuard {
	canActivate(context: ExecutionContext): boolean {
		const request = context.switchToHttp().getRequest();
		const authHeader = request.headers.authorization;

		if (!authHeader?.startsWith('Basic ')) return false;

		const credentials = Buffer.from(
			authHeader.slice(6),
			'base64',
		).toString();
		const [username, password] = credentials.split(':');

		return username === 'admin' && password === 'secret';
	}
}

export const [BasicAuth, AllowAnonymous] = createSecurityGuard(BasicAuthGuard);
```

### Advanced Guard with Argument Injection

The factory supports sophisticated argument injection, allowing you to pre-configure some parameters while leaving others to be provided at decoration time.

```typescript
@Injectable()
export class RoleGuard implements SecurityGuard {
	canActivate(
		context: ExecutionContext,
		requiredRole: string,
		allowSuperAdmin: boolean = false,
		requiredPermissions: string[] = [],
	): boolean {
		const request = context.switchToHttp().getRequest();
		const user = request.user;

		// Super admin bypass
		if (allowSuperAdmin && user?.role === 'super-admin') return true;

		// Role check
		if (user?.role !== requiredRole) return false;

		// Permission check
		if (requiredPermissions.length > 0) {
			return requiredPermissions.every((permission) =>
				user?.permissions?.includes(permission),
			);
		}

		return true;
	}
}

// Pre-configure allowSuperAdmin parameter
export const [RequireRole, AllowAnonymous] = createSecurityGuard(
	RoleGuard,
	true, // enabled
	true, // allowSuperAdmin = true
);

// Usage - only need to provide requiredRole and requiredPermissions
@Controller('admin')
export class AdminController {
	@Get('dashboard')
	@RequireRole('admin') // requiredRole parameter
	dashboard() {
		return { message: 'Admin dashboard' };
	}

	@Get('users')
	@RequireRole('manager', ['users:read']) // requiredRole, requiredPermissions
	users() {
		return { message: 'User management' };
	}
}
```

### Conditional Security

You can enable or disable security based on environment or configuration:

```typescript
// Disable security in development
const isProduction = process.env.NODE_ENV === 'production';

export const [JwtSecurity, AllowAnonymous] = createSecurityGuard(
	JwtAuthGuard,
	isProduction, // Only enable in production
);

// In development, all endpoints behave as if they have @AllowAnonymous()
// In production, normal JWT validation applies
```

### Multiple Security Layers

```typescript
// Create different security decorators for different purposes
export const [JwtAuth, JwtAllowAnonymous] = createSecurityGuard(JwtAuthGuard);
export const [AdminRole, AdminAllowAnonymous] =
	createSecurityGuard(AdminRoleGuard);

const HEADER_NAME = process.env.SECURITY_HEADER_NAME;
const API_KEY = process.env.SECURITY_API_KEY;
const ENABLED = process.env.SECURITY_ENABLED === 'true' && !!API_KEY;

export const [ApiKeyAuth, ApiKeyAllowAnonymous] = createSecurityGuard(
	ApiKeyGuard,
	ENABLED,
	HEADER_NAME,
	API_KEY,
);

@Controller('secure')
@JwtAuth()
export class SecureController {
	@Get('user-data')
	userData() {
		return { message: 'User data - requires JWT' };
	}

	@Get('admin-panel')
	@AdminRole()
	adminPanel() {
		return { message: 'Admin panel - requires JWT + admin role' };
	}

	@Get('api-endpoint')
	@ApiKeyAuth()
	@JwtAllowAnonymous() // Allow JWT bypass but still require API key
	apiEndpoint() {
		return { message: 'API endpoint - requires API key only' };
	}
}
```

## 🎨 Apply Decorators

The library also provides utilities for applying multiple decorators in a clean and organized way.

### ApplyToClass Decorator

Apply multiple decorators to a class and its methods using a configuration object:

```typescript
import { ApplyToClass, DecoratorsLookUp } from '#libs/decorators';
import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

// Define decorators configuration
const UserControllerDecorators: DecoratorsLookUp<UserController> = {
	class: [Controller('users'), ApiTags('Users'), UseGuards(AuthGuard)],
	method: {
		getUsers: [Get(), ApiOperation({ summary: 'Get all users' })],
		createUser: [Post(), ApiOperation({ summary: 'Create a new user' })],
	},
};

@ApplyToClass(UserControllerDecorators)
export class UserController {
	getUsers() {
		return { users: [] };
	}

	createUser() {
		return { message: 'User created' };
	}
}
```

### ApplyToProperty Decorator

Apply decorators to specific properties:

```typescript
import { ApplyToProperty, DecoratorsLookUp } from '#libs/decorators';
import { IsString, IsEmail, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

const UserDtoDecorators: DecoratorsLookUp = {
	property: {
		name: [IsString(), ApiProperty({ description: 'User name' })],
		email: [IsEmail(), ApiProperty({ description: 'User email' })],
		age: [
			IsOptional(),
			ApiProperty({ description: 'User age', required: false }),
		],
	},
};

export class UserDto {
	@ApplyToProperty(UserDtoDecorators)
	name: string;

	@ApplyToProperty(UserDtoDecorators)
	email: string;

	@ApplyToProperty(UserDtoDecorators)
	age?: number;
}
```

### Lazy Decorator Configuration

You can use functions for dynamic decorator configuration:

```typescript
const createControllerDecorators = (): DecoratorsLookUp => ({
	class: [
		Controller(process.env.API_PREFIX || 'api'),
		ApiTags(process.env.API_TAG || 'Default'),
	],
	common: {
		method: [
			UseGuards(
				process.env.NODE_ENV === 'production'
					? ProductionGuard
					: DevGuard,
			),
		],
	},
});

@ApplyToClass(createControllerDecorators)
export class DynamicController {
	@Get()
	getData() {
		return { data: 'Dynamic configuration' };
	}
}
```

## 🚀 Advanced Examples

### Complex Permission System

```typescript
@Injectable()
export class PermissionGuard implements SecurityGuard {
	canActivate(
		context: ExecutionContext,
		resource: string,
		action: string,
		requireOwnership: boolean,
		allowedRoles: string[],
		bypassForSuperAdmin: boolean = true,
	): boolean {
		const request = context.switchToHttp().getRequest();
		const user = request.user;
		const resourceId = request.params.id;

		// Super admin bypass
		if (bypassForSuperAdmin && user?.role === 'super-admin') return true;

		// Role check
		if (!allowedRoles.includes(user?.role)) return false;

		// Resource permission check
		const hasPermission = user?.permissions?.some(
			(perm: any) =>
				perm.resource === resource && perm.actions.includes(action),
		);
		if (!hasPermission) return false;

		// Ownership check
		if (requireOwnership) {
			return (
				user?.id === resourceId ||
				user?.ownedResources?.includes(resourceId)
			);
		}

		return true;
	}
}

// Create specialized decorators for different resources
export const [PostPermission, PostAllowAnonymous] = createSecurityGuard(
	PermissionGuard,
	true,
	'posts', // resource
	'read', // action
);

export const [UserPermission, UserAllowAnonymous] = createSecurityGuard(
	PermissionGuard,
	true,
	'users', // resource
	'read', // action
);

// Usage in controllers
@Controller('posts')
export class PostController {
	@Get()
	@PostPermission(false, ['user', 'admin']) // requireOwnership, allowedRoles
	getAllPosts() {
		return { posts: [] };
	}

	@Get(':id')
	@PostPermission(true, ['user', 'admin']) // requireOwnership, allowedRoles
	getOwnPost() {
		return { post: {} };
	}

	@Delete(':id')
	@PostPermission(true, ['admin'], false) // requireOwnership, allowedRoles, bypassForSuperAdmin
	deletePost() {
		return { message: 'Post deleted' };
	}
}
```

### Environment-Specific Security

```typescript
// config/security.config.ts
export const createSecurityConfig = () => {
	const isProduction = process.env.NODE_ENV === 'production';
	const isDevelopment = process.env.NODE_ENV === 'development';
	const isTestMode = process.env.NODE_ENV === 'test';

	return {
		enableJwtAuth: isProduction || process.env.FORCE_AUTH === 'true',
		enableApiKey: !isDevelopment,
		enableRateLimit: isProduction,
		allowDebugEndpoints: isDevelopment || isTestMode,
	};
};

// guards/conditional.guards.ts
const config = createSecurityConfig();

export const [JwtAuth, JwtAllowAnonymous] = createSecurityGuard(
	JwtAuthGuard,
	config.enableJwtAuth,
);

export const [ApiKeyAuth, ApiKeyAllowAnonymous] = createSecurityGuard(
	ApiKeyGuard,
	config.enableApiKey,
);

export const [RateLimit, RateLimitAllowAnonymous] = createSecurityGuard(
	RateLimitGuard,
	config.enableRateLimit,
);

// controllers/api.controller.ts
@Controller('api')
@JwtAuth()
@ApiKeyAuth()
@RateLimit()
export class ApiController {
	@Get('data')
	getData() {
		return { data: 'Protected data' };
	}

	@Get('debug')
	@JwtAllowAnonymous()
	@ApiKeyAllowAnonymous()
	@RateLimitAllowAnonymous()
	debugEndpoint() {
		if (!createSecurityConfig().allowDebugEndpoints) {
			throw new ForbiddenException('Debug endpoints disabled');
		}
		return { debug: 'Debug information' };
	}
}
```

## 📚 API Reference

### `createSecurityGuard<G, A, SA>(Guard, enabled?, ...args)`

Creates a pair of security decorators for NestJS applications.

#### Parameters

- `Guard: Class<G>` - The guard class implementing `SecurityGuard` interface
- `enabled: boolean` - Whether the security guard is active (default: `true`)
- `...args: SA` - Pre-configured arguments to inject into the guard's `canActivate` method

#### Returns

`[SecurityDecorator, AllowAnonymousDecorator]`

### `SecurityGuard` Interface

```typescript
interface SecurityGuard {
	canActivate(
		context: ExecutionContext,
		...args: any[]
	): Promise<boolean> | boolean;
}
```

### `ApplyToClass(decorators: DecoratorsLookUp): ClassDecorator`

Applies multiple decorators to a class and its methods.

#### Parameters

- `decorators: DecoratorsLookUp` - Configuration object with decorators to apply

### `ApplyToProperty(decorators: DecoratorsLookUp): PropertyDecorator`

Applies multiple decorators to class properties.

#### Parameters

- `decorators: DecoratorsLookUp` - Configuration object with decorators to apply

### `DecoratorsLookUp<T>` Interface

Configuration interface for decorator application:

```typescript
interface DecoratorsLookUp<T extends object = any> {
	common?: {
		method?: MethodDecorator[];
		property?: MethodDecorator[];
	};
	class?: ClassDecorator[];
	method?: ExtractMembersMatching<T, Function, MethodDecorator[]>;
	property?: ExtractMembersMatching<T, PropertyKey, MethodDecorator[]>;
}
```

### Type Utilities

- `CanActivateArgs<T>` - Extracts argument types from a guard's `canActivate` method
- `Optional<T>` - Makes all properties in T optional
- `SubstractLeft<T, U>` - Removes left-side arguments already provided to the factory

## 🎯 Best Practices

### 1. Guard Organization

```typescript
// guards/index.ts
export * from './auth.guards';
export * from './role.guards';
export * from './permission.guards';

// guards/auth.guards.ts
export const [JwtAuth, JwtAllowAnonymous] = createSecurityGuard(JwtAuthGuard);
export const [BasicAuth, BasicAllowAnonymous] =
	createSecurityGuard(BasicAuthGuard);
```

### 2. Environment Configuration

```typescript
// Always configure security based on environment
const securityConfig = {
	enableAuth: process.env.NODE_ENV === 'production',
	strictMode: process.env.SECURITY_STRICT === 'true',
};

export const [AppSecurity, AllowAnonymous] = createSecurityGuard(
	AppGuard,
	securityConfig.enableAuth,
	securityConfig.strictMode,
);
```

### 3. Type Safety

```typescript
// Always implement the SecurityGuard interface for type safety
@Injectable()
export class TypedGuard implements SecurityGuard {
	canActivate(
		context: ExecutionContext,
		role: 'admin' | 'user',
		permissions: string[],
	): boolean {
		// Type-safe implementation
		return true;
	}
}
```

### 4. Documentation

```typescript
// Document your guards and their parameters
@Injectable()
export class DocumentedGuard implements SecurityGuard {
	/**
	 * Validates user access based on role and permissions
	 * @param context - NestJS execution context
	 * @param requiredRole - User role required for access
	 * @param requiredPermissions - List of required permissions
	 * @param allowOwnerBypass - Whether resource owners can bypass role check
	 */
	canActivate(
		context: ExecutionContext,
		requiredRole: string,
		requiredPermissions: string[],
		allowOwnerBypass: boolean = false,
	): boolean {
		// Implementation
		return true;
	}
}
```
