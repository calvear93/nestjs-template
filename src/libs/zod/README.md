# Zod Library for NestJS

This library provides a complete integration of Zod with NestJS, including DTOs, validation pipes, custom validators, and automatic schema generation for OpenAPI/Swagger.

## 📋 Table of Contents

- [Key Features](#key-features)
- [Basic Usage](#basic-usage)
- [Zod DTOs](#zod-dtos)
- [Validation Pipe](#validation-pipe)
- [Custom Validators](#custom-validators)
- [OpenAPI Integration](#openapi-integration)
- [Advanced Examples](#advanced-examples)
- [API Reference](#api-reference)

## ✨ Key Features

- ✅ **Typed DTOs** - Automatic DTO creation from Zod schemas
- ✅ **Automatic Validation** - Validation pipe for NestJS controllers
- ✅ **OpenAPI/Swagger** - Automatic schema generation for documentation
- ✅ **Custom Validators** - Validators for epochs and phone numbers
- ✅ **Type Safety** - Full TypeScript typing
- ✅ **Arrays & Iterables** - Support for arrays, sets, and tuples
- ✅ **Error Handling** - Custom exceptions with detailed messages

### Template Zod Extensions

This template augments Zod with convenience helpers (on top of Zod v4), such as:

- `z.email()`
- `z.uuid()`
- `z.iso.date()`, `z.iso.time()`, `z.iso.datetime()`, `z.iso.duration()`

If you are used to vanilla Zod APIs (e.g. `z.string().email()`), this is expected.

## 🎯 Basic Usage

### Import the library

```typescript
import {
	ZodDto,
	ZodIterableDto,
	ZodValidationPipe,
	epoch,
	phone,
} from '#libs/zod';
```

### Create a basic DTO

```typescript
// user.dto.ts
import { z } from 'zod';
import { ZodDto } from '#libs/zod';

const UserSchema = z.object({
	id: z.number().positive(),
	name: z.string().min(1).max(100),
	email: z.email(),
	age: z.number().min(18).optional(),
	isActive: z.boolean().default(true),
});

export class UserDto extends ZodDto(UserSchema, 'User') {}
```

### Use in a controller

```typescript
// user.controller.ts
import { Controller, Post, Body, UsePipes } from '@nestjs/common';
import { ApiBody, ApiOperation } from '@nestjs/swagger';
import { ZodValidationPipe } from '#libs/zod';
import { UserDto } from './user.dto.ts';

@Controller('users')
export class UserController {
	@Post()
	@UsePipes(ZodValidationPipe)
	@ApiOperation({ summary: 'Create a new user' })
	@ApiBody({ schema: UserDto.jsonSchema })
	async createUser(@Body() userData: UserDto) {
		// userData is automatically validated and typed
		return { message: `User ${userData.name} created successfully` };
	}
}
```

## 📦 Zod DTOs

### ZodDto - For Objects

Used for object, map, and record schemas:

```typescript
import { z } from 'zod';
import { ZodDto } from '#libs/zod';

// complex schema
const ProductSchema = z.object({
	id: z.uuid(),
	name: z.string().min(1, 'Product name is required'),
	price: z.number().positive('Price must be positive'),
	category: z.enum(['electronics', 'clothing', 'books']),
	tags: z.array(z.string()).optional(),
	metadata: z.record(z.string(), z.any()).optional(),
	createdAt: z.iso.date().default(() => new Date()),
});

export class ProductDto extends ZodDto(ProductSchema, 'Product') {}

// usage
const product = new ProductDto({
	id: '123e4567-e89b-12d3-a456-426614174000',
	name: 'Laptop',
	price: 999.99,
	category: 'electronics',
});

// safe validation
const error = product.safeFrom(invalidData);
if (error) {
	console.log('Validation errors:', error.issues);
}
```

### ZodIterableDto - For Arrays and Tuples

Used for arrays, sets, and tuples:

```typescript
import { z } from 'zod';
import { ZodIterableDto } from '#libs/zod';

// array of numbers
const NumberArraySchema = z.array(z.number().positive());
export class NumberArrayDto extends ZodIterableDto(
	NumberArraySchema,
	'NumberArray',
) {}

// tuple with mixed types
const CoordinateSchema = z.tuple([
	z.number(),
	z.number(),
	z.string().optional(),
]);
export class CoordinateDto extends ZodIterableDto(
	CoordinateSchema,
	'Coordinate',
) {}

// usage
const numbers = new NumberArrayDto([1, 2, 3, 4, 5]);
const coordinate = new CoordinateDto([40.7128, -74.006, 'New York']);
```

## 🔍 Validation Pipe

The `ZodValidationPipe` automatically validates incoming data:

```typescript
import { ZodValidationPipe } from '#libs/zod';

// apply globally
app.useGlobalPipes(new ZodValidationPipe());

// apply at controller level
@UsePipes(ZodValidationPipe)
@Controller('api')
export class ApiController {}

// apply to a specific method
@Post()
@UsePipes(ZodValidationPipe)
async create(@Body() data: MyDto) {}
```

### Error Handling

Validation errors are thrown as `ZodSchemaException`:

```typescript
import { ZodSchemaException } from '#libs/zod';

// the pipe automatically throws BadRequestException with error details
// format: "field.subfield: error message"
```

## 🛠️ Custom Validators

### Epoch Validator (Unix Timestamp)

```typescript
import { z } from 'zod';
import { epoch } from '#libs/zod';

const EventSchema = z.object({
	name: z.string(),
	// timestamp in milliseconds (default)
	createdAt: epoch(),
	// timestamp in seconds
	updatedAt: epoch({ seconds: true }),
});

// supported formats:
// - "1753134591" (number as string)
// - "/Date(1753134591)/" (.NET format)
// - Automatically converts to Date object
```

### Phone Validator

```typescript
import { z } from 'zod';
import { phone } from '#libs/zod';

const ContactSchema = z.object({
	name: z.string(),
	phoneNumber: phone(), // validates international formats
});

// supported formats:
// - "+56992641781"
// - "(555) 123-4567"
// - "555-123-4567"
// - "555 123 4567"
// automatically removes spaces
```

## 📚 OpenAPI Integration

### Automatic schema registration

```typescript
// main.ts
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { registerDtoOpenApiSchemas } from '#libs/zod';
import { AppModule } from './app.module';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	// configure Swagger
	const config = new DocumentBuilder()
		.setTitle('API Documentation')
		.setVersion('1.0')
		.build();

	const document = SwaggerModule.createDocument(app, config);

	// register Zod DTO schemas automatically
	registerDtoOpenApiSchemas(document);

	SwaggerModule.setup('api/docs', app, document);

	await app.listen(3000);
}
bootstrap();
```

### Automatic Swagger schemas

DTOs created with `ZodDto` automatically include:

- **Correct data types** (string, number, boolean, etc.)
- **Validations** (min, max, pattern, etc.)
- **Automatic examples**
- **Field descriptions** from Zod comments
- **Optional and required fields**
- **Default values**

## 🚀 Advanced Examples

### DTO with Complex Validations

```typescript
import { z } from 'zod';
import { ZodDto, epoch, phone } from '#libs/zod';

const UserRegistrationSchema = z
	.object({
		// basic information
		firstName: z
			.string()
			.min(2, 'First name must be at least 2 characters')
			.max(50, 'First name cannot exceed 50 characters')
			.regex(
				/^[a-zA-Z\s]+$/,
				'First name can only contain letters and spaces',
			),

		lastName: z
			.string()
			.min(2, 'Last name must be at least 2 characters')
			.max(50, 'Last name cannot exceed 50 characters'),

		// email with HTML5 validation
		email: z
			.email('Invalid email format')
			.toLowerCase()
			.refine(
				(email) => !email.includes('+'),
				'Email cannot contain + symbol',
			),

		// password with security validations
		password: z
			.string()
			.min(8, 'Password must be at least 8 characters')
			.regex(
				/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
				'Password must contain uppercase, lowercase, number and special character',
			),

		// password confirmation
		confirmPassword: z.string(),

		// contact information
		phoneNumber: phone(),

		// birth date
		birthDate: z.coerce
			.date()
			.max(new Date(), 'Birth date cannot be in the future')
			.refine((date) => {
				const age = new Date().getFullYear() - date.getFullYear();
				return age >= 18;
			}, 'Must be at least 18 years old'),

		// registration timestamp
		registrationTime: epoch(),

		// optional preferences
		preferences: z
			.object({
				newsletter: z.boolean().default(false),
				theme: z.enum(['light', 'dark', 'auto']).default('auto'),
				language: z.string().length(2).default('en'),
			})
			.optional(),

		// terms and conditions
		acceptTerms: z.literal(true, {
			error: () => ({
				message: 'You must accept the terms and conditions',
			}),
		}),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: 'Passwords do not match',
		path: ['confirmPassword'],
	});

export class UserRegistrationDto extends ZodDto(
	UserRegistrationSchema,
	'UserRegistration',
) {}
```

### DTO with Discriminated Union

```typescript
const NotificationSchema = z.discriminatedUnion('type', [
	z.object({
		type: z.literal('email'),
		recipient: z.email(),
		subject: z.string(),
		body: z.string(),
	}),
	z.object({
		type: z.literal('sms'),
		phoneNumber: phone(),
		message: z.string().max(160),
	}),
	z.object({
		type: z.literal('push'),
		deviceId: z.string(),
		title: z.string(),
		body: z.string(),
		badge: z.number().optional(),
	}),
]);

export class NotificationDto extends ZodDto(
	NotificationSchema,
	'Notification',
) {}
```

### Array DTO with Validations

```typescript
const BulkUserUpdateSchema = z
	.array(
		z.object({
			id: z.string().uuid(),
			updates: z
				.object({
					name: z.string().optional(),
					email: z.email().optional(),
					isActive: z.boolean().optional(),
				})
				.refine((updates) => Object.keys(updates).length > 0, {
					message: 'At least one field must be updated',
				}),
		}),
	)
	.min(1, 'At least one user update is required')
	.max(100, 'Cannot update more than 100 users at once');

export class BulkUserUpdateDto extends ZodIterableDto(
	BulkUserUpdateSchema,
	'BulkUserUpdate',
) {}
```

## 📖 API Reference

### ZodDto(schema, schemaName?)

Creates a DTO from a Zod schema for objects, maps, or records.

**Parameters:**

- `schema: ZodObject | ZodMap | ZodRecord` - Zod schema
- `schemaName?: string` - Name for OpenAPI registration

**Returns:** DTO class with static `schema` and `jsonSchema` properties

### ZodIterableDto(schema, schemaName?)

Creates a DTO from a Zod schema for arrays, sets, or tuples.

**Parameters:**

- `schema: ZodArray | ZodSet | ZodTuple` - Zod schema
- `schemaName?: string` - Name for OpenAPI registration

**Returns:** DTO class that extends Array with static properties

### ZodValidationPipe

Validation pipe that automatically processes Zod DTOs.

**Methods:**

- `transform(value, metadata)` - Validates and transforms incoming data

### isZodDto(dto)

Checks if an object is a Zod DTO.

**Parameters:**

- `dto: any` - Object to check

**Returns:** `boolean` - true if it's a Zod DTO

### epoch(options?)

Validator for Unix timestamps that converts to Date.

**Parameters:**

- `options.seconds?: boolean` - If true, treats timestamp as seconds (default: false)

### phone()

Validator for international phone numbers.

### registerDtoOpenApiSchemas(document)

Registers all DTO schemas in the OpenAPI document.

**Parameters:**

- `document: OpenAPIObject` - OpenAPI/Swagger document

## 🔧 Customization

### Adding Custom Validators

```typescript
// custom-validators.ts
import { z } from 'zod';

export const creditCard = () =>
	z
		.string()
		.regex(
			/^\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}$/,
			'Invalid credit card format',
		)
		.transform((value) => value.replace(/[\s-]/g, ''))
		.refine((value) => {
			// luhn algorithm
			let sum = 0;
			let alternate = false;
			for (let i = value.length - 1; i >= 0; i--) {
				let digit = parseInt(value.charAt(i));
				if (alternate) {
					digit *= 2;
					if (digit > 9) digit -= 9;
				}
				sum += digit;
				alternate = !alternate;
			}
			return sum % 10 === 0;
		}, 'Invalid credit card number');
```

### Customizing Error Messages

```typescript
const schema = z.object({
	name: z
		.string({
			required_error: 'Name is required',
			invalid_type_error: 'Name must be a string',
		})
		.min(1, 'Name cannot be empty'),
});
```

---

**Note:** This library is specifically designed for NestJS projects with TypeScript. For more information about Zod, check the [official documentation](https://zod.dev/).
