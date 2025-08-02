# HTTP Library for NestJS

This library provides a complete HTTP client integration for NestJS, built on top of the modern Fetch API. It includes a powerful HTTP client, module registration, providers, custom errors, enums, and comprehensive TypeScript support.

## 📋 Table of Contents

- [Key Features](#key-features)
- [Basic Usage](#basic-usage)
- [HTTP Client](#http-client)
- [Module Integration](#module-integration)
- [Provider Usage](#provider-usage)
- [Error Handling](#error-handling)
- [Configuration](#configuration)
- [Advanced Examples](#advanced-examples)
- [API Reference](#api-reference)

## ✨ Key Features

- ✅ **Modern Fetch API** - Built on top of the native Fetch API
- ✅ **TypeScript Support** - Full type safety with generic responses
- ✅ **NestJS Integration** - Module and provider registration
- ✅ **Request Interceptors** - Modify requests before sending
- ✅ **Automatic Serialization** - JSON and URL-encoded data handling
- ✅ **Query Parameters** - Complex query parameter building
- ✅ **Timeout Support** - Configurable request timeouts
- ✅ **Error Handling** - Custom HTTP and timeout errors
- ✅ **Basic Auth** - Built-in basic authentication support

## 🎯 Basic Usage

### Import the library

```typescript
import { HttpClient, HttpModule, HttpProvider } from '#libs/http';
```

### Create a basic HTTP client

```typescript
// basic usage
const client = new HttpClient({
	url: 'https://api.example.com',
	timeout: 5000,
	headers: {
		Authorization: 'Bearer your-token',
	},
});

// making requests
const response = await client.get<{ id: number; name: string }>('/users/1');
console.log(response.data); // typed response data
```

### Use in a NestJS service

```typescript
// user.service.ts
import { Injectable } from '@nestjs/common';
import { HttpClient } from '#libs/http';

@Injectable()
export class UserService {
	constructor(private readonly httpClient: HttpClient) {}

	async getUser(id: number) {
		const response = await this.httpClient.get<User>(`/users/${id}`);
		return response.json();
	}

	async createUser(userData: CreateUserDto) {
		const response = await this.httpClient.post<User>('/users', {
			data: userData,
		});
		return response.json();
	}
}
```

## 🌐 HTTP Client

### Basic HTTP Methods

```typescript
import { HttpClient } from '#libs/http';

const client = new HttpClient({ url: 'https://api.example.com' });

// GET request
const users = await client.get<User[]>('/users');

// POST request with data
const newUser = await client.post<User>('/users', {
	data: {
		name: 'John Doe',
		email: 'john@example.com',
	},
});

// PUT request
const updatedUser = await client.put<User>(`/users/${userId}`, {
	data: { name: 'Jane Doe' },
});

// PATCH request
const patchedUser = await client.patch<User>(`/users/${userId}`, {
	data: { email: 'jane@example.com' },
});

// DELETE request
await client.delete(`/users/${userId}`);
```

### Query Parameters

```typescript
// simple query parameters
const response = await client.get('/users', {
	query: {
		page: 1,
		limit: 10,
		status: 'active',
	},
});
// URL: /users?page=1&limit=10&status=active

// complex nested parameters
const response = await client.get('/search', {
	query: {
		filter: {
			name: 'John',
			age: 25,
		},
		sort: ['name', 'email'],
		include: ['profile', 'posts'],
	},
});
// URL: /search?filter.name=John&filter.age=25&sort=name,email&include=profile,posts

// using URLSearchParams
const params = new URLSearchParams();
params.append('search', 'term');
params.append('category', 'books');

const response = await client.get('/products', { query: params });
```

### Request Configuration

```typescript
// custom headers
const response = await client.get('/protected', {
	headers: {
		Authorization: 'Bearer token',
		'X-Custom-Header': 'value',
	},
});

// timeout configuration
const response = await client.get('/slow-endpoint', {
	timeout: 10000, // 10 seconds
});

// request cancellation
const controller = new AbortController();
const response = client.get('/data', {
	cancel: controller,
});

// cancel the request after 2 seconds
setTimeout(() => controller.abort(), 2000);
```

## 🏗️ Module Integration

### Register as a module

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '#libs/http';

@Module({
	imports: [
		HttpModule.register({
			url: 'https://api.example.com',
			timeout: 5000,
			headers: {
				'User-Agent': 'MyApp/1.0',
			},
			global: true, // makes it available globally
		}),
	],
})
export class AppModule {}
```

### Multiple HTTP clients

```typescript
// app.module.ts
@Module({
	imports: [
		// default client
		HttpModule.register({
			url: 'https://api.example.com',
		}),
		// custom token for different API
		HttpModule.register({
			url: 'https://another-api.com',
			useToken: 'ANOTHER_API_CLIENT',
			headers: {
				'X-API-Key': 'different-key',
			},
		}),
	],
})
export class AppModule {}

// user.service.ts
@Injectable()
export class UserService {
	constructor(
		private readonly defaultClient: HttpClient,
		@Inject('ANOTHER_API_CLIENT')
		private readonly anotherClient: HttpClient,
	) {}
}
```

## 🔧 Provider Usage

### Using HttpProvider

```typescript
// user.module.ts
import { Module } from '@nestjs/common';
import { HttpProvider } from '#libs/http';

@Module({
	providers: [
		HttpProvider.register({
			url: 'https://jsonplaceholder.typicode.com',
			useToken: 'JSON_PLACEHOLDER_CLIENT',
		}),
		UserService,
	],
})
export class UserModule {}

// user.service.ts
@Injectable()
export class UserService {
	constructor(
		@Inject('JSON_PLACEHOLDER_CLIENT')
		private readonly httpClient: HttpProvider,
	) {}

	async getUsers() {
		const response = await this.httpClient.get<User[]>('/users');
		return response.json();
	}
}
```

## ⚠️ Error Handling

### HTTP Errors

```typescript
import { HttpError, HttpStatusCode } from '#libs/http';

try {
	const response = await client.get('/api/users/999');
} catch (error) {
	if (error instanceof HttpError) {
		console.log('Status:', error.status); // 404
		console.log('Status Text:', error.statusText); // 'Not Found'

		// get error response body
		const errorBody = await error.json();
		console.log('Error details:', errorBody);

		// handle specific status codes
		switch (error.status) {
			case HttpStatusCode.NOT_FOUND:
				console.log('Resource not found');
				break;
			case HttpStatusCode.UNAUTHORIZED:
				console.log('Authentication required');
				break;
			default:
				console.log('HTTP error occurred');
		}
	}
}
```

### Timeout Errors

```typescript
import { TimeoutError } from '#libs/http';

try {
	const response = await client.get('/slow-api', { timeout: 1000 });
} catch (error) {
	if (error instanceof TimeoutError) {
		console.log('Request timed out');
	}
}
```

### Disable error throwing

```typescript
// client won't throw on 4xx/5xx responses
const client = new HttpClient({
	url: 'https://api.example.com',
	throwOnClientError: false,
});

const response = await client.get('/might-fail');
if (!response.ok) {
	console.log('Request failed but no error was thrown');
	console.log('Status:', response.status);
}
```

## ⚙️ Configuration

### Client Configuration

```typescript
interface HttpClientConfig {
	// base URL for all requests
	url?: string;

	// throw errors on 4xx/5xx status codes (default: true)
	throwOnClientError?: boolean;

	// default timeout for requests
	timeout?: number;

	// default headers
	headers?: Record<string, string>;

	// request interceptor
	onRequest?: (
		options: HttpRequestOptions,
		url: string | URL,
	) => void | Promise<void>;

	// other fetch options
	// ... (all standard RequestInit options)
}
```

### Request Interceptors

```typescript
const client = new HttpClient({
	url: 'https://api.example.com',
	onRequest: async (options, url) => {
		// add authentication token
		options.headers = {
			...options.headers,
			Authorization: `Bearer ${await getAuthToken()}`,
		};

		// log requests
		console.log(`Making ${options.method} request to ${url}`);

		// modify request data
		if (options.method === 'POST' && options.data) {
			options.data = {
				...options.data,
				timestamp: new Date().toISOString(),
			};
		}
	},
});
```

## 🚀 Advanced Examples

### Authentication Service

```typescript
@Injectable()
export class AuthService {
	private readonly authClient: HttpClient;

	constructor() {
		this.authClient = new HttpClient({
			url: 'https://auth.example.com',
			onRequest: async (options) => {
				// add api key to all requests
				options.headers = {
					...options.headers,
					'X-API-Key': process.env.AUTH_API_KEY,
				};
			},
		});
	}

	async login(credentials: LoginDto): Promise<AuthResponse> {
		const response = await this.authClient.post<AuthResponse>(
			'/auth/login',
			{
				data: credentials,
			},
		);
		return response.json();
	}

	async refreshToken(refreshToken: string): Promise<AuthResponse> {
		const response = await this.authClient.post<AuthResponse>(
			'/auth/refresh',
			{
				data: { refreshToken },
			},
		);
		return response.json();
	}
}
```

### File Upload Service

```typescript
@Injectable()
export class FileService {
	constructor(private readonly httpClient: HttpClient) {}

	async uploadFile(
		file: File,
		metadata?: Record<string, any>,
	): Promise<UploadResponse> {
		const formData = new FormData();
		formData.append('file', file);

		if (metadata) {
			formData.append('metadata', JSON.stringify(metadata));
		}

		const response = await this.httpClient.post<UploadResponse>(
			'/files/upload',
			{
				body: formData, // use body directly for FormData
				timeout: 30000, // 30 seconds for file upload
			},
		);

		return response.json();
	}

	async downloadFile(fileId: string): Promise<Blob> {
		const response = await this.httpClient.get(`/files/${fileId}/download`);
		return response.blob();
	}
}
```

### Paginated API Service

```typescript
interface PaginatedResponse<T> {
	data: T[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
}

@Injectable()
export class ApiService {
	constructor(private readonly httpClient: HttpClient) {}

	async getPaginatedData<T>(
		endpoint: string,
		page: number = 1,
		limit: number = 10,
		filters?: Record<string, any>,
	): Promise<PaginatedResponse<T>> {
		const response = await this.httpClient.get<PaginatedResponse<T>>(
			endpoint,
			{
				query: {
					page,
					limit,
					...filters,
				},
			},
		);

		return response.json();
	}

	async getAllPages<T>(
		endpoint: string,
		filters?: Record<string, any>,
	): Promise<T[]> {
		let allData: T[] = [];
		let page = 1;
		let totalPages = 1;

		do {
			const response = await this.getPaginatedData<T>(
				endpoint,
				page,
				100,
				filters,
			);
			allData = [...allData, ...response.data];
			totalPages = response.pagination.totalPages;
			page++;
		} while (page <= totalPages);

		return allData;
	}
}
```

### Retry Logic Service

```typescript
@Injectable()
export class RetryableApiService {
	constructor(private readonly httpClient: HttpClient) {}

	async withRetry<T>(
		request: () => Promise<T>,
		maxRetries: number = 3,
		delay: number = 1000,
	): Promise<T> {
		let lastError: Error;

		for (let attempt = 1; attempt <= maxRetries; attempt++) {
			try {
				return await request();
			} catch (error) {
				lastError = error as Error;

				// don't retry on client errors (4xx)
				if (error instanceof HttpError && error.status < 500) {
					throw error;
				}

				if (attempt < maxRetries) {
					await new Promise((resolve) =>
						setTimeout(resolve, delay * attempt),
					);
				}
			}
		}

		throw lastError!;
	}

	async getData<T>(endpoint: string): Promise<T> {
		return this.withRetry(async () => {
			const response = await this.httpClient.get<T>(endpoint);
			return response.json();
		});
	}
}
```

## 📖 API Reference

### HttpClient

The main HTTP client class built on the Fetch API.

**Constructor:**

- `new HttpClient(config?: HttpClientConfig)`

**Methods:**

- `get<R>(url, config?): Promise<HttpResponse<R>>` - GET request
- `post<R>(url, config?): Promise<HttpResponse<R>>` - POST request
- `put<R>(url, config?): Promise<HttpResponse<R>>` - PUT request
- `patch<R>(url, config?): Promise<HttpResponse<R>>` - PATCH request
- `delete<R>(url, config?): Promise<HttpResponse<R>>` - DELETE request
- `request<R>(url, config?): Promise<HttpResponse<R>>` - Generic request
- `setHeader(key: string, value: string): void` - Set default header

**Static Methods:**

- `HttpClient.basicAuth(user: string, password: string): string` - Generate basic auth

### HttpModule

NestJS module for dependency injection.

**Methods:**

- `HttpModule.register(config?: HttpModuleConfig): DynamicModule`

### HttpProvider

Alternative provider implementation.

**Methods:**

- `HttpProvider.register(config?: HttpProviderConfig): FactoryProvider`

### HttpError

Custom error for HTTP failures.

**Properties:**

- `status: HttpStatusCode` - HTTP status code
- `statusText: string` - HTTP status text
- `response: HttpResponse` - Original response object

**Methods:**

- `json<R>(): Promise<R>` - Get error response body

### TimeoutError

Error thrown when requests timeout.

### HttpMethod

Enum with HTTP methods:

- `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`, `OPTIONS`, `TRACE`

### HttpStatusCode

Enum with HTTP status codes (100-599).

## 🔧 Customization

### Custom Interceptors

```typescript
const loggerInterceptor: OnRequestInterceptor = async (options, url) => {
	const start = Date.now();
	console.log(`➡️ ${options.method} ${url}`);

	// add timing to response (if supported by your setup)
	options.metadata = { start };
};

const client = new HttpClient({
	url: 'https://api.example.com',
	onRequest: loggerInterceptor,
});
```

### Environment-based Configuration

```typescript
// config/http.config.ts
export const getHttpConfig = (): HttpClientConfig => ({
	url: process.env.API_BASE_URL || 'http://localhost:3000',
	timeout: parseInt(process.env.HTTP_TIMEOUT || '5000'),
	headers: {
		'User-Agent': `${process.env.APP_NAME}/${process.env.APP_VERSION}`,
		...(process.env.API_KEY && { 'X-API-Key': process.env.API_KEY }),
	},
	throwOnClientError: process.env.NODE_ENV !== 'development',
});

// app.module.ts
@Module({
	imports: [HttpModule.register(getHttpConfig())],
})
export class AppModule {}
```

---

**Note:** This library is specifically designed for NestJS projects with TypeScript. It's built on top of the modern Fetch API and provides a clean, type-safe interface for HTTP communications.
