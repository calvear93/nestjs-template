---
mode: agent
description: 'Optimize performance following NestJS template patterns and best practices'
---

# Performance Optimization Prompt

Optimize the performance of [COMPONENT] following NestJS template patterns and industry best practices:

> **Note:** Configuration in this template comes from a Zod config factory under
> `src/app/config/` provided via a DI token (e.g. `@Inject('SOME_CONFIG')`) — there is
> **no** `ConfigService`/`@nestjs/config` dependency. Redis, database, and ORM examples
> below are **illustrative/optional infra** and are not part of the base template; wire
> them up only if a project actually needs them.

## 🎯 Optimization Focus Areas

1. **Database Optimization**: Query efficiency, indexing, connection pooling
2. **Caching Strategy**: In-memory, Redis, response caching
3. **Request/Response Optimization**: Compression, pagination, partial responses
4. **Code-Level Optimization**: Async patterns, memory usage, algorithm efficiency
5. **Infrastructure**: HTTP/2, CDN, load balancing considerations
6. **Monitoring**: Performance metrics, profiling, bottleneck identification

## 📋 Performance Audit Checklist

### Database Performance

- [ ] Query optimization with proper indexes
- [ ] N+1 query problem elimination
- [ ] Database connection pooling configured
- [ ] Pagination implemented for large datasets
- [ ] Raw queries used where ORM overhead is significant
- [ ] Database query monitoring and logging

### Caching Implementation

- [ ] In-memory caching for frequently accessed data
- [ ] Redis caching for shared data across instances
- [ ] HTTP response caching with appropriate headers
- [ ] Cache invalidation strategies implemented
- [ ] Cache hit/miss ratio monitoring
- [ ] Cache expiration policies defined

### Request/Response Optimization

- [ ] Response compression enabled (gzip/brotli)
- [ ] Pagination for list endpoints
- [ ] Field selection/projection for large objects
- [ ] Request validation optimized (early validation)
- [ ] Response streaming for large datasets
- [ ] Request timeout configuration

### Code-Level Optimization

- [ ] Async/await patterns used correctly
- [ ] Event loop blocking operations identified
- [ ] Memory leaks prevented (proper cleanup)
- [ ] Object pooling where beneficial
- [ ] Lazy loading implemented for expensive operations
- [ ] Background job processing for heavy tasks

## 🛠️ Optimization Templates

### Caching Service Template

Config comes from a Zod factory under `src/app/config/` injected via a DI token.

```typescript
import { Inject, Injectable, Logger } from '@nestjs/common';
import { type CacheConfig } from '../config/cache.config.ts';

interface CacheItem<T> {
	data: T;
	timestamp: number;
	ttl: number;
}

@Injectable()
export class CacheService {
	private readonly logger = new Logger(CacheService.name);
	private readonly cache = new Map<string, CacheItem<unknown>>();
	private readonly defaultTtl: number;

	constructor(@Inject('CACHE_CONFIG') private readonly _config: CacheConfig) {
		this.defaultTtl = this._config.defaultTtl ?? 300_000; // 5 minutes

		// cleanup expired items every minute
		setInterval(() => this.cleanup(), 60_000);
	}

	/**
	 * Gets cached data with automatic expiration handling.
	 *
	 * @param key - cache key
	 * @returns cached data or null if expired/not found
	 */
	get<T>(key: string): T | null {
		const item = this.cache.get(key);

		if (!item) {
			return null;
		}

		const now = Date.now();
		if (now > item.timestamp + item.ttl) {
			this.cache.delete(key);
			this.logger.debug(`Cache expired and removed: ${key}`);
			return null;
		}

		this.logger.debug(`cache hit: ${key}`);
		return item.data as T;
	}

	/**
	 * Sets cached data with optional TTL.
	 *
	 * @param key - cache key
	 * @param data - data to cache
	 * @param ttl - time to live in milliseconds
	 */
	set<T>(key: string, data: T, ttl: number = this.defaultTtl): void {
		this.cache.set(key, {
			data,
			timestamp: Date.now(),
			ttl,
		});

		this.logger.debug(`Cache set: ${key} (TTL: ${ttl}ms)`);
	}

	/**
	 * Gets cached data or executes factory function and caches result.
	 *
	 * @param key - cache key
	 * @param factory - function to generate data if not cached
	 * @param ttl - time to live in milliseconds
	 * @returns cached or newly generated data
	 */
	async getOrSet<T>(
		key: string,
		factory: () => Promise<T> | T,
		ttl: number = this.defaultTtl,
	): Promise<T> {
		const cached = this.get<T>(key);

		if (cached !== null) {
			return cached;
		}

		this.logger.debug(`Cache miss, executing factory: ${key}`);
		const data = await factory();
		this.set(key, data, ttl);

		return data;
	}

	/**
	 * Invalidates cache entries by pattern.
	 *
	 * @param pattern - regex pattern to match keys
	 */
	invalidateByPattern(pattern: RegExp): number {
		let count = 0;

		for (const key of this.cache.keys()) {
			if (pattern.test(key)) {
				this.cache.delete(key);
				count++;
			}
		}

		this.logger.debug(
			`Invalidated ${count} cache entries matching pattern: ${pattern}`,
		);
		return count;
	}

	/**
	 * Clears all cached data.
	 */
	clear(): void {
		const size = this.cache.size;
		this.cache.clear();
		this.logger.debug(`Cleared ${size} cache entries`);
	}

	/**
	 * Gets cache statistics.
	 *
	 * @returns cache statistics object
	 */
	getStats(): { size: number; keys: string[] } {
		return {
			size: this.cache.size,
			keys: Array.from(this.cache.keys()),
		};
	}

	/**
	 * Cleanup expired cache entries.
	 */
	private cleanup(): void {
		const now = Date.now();
		let cleanedCount = 0;

		for (const [key, item] of this.cache.entries()) {
			if (now > item.timestamp + item.ttl) {
				this.cache.delete(key);
				cleanedCount++;
			}
		}

		if (cleanedCount > 0) {
			this.logger.debug(
				`Cleaned up ${cleanedCount} expired cache entries`,
			);
		}
	}
}
```

