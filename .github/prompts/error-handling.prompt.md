---
mode: agent
description: 'Implement comprehensive error handling following NestJS template patterns'
---

# Error Handling Implementation Prompt

Implement comprehensive error handling for [COMPONENT] following NestJS template patterns and industry best practices:

> **Note:** In this template the canonical validation exception comes from `#libs/zod`
> (`ZodValidationPipe` rejects invalid input automatically). The custom `AppException`
> hierarchy and `GlobalExceptionFilter` shown below are **optional and illustrative** —
> the base template does not ship them. Add them only if a project genuinely needs a
> richer error contract, and prefer NestJS built-in HTTP exceptions otherwise.

## 🎯 Error Handling Objectives

1. **Consistent Error Responses**: Standardized error format across all endpoints
2. **Proper HTTP Status Codes**: Semantic status codes for different error types
3. **Error Classification**: Business logic, validation, system, and external service errors
4. **Security Considerations**: No sensitive information in error responses
5. **Logging Strategy**: Comprehensive error logging for debugging and monitoring
6. **User Experience**: Meaningful error messages for client applications

## 📋 Error Handling Checklist

### Error Classification

- [ ] Business logic errors properly identified and handled
- [ ] Validation errors with detailed field-level feedback
- [ ] System errors (database, filesystem) handled gracefully
- [ ] External service errors with proper fallback mechanisms
- [ ] Authentication and authorization errors
- [ ] Rate limiting and quota exceeded errors

### Error Response Format

- [ ] Consistent error response structure
- [ ] Proper HTTP status codes
- [ ] Error codes for programmatic handling
- [ ] Localization support for error messages
- [ ] Request correlation IDs for tracing
- [ ] Timestamp information

### Security & Privacy

- [ ] No sensitive data in error responses
- [ ] Stack traces only in development environment
- [ ] Sanitized error messages for external APIs
- [ ] No database schema information leaked
- [ ] Proper error logging without exposing credentials

### Monitoring & Observability

- [ ] Structured error logging
- [ ] Error metrics and alerts
- [ ] Error rate monitoring by endpoint
- [ ] Performance impact of error handling
- [ ] Error categorization for analytics

## 🛠️ Error Handling Templates

### Custom Exception Classes

```typescript
import { HttpException, HttpStatus, Logger } from '@nestjs/common';

/**
 * Base application exception with enhanced error details.
 */
export abstract class AppException extends HttpException {
	public readonly code: string;
	public readonly timestamp: string;
	public readonly correlationId?: string;

	constructor(
		message: string,
		status: HttpStatus,
		code: string,
		correlationId?: string,
	) {
		super(message, status);
		this.code = code;
		this.timestamp = new Date().toISOString();
		this.correlationId = correlationId;
	}

	/**
	 * Converts exception to API response format.
	 */
	toApiResponse(): {
		error: {
			message: string;
			code: string;
			status: number;
			timestamp: string;
			correlationId?: string;
		};
	} {
		return {
			error: {
				message: this.message,
				code: this.code,
				status: this.getStatus(),
				timestamp: this.timestamp,
				correlationId: this.correlationId,
			},
		};
	}
}

/**
 * Business logic violation exception.
 */
export class BusinessRuleException extends AppException {
	constructor(message: string, code: string, correlationId?: string) {
		super(message, HttpStatus.BAD_REQUEST, code, correlationId);
	}
}

/**
 * Resource not found exception.
 */
export class ResourceNotFoundException extends AppException {
	constructor(
		resource: string,
		identifier: string | number,
		correlationId?: string,
	) {
		super(
			`${resource} with identifier '${identifier}' was not found`,
			HttpStatus.NOT_FOUND,
			'RESOURCE_NOT_FOUND',
			correlationId,
		);
	}
}

/**
 * Validation exception with field-level details.
 */
export class ValidationException extends AppException {
	public readonly fields: Record<string, string[]>;

	constructor(
		fields: Record<string, string[]>,
		message = 'Validation failed',
		correlationId?: string,
	) {
		super(
			message,
			HttpStatus.BAD_REQUEST,
			'VALIDATION_ERROR',
			correlationId,
		);
		this.fields = fields;
	}

	toApiResponse(): {
		error: {
			message: string;
			code: string;
			status: number;
			timestamp: string;
			correlationId?: string;
			fields: Record<string, string[]>;
		};
	} {
		return {
			error: {
				...super.toApiResponse().error,
				fields: this.fields,
			},
		};
	}
}

/**
 * External service error exception.
 */
export class ExternalServiceException extends AppException {
	public readonly service: string;
	public readonly originalError?: string;

	constructor(
		service: string,
		message: string,
		originalError?: string,
		correlationId?: string,
	) {
		super(
			`External service error: ${message}`,
			HttpStatus.BAD_GATEWAY,
			'EXTERNAL_SERVICE_ERROR',
			correlationId,
		);
		this.service = service;
		this.originalError = originalError;
	}

	toApiResponse(): {
		error: {
			message: string;
			code: string;
			status: number;
			timestamp: string;
			correlationId?: string;
			service: string;
		};
	} {
		return {
			error: {
				...super.toApiResponse().error,
				service: this.service,
			},
		};
	}
}

/**
 * System error exception for internal failures.
 */
export class SystemException extends AppException {
	private static readonly logger = new Logger(SystemException.name);

	constructor(
		message: string,
		originalError?: Error,
		correlationId?: string,
	) {
		super(
			'An internal server error occurred',
			HttpStatus.INTERNAL_SERVER_ERROR,
			'SYSTEM_ERROR',
			correlationId,
		);

		// log the original error for debugging
		if (originalError) {
			SystemException.logger.error(
				'system error details',
				originalError.stack,
			);
		}
	}
}
```

