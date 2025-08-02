---
mode: agent
description: 'Implement comprehensive error handling following NestJS template patterns'
---

# Error Handling Implementation Prompt

Implement comprehensive error handling for [COMPONENT] following NestJS template patterns and industry best practices:

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
import { HttpException, HttpStatus } from '@nestjs/common';

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

		// Log the original error for debugging
		if (originalError) {
			console.error('System error details:', originalError);
		}
	}
}
```

### Global Exception Filter

```typescript
import {
	ExceptionFilter,
	Catch,
	ArgumentsHost,
	HttpException,
	HttpStatus,
	Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { AppException } from './exceptions/app.exception.ts';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
	private readonly logger = new Logger(GlobalExceptionFilter.name);

	catch(exception: unknown, host: ArgumentsHost): void {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const request = ctx.getRequest<Request>();

		const correlationId = request.headers['x-correlation-id'] as string;

		// Handle different types of exceptions
		const errorResponse = this.handleException(exception, correlationId);

		// Log error for monitoring
		this.logError(exception, request, errorResponse, correlationId);

		// Send response
		response.status(errorResponse.status).json(errorResponse.body);
	}

	/**
	 * Handles different exception types and creates appropriate responses.
	 */
	private handleException(
		exception: unknown,
		correlationId?: string,
	): { status: number; body: any } {
		// Custom application exceptions
		if (exception instanceof AppException) {
			return {
				status: exception.getStatus(),
				body: exception.toApiResponse(),
			};
		}

		// Zod validation errors
		if (exception instanceof ZodError) {
			const fields = exception.errors.reduce(
				(acc, error) => {
					const field = error.path.join('.');
					if (!acc[field]) {
						acc[field] = [];
					}
					acc[field].push(error.message);
					return acc;
				},
				{} as Record<string, string[]>,
			);

			const validationException = new ValidationException(
				fields,
				'Validation failed',
				correlationId,
			);
			return {
				status: validationException.getStatus(),
				body: validationException.toApiResponse(),
			};
		}

		// NestJS HTTP exceptions
		if (exception instanceof HttpException) {
			const status = exception.getStatus();
			const response = exception.getResponse();

			return {
				status,
				body: {
					error: {
						message:
							typeof response === 'string'
								? response
								: (response as any).message,
						code: this.getErrorCodeFromStatus(status),
						status,
						timestamp: new Date().toISOString(),
						correlationId,
					},
				},
			};
		}

		// Generic errors
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
		request: Request,
		errorResponse: { status: number; body: any },
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

		if (status >= 500) {
			// Server errors - log as error with full stack trace
			this.logger.error(
				`Server error: ${exception instanceof Error ? exception.message : 'Unknown error'}`,
				exception instanceof Error ? exception.stack : undefined,
				JSON.stringify(logContext, null, 2),
			);
		} else if (status >= 400) {
			// Client errors - log as warning
			this.logger.warn(
				`Client error: ${errorResponse.body.error?.message || 'Unknown client error'}`,
				JSON.stringify(logContext, null, 2),
			);
		} else {
			// Other errors - log as info
			this.logger.log(
				`Request completed with status ${status}`,
				JSON.stringify(logContext, null, 2),
			);
		}
	}

	/**
	 * Maps HTTP status codes to error codes.
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

		return statusToCode[status] || 'UNKNOWN_ERROR';
	}

	/**
	 * Sanitizes request data for logging (removes sensitive information).
	 */
	private sanitizeForLogging(data: any): any {
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
		const sanitized = { ...data };

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

```typescript
import { Injectable, Logger } from '@nestjs/common';
import {
  BusinessRuleException,
  ResourceNotFoundException,
  ExternalServiceException,
  SystemException,
} from '../exceptions/index.ts';
import { [Resource]Dto, Create[Resource]Dto } from '../schemas/[resource].dto.ts';

@Injectable()
export class [Resource]Service {
  private readonly logger = new Logger([Resource]Service.name);

  constructor(
    // dependencies
  ) {}

  /**
   * Creates a new [resource] with comprehensive error handling.
   *
   * @param createDto - creation data
   * @param correlationId - request correlation ID
   * @returns promise resolving to created [resource]
   * @throws BusinessRuleException when business rules are violated
   * @throws SystemException when database operations fail
   */
  async create(createDto: Create[Resource]Dto, correlationId?: string): Promise<[Resource]Dto> {
    try {
      // Business rule validation
      await this.validateBusinessRules(createDto, correlationId);

      // Attempt to create resource
      this.logger.log(`Creating [resource] with data: ${JSON.stringify(createDto)}`, {
        correlationId,
      });

      // TODO: Implement actual creation logic
      // const result = await this.repository.create(createDto);

      const result = { id: 1, ...createDto } as [Resource]Dto;

      this.logger.log(`Successfully created [resource] with ID: ${result.id}`, {
        correlationId,
      });

      return result;

    } catch (error) {
      // Re-throw known exceptions
      if (error instanceof BusinessRuleException) {
        throw error;
      }

      // Handle database/system errors
      this.logger.error(
        `Failed to create [resource]: ${error.message}`,
        error.stack,
        { correlationId, createDto },
      );

      throw new SystemException(
        'Failed to create [resource]',
        error instanceof Error ? error : undefined,
        correlationId,
      );
    }
  }

  /**
   * Finds [resource] by ID with proper error handling.
   *
   * @param id - [resource] ID
   * @param correlationId - request correlation ID
   * @returns promise resolving to found [resource]
   * @throws ResourceNotFoundException when [resource] is not found
   * @throws SystemException when database operations fail
   */
  async findById(id: number, correlationId?: string): Promise<[Resource]Dto> {
    try {
      this.logger.log(`Finding [resource] with ID: ${id}`, { correlationId });

      // TODO: Implement actual database query
      // const result = await this.repository.findById(id);

      const result = null; // Mock - simulating not found

      if (!result) {
        throw new ResourceNotFoundException('[Resource]', id, correlationId);
      }

      this.logger.log(`Successfully found [resource] with ID: ${id}`, { correlationId });

      return result;

    } catch (error) {
      // Re-throw known exceptions
      if (error instanceof ResourceNotFoundException) {
        throw error;
      }

      // Handle system errors
      this.logger.error(
        `Failed to find [resource] with ID ${id}: ${error.message}`,
        error.stack,
        { correlationId, id },
      );

      throw new SystemException(
        'Failed to retrieve [resource]',
        error instanceof Error ? error : undefined,
        correlationId,
      );
    }
  }

  /**
   * Calls external service with proper error handling and retry logic.
   *
   * @param data - request data
   * @param correlationId - request correlation ID
   * @returns promise resolving to external service response
   * @throws ExternalServiceException when external service fails
   */
  async callExternalService(data: any, correlationId?: string): Promise<any> {
    const maxRetries = 3;
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        this.logger.log(
          `Calling external service (attempt ${attempt}/${maxRetries})`,
          { correlationId, data },
        );

        // TODO: Implement actual external service call
        // const response = await this.httpClient.post('/external-api', data);

        // Mock external service call
        if (Math.random() < 0.3) {
          throw new Error('External service temporarily unavailable');
        }

        const response = { success: true, data: 'mock response' };

        this.logger.log(`External service call successful on attempt ${attempt}`, {
          correlationId,
        });

        return response;

      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');

        this.logger.warn(
          `External service call failed on attempt ${attempt}: ${lastError.message}`,
          { correlationId, attempt, maxRetries },
        );

        // Wait before retry (exponential backoff)
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    // All retries failed
    throw new ExternalServiceException(
      'ExternalAPI',
      `Service call failed after ${maxRetries} attempts`,
      lastError!.message,
      correlationId,
    );
  }

  /**
   * Validates business rules with specific error handling.
   *
   * @param createDto - data to validate
   * @param correlationId - request correlation ID
   * @throws BusinessRuleException when validation fails
   */
  private async validateBusinessRules(
    createDto: Create[Resource]Dto,
    correlationId?: string,
  ): Promise<void> {
    // Example business rule validation
    if (!createDto.name || createDto.name.trim().length === 0) {
      throw new BusinessRuleException(
        'Resource name cannot be empty',
        'INVALID_NAME',
        correlationId,
      );
    }

    // Check for duplicates
    // TODO: Implement actual duplicate check
    // const existing = await this.repository.findByName(createDto.name);
    const existing = null; // Mock

    if (existing) {
      throw new BusinessRuleException(
        `[Resource] with name '${createDto.name}' already exists`,
        'DUPLICATE_NAME',
        correlationId,
      );
    }

    this.logger.log('Business rule validation passed', { correlationId });
  }
}
```

### Controller Error Handling Template

```typescript
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Headers,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { [Resource]Service } from '../services/[resource].service.ts';
import { [Resource]Dto, Create[Resource]Dto } from '../schemas/[resource].dto.ts';

@Controller('[resources]')
export class [Resource]Controller {
  constructor(private readonly [resource]Service: [Resource]Service) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new [resource]' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: '[Resource] created successfully',
    type: [Resource]Dto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation error or business rule violation',
    schema: {
      type: 'object',
      properties: {
        error: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            code: { type: 'string' },
            status: { type: 'number' },
            timestamp: { type: 'string' },
            correlationId: { type: 'string' },
            fields: {
              type: 'object',
              additionalProperties: {
                type: 'array',
                items: { type: 'string' },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
  })
  async create(
    @Body() createDto: Create[Resource]Dto,
    @Headers('x-correlation-id') correlationId?: string,
  ): Promise<[Resource]Dto> {
    // Service handles all error scenarios
    return this..[resource]Service.create(createDto, correlationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get [resource] by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '[Resource] found',
    type: [Resource]Dto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '[Resource] not found',
    schema: {
      type: 'object',
      properties: {
        error: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            code: { type: 'string', example: 'RESOURCE_NOT_FOUND' },
            status: { type: 'number', example: 404 },
            timestamp: { type: 'string' },
            correlationId: { type: 'string' },
          },
        },
      },
    },
  })
  async findById(
    @Param('id', ParseIntPipe) id: number,
    @Headers('x-correlation-id') correlationId?: string,
  ): Promise<[Resource]Dto> {
    // Service handles all error scenarios
    return this.[resource]Service.findById(id, correlationId);
  }
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

		// Update error code metrics
		const codeCount = this.metrics.errorsByCode.get(code) || 0;
		this.metrics.errorsByCode.set(code, codeCount + 1);

		// Update endpoint metrics
		const endpointCount = this.metrics.errorsByEndpoint.get(endpoint) || 0;
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