### Cached Service Method Template

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { CacheService } from '../cache/cache.service.ts';
import {
	type Create[Resource]Dto,
	type [Resource]Dto,
	type [Resource]QueryDto,
	type Update[Resource]Dto,
} from '../schemas/[resource].dto.ts';

@Injectable()
export class [Resource]Service {
	private readonly logger = new Logger([Resource]Service.name);

	constructor(
		private readonly _cache: CacheService,
		// other dependencies
	) {}

	/**
	 * finds all [resource]s with caching support.
	 *
	 * @param query - query parameters
	 * @returns cached or fresh data
	 */
	findAll(query: [Resource]QueryDto): Promise<[Resource]Dto[]> {
		const cacheKey = `[resource]:all:${JSON.stringify(query)}`;

		return this._cache.getOrSet(
			cacheKey,
			() => {
				this.logger.log(`fetching [resource]s`, query);

				// TODO: return this._repository.findAll(query);
				return [];
			},
			300_000, // 5 minutes
		);
	}

	/**
	 * finds a [resource] by id with caching.
	 *
	 * @param id - [resource] id
	 * @returns cached or fresh data
	 */
	findById(id: number): Promise<[Resource]Dto | null> {
		return this._cache.getOrSet(
			`[resource]:${id}`,
			() => {
				this.logger.log(`fetching [resource] ${id}`);

				// TODO: return this._repository.findById(id);
				return null;
			},
			600_000, // 10 minutes
		);
	}

	/**
	 * creates a [resource] and invalidates related cache entries.
	 *
	 * @param dto - creation data
	 * @returns the created [resource]
	 */
	async create(dto: Create[Resource]Dto): Promise<[Resource]Dto> {
		// TODO: const result = await this._repository.create(dto);
		const result = { id: 1, ...dto } as [Resource]Dto;

		this._cache.invalidateByPattern(/^\[resource\]:all:/);
		this.logger.log('created [resource] and invalidated list cache');

		return result;
	}

	/**
	 * updates a [resource] and invalidates related cache entries.
	 *
	 * @param id - [resource] id
	 * @param dto - update data
	 * @returns the updated [resource]
	 */
	async update(
		id: number,
		dto: Update[Resource]Dto,
	): Promise<[Resource]Dto> {
		// TODO: const result = await this._repository.update(id, dto);
		const result = { id, ...dto } as [Resource]Dto;

		this._cache.invalidateByPattern(new RegExp(`^\\[resource\\]:(${id}|all:)`));
		this.logger.log(`updated [resource] ${id} and invalidated cache`);

		return result;
	}
}
```

### Pagination Template

```typescript
import { ZodDto } from '#libs/zod';
import { z } from 'zod';