### Global Exception Filter

```typescript
import {
	type ArgumentsHost,
	Catch,
	type ExceptionFilter,
	HttpException,
	Logger,
} from '@nestjs/common';
import { type FastifyReply, type FastifyRequest } from 'fastify';
import { ZodError } from 'zod';
import { AppException } from './exceptions/app.exception.ts';
import { ValidationException } from './exceptions/validation.exception.ts';
import { SystemException } from './exceptions/system.exception.ts';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
	private readonly logger = new Logger(GlobalExceptionFilter.name);

	catch(exception: unknown, host: ArgumentsHost): void {
		const ctx = host.switchToHttp();
		const reply = ctx.getResponse<FastifyReply>();
		const request = ctx.getRequest<FastifyRequest>();

		const correlationId = request.headers['x-correlation-id'] as string;

		// handle different types of exceptions
		const errorResponse = this.handleException(exception, correlationId);

		// log error for monitoring
		this.logError(exception, request, errorResponse, correlationId);

		// send response
		reply.status(errorResponse.status).send(errorResponse.body);
	}

	/**
	 * Handles different exception types and creates appropriate responses.
	 */
	private handleException(
		exception: unknown,
		correlationId?: string,
	): { status: number; body: unknown } {
		// custom application exceptions
		if (exception instanceof AppException) {
			return {
				status: exception.getStatus(),
				body: exception.toApiResponse(),
			};
		}

		// zod validation errors
		if (exception instanceof ZodError) {
			const fields = exception.issues.reduce<Record<string, string[]>>(
				(acc, issue) => {
					const field = issue.path.join('.');
					acc[field] ??= [];
					acc[field].push(issue.message);
					return acc;
				},
				{},
			);

			const validationException = new ValidationException(
				fields,
				'validation failed',
				correlationId,
			);
			return {
				status: validationException.getStatus(),
				body: validationException.toApiResponse(),
			};
		}

		// nestjs http exceptions
		if (exception instanceof HttpException) {
			const status = exception.getStatus();
			const response = exception.getResponse();
			const message =
				typeof response === 'string'
					? response
					: ((response as { message?: string }).message ??
						'http error');

			return {
				status,
				body: {
					error: {
						message,
						code: this.getErrorCodeFromStatus(status),
						status,
						timestamp: new Date().toISOString(),
						correlationId,
					},
				},
			};
		}

		// generic errors
		const systemException = new SystemException(
			'An unexpected error occurred',
			exception instanceof Error ? exception : undefined,
			correlationId,
		);

		return {
			status: systemException.getStatus(),
			body: systemException.toApiResponse(),
		};
	}

	/**
	 * Logs error information for monitoring and debugging.
	 */
	private logError(
		exception: unknown,
		request: FastifyRequest,
		errorResponse: { status: number; body: unknown },
		correlationId?: string,
	): void {
		const { method, url, body, query, params, headers } = request;
		const { status } = errorResponse;

		const logContext = {
			correlationId,
			method,
			url,
			status,
			userAgent: headers['user-agent'],
			ip: request.ip,
			requestBody: this.sanitizeForLogging(body),
			queryParams: query,
			pathParams: params,
		};

		const message =
			exception instanceof Error ? exception.message : 'unknown error';

		if (status >= 500) {
			// server errors - log as error with full stack trace
			this.logger.error(
				`server error: ${message}`,
				exception instanceof Error ? exception.stack : undefined,
				JSON.stringify(logContext, null, 2),
			);
		} else if (status >= 400) {
			// client errors - log as warning
			this.logger.warn(
				`client error: ${message}`,
				JSON.stringify(logContext, null, 2),
			);
		} else {
			// everything else - log as info
			this.logger.log(
				`request completed with status ${status}`,
				JSON.stringify(logContext, null, 2),
			);
		}
	}

	/**
	 * maps http status codes to error codes.
	 */
	private getErrorCodeFromStatus(status: number): string {
		const statusToCode: Record<number, string> = {
			400: 'BAD_REQUEST',
			401: 'UNAUTHORIZED',
			403: 'FORBIDDEN',
			404: 'NOT_FOUND',
			405: 'METHOD_NOT_ALLOWED',
			409: 'CONFLICT',
			422: 'UNPROCESSABLE_ENTITY',
			429: 'TOO_MANY_REQUESTS',
			500: 'INTERNAL_SERVER_ERROR',
			502: 'BAD_GATEWAY',
			503: 'SERVICE_UNAVAILABLE',
			504: 'GATEWAY_TIMEOUT',
		};

		return statusToCode[status] ?? 'UNKNOWN_ERROR';
	}

	/**
	 * sanitizes request data for logging (removes sensitive information).
	 */
	private sanitizeForLogging(data: unknown): unknown {
		if (!data || typeof data !== 'object') {
			return data;
		}

		const sensitiveFields = [
			'password',
			'token',
			'authorization',
			'secret',
			'key',
		];
		const sanitized = { ...(data as Record<string, unknown>) };

		for (const field of sensitiveFields) {
			if (field in sanitized) {
				sanitized[field] = '[REDACTED]';
			}
		}

		return sanitized;
	}
}
```