// pagination query schema
const PaginationQuerySchema = z.object({
	page: z.coerce.number().min(1).default(1),
	limit: z.coerce.number().min(1).max(100).default(20),
	sortBy: z.string().optional(),
	sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export class PaginationQueryDto extends ZodDto(
	PaginationQuerySchema,
	'PaginationQuery',
) {}

// paginated response schema
const PaginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
	z.object({
		data: z.array(itemSchema),
		pagination: z.object({
			page: z.number(),
			limit: z.number(),
			total: z.number(),
			totalPages: z.number(),
			hasNext: z.boolean(),
			hasPrev: z.boolean(),
		}),
	});

// paginated response utility
export interface PaginatedResponse<T> {
	data: T[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
		hasNext: boolean;
		hasPrev: boolean;
	};
}

export const createPaginatedResponse = <T>(
	data: T[],
	total: number,
	page: number,
	limit: number,
): PaginatedResponse<T> => {
	const totalPages = Math.ceil(total / limit);

	return {
		data,
		pagination: {
			page,
			limit,
			total,
			totalPages,
			hasNext: page < totalPages,
			hasPrev: page > 1,
		},
	};
};
```

### Background Job Processing Template

```typescript
import { Inject, Injectable, Logger } from '@nestjs/common';
import { type JobQueueConfig } from '../config/job-queue.config.ts';

interface Job<T = unknown> {
	id: string;
	type: string;
	data: T;
	attempts: number;
	maxAttempts: number;
	delay: number;
	createdAt: Date;
	scheduledFor: Date;
}

@Injectable()
export class JobQueueService {
	private readonly logger = new Logger(JobQueueService.name);
	private readonly jobs = new Map<string, Job>();
	private readonly handlers = new Map<
		string,
		(data: unknown) => Promise<void>
	>();
	private readonly isProcessing = false;

	constructor(
		@Inject('JOB_QUEUE_CONFIG') private readonly _config: JobQueueConfig,
	) {
		// start job processing
		this.startProcessing();
	}

	/**
	 * Registers a job handler for a specific job type.
	 *
	 * @param type - job type
	 * @param handler - job handler function
	 */
	registerHandler<T>(
		type: string,
		handler: (data: T) => Promise<void>,
	): void {
		this.handlers.set(type, handler);
		this.logger.log(`Registered handler for job type: ${type}`);
	}

	/**
	 * Adds a job to the queue.
	 *
	 * @param type - job type
	 * @param data - job data
	 * @param options - job options
	 * @returns job ID
	 */
	addJob<T>(
		type: string,
		data: T,
		options: {
			delay?: number;
			maxAttempts?: number;
		} = {},
	): string {
		const id = `${type}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
		const now = new Date();
		const delay = options.delay ?? 0;

		const job: Job<T> = {
			id,
			type,
			data,
			attempts: 0,
			maxAttempts: options.maxAttempts ?? 3,
			delay,
			createdAt: now,
			scheduledFor: new Date(now.getTime() + delay),
		};

		this.jobs.set(id, job);
		this.logger.log(`Added job ${id} of type ${type}`);

		return id;
	}

	/**
	 * Starts job processing loop.
	 */
	private async startProcessing(): Promise<void> {
		if (this.isProcessing) {
			return;
		}

		const interval = this._config.interval ?? 1000;

		setInterval(async () => {
			await this.processJobs();
		}, interval);
	}

	/**
	 * Processes pending jobs.
	 */
	private async processJobs(): Promise<void> {
		const now = new Date();
		const readyJobs = Array.from(this.jobs.values())
			.filter((job) => job.scheduledFor <= now)
			.sort(
				(a, b) => a.scheduledFor.getTime() - b.scheduledFor.getTime(),
			);

		for (const job of readyJobs) {
			await this.processJob(job);
		}
	}

	/**
	 * Processes a single job.
	 *
	 * @param job - job to process
	 */
	private async processJob(job: Job): Promise<void> {
		const handler = this.handlers.get(job.type);

		if (!handler) {
			this.logger.warn(`No handler found for job type: ${job.type}`);
			this.jobs.delete(job.id);
			return;
		}

		job.attempts++;

		try {
			this.logger.log(
				`Processing job ${job.id} (attempt ${job.attempts}/${job.maxAttempts})`,
			);

			await handler(job.data);

			// job completed successfully
			this.jobs.delete(job.id);
			this.logger.log(`job ${job.id} completed`);
		} catch (error) {
			this.logger.error(
				`job ${job.id} failed`,
				error instanceof Error ? error.stack : undefined,
			);

			if (job.attempts >= job.maxAttempts) {
				// max attempts reached, remove job
				this.jobs.delete(job.id);
				this.logger.error(
					`job ${job.id} failed permanently after ${job.attempts} attempts`,
				);
			} else {
				// schedule retry with exponential backoff
				const backoffDelay = 2 ** job.attempts * 1_000;
				job.scheduledFor = new Date(Date.now() + backoffDelay);
				this.logger.log(
					`job ${job.id} scheduled for retry in ${backoffDelay}ms`,
				);
			}
		}
	}

	/**
	 * Gets queue statistics.
	 *
	 * @returns queue statistics
	 */
	getStats(): {
		totalJobs: number;
		pendingJobs: number;
		jobsByType: Record<string, number>;
	} {
		const jobs = Array.from(this.jobs.values());
		const now = new Date();

		const jobsByType = jobs.reduce<Record<string, number>>((acc, job) => {
			acc[job.type] = (acc[job.type] ?? 0) + 1;
			return acc;
		}, {});

		return {
			totalJobs: jobs.length,
			pendingJobs: jobs.filter((job) => job.scheduledFor <= now).length,
			jobsByType,
		};
	}
}
```

## 🔍 Performance Monitoring

### Metrics to Track

1. **Response Times**: API endpoint latency percentiles
2. **Throughput**: Requests per second
3. **Cache Hit Ratio**: Cache effectiveness
4. **Database Performance**: Query execution times
5. **Memory Usage**: Heap usage and garbage collection
6. **Error Rates**: 4xx/5xx response rates

### Monitoring Implementation

```typescript
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class PerformanceMonitoringService {
	private readonly metrics = new Map<string, number[]>();

	/**
	 * records execution time for an operation.
	 *
	 * @param operation - operation name
	 * @param duration - execution time in milliseconds
	 */
	recordExecutionTime(operation: string, duration: number): void {
		if (!this.metrics.has(operation)) {
			this.metrics.set(operation, []);
		}

		const times = this.metrics.get(operation)!;
		times.push(duration);

		// keep only the last 1000 measurements
		if (times.length > 1_000) {
			times.shift();
		}
	}

	/**
	 * gets performance statistics for an operation.
	 *
	 * @param operation - operation name
	 * @returns performance statistics
	 */
	getStats(operation: string): {
		count: number;
		avg: number;
		min: number;
		max: number;
		p95: number;
		p99: number;
	} | null {
		const times = this.metrics.get(operation);

		if (!times || times.length === 0) {
			return null;
		}

		const sorted = [...times].sort((a, b) => a - b);
		const count = sorted.length;

		return {
			count,
			avg: sorted.reduce((sum, time) => sum + time, 0) / count,
			min: sorted[0],
			max: sorted[count - 1],
			p95: sorted[Math.floor(count * 0.95)],
			p99: sorted[Math.floor(count * 0.99)],
		};
	}
}

// decorator for automatic performance monitoring
export const MonitorPerformance = (operation?: string) => {
	const logger = new Logger('MonitorPerformance');

	return (
		target: object,
		propertyKey: string,
		descriptor: PropertyDescriptor,
	): PropertyDescriptor => {
		const originalMethod = descriptor.value;
		const operationName =
			operation ?? `${target.constructor.name}.${propertyKey}`;

		descriptor.value = async function (...args: unknown[]) {
			const start = performance.now();

			try {
				return await originalMethod.apply(this, args);
			} finally {
				const duration = performance.now() - start;

				// inject the monitoring service if available
				if (this.performanceMonitoring) {
					this.performanceMonitoring.recordExecutionTime(
						operationName,
						duration,
					);
				}

				// log slow operations
				if (duration > 1_000) {
					logger.warn(
						`slow operation: ${operationName} took ${duration.toFixed(2)}ms`,
					);
				}
			}
		};

		return descriptor;
	};
};
```

## 🚀 Optimization Implementation Steps

1. **Profile Current Performance**: Establish baseline metrics
2. **Identify Bottlenecks**: Use profiling tools and monitoring
3. **Implement Caching**: Start with high-impact, frequently accessed data
4. **Optimize Database**: Add indexes, optimize queries, implement pagination
5. **Background Processing**: Move heavy operations to background jobs
6. **Monitor Results**: Track performance improvements
7. **Iterate**: Continuously optimize based on real-world usage