### Service Error Handling Template

Re-throw known exceptions, map unexpected ones to a `SystemException`, and map
transport failures from `#libs/http` (`HttpError`, `TimeoutError`). For most
cases the NestJS built-in exceptions (`NotFoundException`, `BadRequestException`)
are enough — reach for the custom hierarchy only when you need a richer contract.

```typescript
import { type HttpClient, HttpError, TimeoutError } from '#libs/http';
import { Injectable, Logger } from '@nestjs/common';
import {
	BusinessRuleException,
	ExternalServiceException,
	ResourceNotFoundException,
	SystemException,
} from '../exceptions/index.ts';
import {
	type Create[Resource]Dto,
	type [Resource]Dto,
} from '../schemas/[resource].dto.ts';

@Injectable()
export class [Resource]Service {
	private readonly logger = new Logger([Resource]Service.name);

	constructor(private readonly _http: HttpClient) {}

	/**
	 * creates a new [resource], mapping unexpected failures to SystemException.
	 *
	 * @param dto - creation data
	 * @param correlationId - request correlation id
	 * @returns the created [resource]
	 * @throws BusinessRuleException when business rules are violated
	 */
	async create(
		dto: Create[Resource]Dto,
		correlationId?: string,
	): Promise<[Resource]Dto> {
		this.validateBusinessRules(dto, correlationId);

		try {
			// TODO: return await this._repository.create(dto);
			return { id: 1, ...dto } as [Resource]Dto;
		} catch (error) {
			this.logger.error(
				'failed to create [resource]',
				error instanceof Error ? error.stack : undefined,
			);

			throw new SystemException(
				'failed to create [resource]',
				error instanceof Error ? error : undefined,
				correlationId,
			);
		}
	}

	/**
	 * finds a [resource] by id.
	 *
	 * @param id - [resource] id
	 * @param correlationId - request correlation id
	 * @returns the [resource]
	 * @throws ResourceNotFoundException when it does not exist
	 */
	async findById(
		id: number,
		correlationId?: string,
	): Promise<[Resource]Dto> {
		// TODO: const result = await this._repository.findById(id);
		const result: [Resource]Dto | null = null;

		if (!result) {
			throw new ResourceNotFoundException('[Resource]', id, correlationId);
		}

		return result;
	}

	/**
	 * calls an external service, translating transport errors to a domain error.
	 *
	 * @param data - request payload
	 * @param correlationId - request correlation id
	 * @returns the external service response
	 * @throws ExternalServiceException when the call fails
	 */
	async callExternalService(
		data: unknown,
		correlationId?: string,
	): Promise<unknown> {
		try {
			return await this._http.post('external-api', { body: data });
		} catch (error) {
			if (error instanceof TimeoutError || error instanceof HttpError) {
				throw new ExternalServiceException(
					'ExternalAPI',
					'service call failed',
					error.message,
					correlationId,
				);
			}

			throw error;
		}
	}

	/**
	 * validates business rules.
	 *
	 * @param dto - data to validate
	 * @param correlationId - request correlation id
	 * @throws BusinessRuleException when a rule is violated
	 */
	private validateBusinessRules(
		dto: Create[Resource]Dto,
		correlationId?: string,
	): void {
		if (dto.name.trim().length === 0) {
			throw new BusinessRuleException(
				'resource name cannot be empty',
				'INVALID_NAME',
				correlationId,
			);
		}
	}
}
```

### Controller Error Handling Template

Keep the controller thin: the service owns every error scenario and the error
`@ApiResponse(...)` documentation lives in the colocated `*.controller.docs.ts`.

```typescript
import {
	Body,
	Controller,
	Get,
	Headers,
	HttpCode,
	HttpStatus,
	Param,
	ParseIntPipe,
	Post,
} from '@nestjs/common';
import { ApiKey } from '../../../decorators/api-key.guard.ts';
import { ApplyControllerDocs } from '../../../decorators/docs.decorator.ts';
import {
	type Create[Resource]Dto,
	type [Resource]Dto,
} from '../schemas/[resource].dto.ts';
import { [Resource]Service } from '../services/[resource].service.ts';
import { [Resource]ControllerDocs } from './[resource].controller.docs.ts';

@ApiKey()
@Controller('[resources]')
@ApplyControllerDocs([Resource]ControllerDocs)
export class [Resource]Controller {
	@Post()
	@HttpCode(HttpStatus.CREATED)
	create(
		@Body() dto: Create[Resource]Dto,
		@Headers('x-correlation-id') correlationId?: string,
	): Promise<[Resource]Dto> {
		// the service handles every error scenario
		return this._service.create(dto, correlationId);
	}

	@Get(':id')
	findById(
		@Param('id', ParseIntPipe) id: number,
		@Headers('x-correlation-id') correlationId?: string,
	): Promise<[Resource]Dto> {
		return this._service.findById(id, correlationId);
	}

	constructor(private readonly _service: [Resource]Service) {}
}
```

## 🔍 Error Monitoring & Alerting

### Error Metrics Collection

```typescript
import { Injectable } from '@nestjs/common';

interface ErrorMetrics {
	count: number;
	lastOccurrence: Date;
	errorsByCode: Map<string, number>;
	errorsByEndpoint: Map<string, number>;
}

@Injectable()
export class ErrorMetricsService {
	private readonly metrics: ErrorMetrics = {
		count: 0,
		lastOccurrence: new Date(),
		errorsByCode: new Map(),
		errorsByEndpoint: new Map(),
	};

	recordError(code: string, endpoint: string): void {
		this.metrics.count++;
		this.metrics.lastOccurrence = new Date();

		// update error code metrics
		const codeCount = this.metrics.errorsByCode.get(code) ?? 0;
		this.metrics.errorsByCode.set(code, codeCount + 1);

		// update endpoint metrics
		const endpointCount = this.metrics.errorsByEndpoint.get(endpoint) ?? 0;
		this.metrics.errorsByEndpoint.set(endpoint, endpointCount + 1);
	}

	getMetrics(): ErrorMetrics {
		return {
			...this.metrics,
			errorsByCode: new Map(this.metrics.errorsByCode),
			errorsByEndpoint: new Map(this.metrics.errorsByEndpoint),
		};
	}

	resetMetrics(): void {
		this.metrics.count = 0;
		this.metrics.errorsByCode.clear();
		this.metrics.errorsByEndpoint.clear();
	}
}
```

## 🚀 Implementation Steps

1. **Create Exception Classes**: Define custom exceptions for different error types
2. **Implement Global Filter**: Set up global exception handling
3. **Update Services**: Add comprehensive error handling to service methods
4. **Update Controllers**: Ensure proper error responses and documentation
5. **Add Monitoring**: Implement error metrics and logging
6. **Test Error Scenarios**: Create tests for all error conditions
7. **Document Errors**: Update API documentation with error responses
