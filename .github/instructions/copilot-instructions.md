---
applyTo: '**'
description: 'Main project instructions and development guidelines for GitHub Copilot'
---

# NestJS Template Project - GitHub Copilot Instructions

This is a modern, production-ready NestJS template providing a robust foundation for building scalable API applications with TypeScript. The template emphasizes developer experience, type safety, and comprehensive testing.

## 🚀 Essential Development Commands

**ALWAYS use these pnpm scripts for development workflow:**

```bash
# Development (use this for daily development)
pnpm start:dev                    # Start application with hot reload and debug logging

# Testing (critical for quality assurance)
pnpm test:dev --coverage --run   # Run all tests with coverage (recommended for CI)
pnpm test:dev                    # Run tests in watch mode during development
pnpm test:mutation               # Mutation testing for advanced quality assurance

# Code Quality (ALWAYS run before committing)
pnpm lint                        # Check and fix code style, warnings, and errors
pnpm format                      # Format code using Prettier

# Build & Preview
pnpm build                       # Build for production
pnpm preview                     # Preview built application

# Database & ORM (when using Prisma)
pnpm orm:local                   # Prisma commands for local development
pnpm orm:dev                     # Prisma commands for dev environment
```

## 📝 Commit Guidelines

**ALWAYS use Conventional Commits with Gitmojis for all commit messages:**

### Commit Message Format

```
<type>[optional scope] <gitmoji>: <description>

[optional body]

[optional footer(s)]
```

### Examples

```bash
feat(auth) ✨: add JWT authentication middleware
fix(api) 🐛: resolve validation error in user creation endpoint
docs(readme) 📚: update installation instructions
style(components) 🎨: improve code formatting and structure
refactor(services) ♻️: extract common database operations
test(users) ✅: add integration tests for user CRUD operations
chore(deps) 🔧: update dependencies to latest versions
perf(database) ⚡: optimize query performance with indexes
feat ✨: v2025.1
```

### Common Gitmoji Types

- **✨ `:sparkles:`** - New features
- **🐛 `:bug:`** - Bug fixes
- **📚 `:books:`** - Documentation
- **🎨 `:art:`** - Code structure/format improvements
- **⚡ `:zap:`** - Performance improvements
- **✅ `:white_check_mark:`** - Tests
- **🔧 `:wrench:`** - Configuration changes
- **♻️ `:recycle:`** - Refactoring
- **🚀 `:rocket:`** - Deployment/releases
- **🔒 `:lock:`** - Security improvements
- **💄 `:lipstick:`** - UI/UX improvements
- **🚚 `:truck:`** - Moving/renaming files
- **🗑️ `:wastebasket:`** - Removing code/files
- **🩹 `:adhesive_bandage:`** - Simple fixes
- **📦 `:package:`** - Package/dependency updates

### Conventional Commit Types

- **feat**: New feature for the user
- **fix**: Bug fix for the user
- **docs**: Documentation changes
- **style**: Formatting, missing semicolons, etc.
- **refactor**: Code change that neither fixes a bug nor adds a feature
- **perf**: Performance improvements
- **test**: Adding missing tests or correcting existing tests
- **chore**: Build process or auxiliary tool changes
- **ci**: Changes to CI configuration files and scripts
- **build**: Changes that affect the build system or external dependencies

## 🎯 Project Architecture & Purpose

### Core Purpose

Starting point for creating enterprise-grade REST APIs with:

- **Type-safe development** using TypeScript and Zod validation
- **Modern tooling** with Vite, Vitest, and pnpm for fast development cycles
- **Built-in libraries** for common patterns (HTTP client, decorators, validation)
- **Comprehensive testing** setup with unit tests, integration tests, and mutation testing
- **Production-ready** configuration with Docker support and environment management

### Architecture Overview

The project follows a modular architecture with:

- **Feature-based modules** organized under `src/app/modules/`
- **Shared libraries** in `src/libs/` for reusable functionality
- **Custom decorators** for security, validation, and documentation
- **Dependency injection** using NestJS's built-in IoC container
- **Environment-specific configurations** with JSON schema validation

## 🌐 Language Guidelines

**Programming and documentation language is English**, including:

- Variable names, function names, class names
- Comments and code documentation
- API endpoint names and descriptions
- Error messages and logs
- README files and technical documentation

**Exception for business concepts**: When specific business entities or concepts are explicitly defined by the user (e.g., "Siniestro", "Episodio", "Encuentro", "Atención"), these domain-specific terms should be preserved in their original language when they represent core business entities that are part of the domain model.

Examples:

```typescript
// ✅ Correct - business entity preserved
export class SiniestroService {
	async createSiniestro(data: CreateSiniestroDto): Promise<Siniestro> {
		// implementation logic in English
		return this.repository.save(data);
	}
}

// ✅ Correct - technical terms in English
export class UserController {
	async getUserById(id: number): Promise<User> {
		// all technical implementation in English
		return this.userService.findById(id);
	}
}
```

# Project Technology Stack

- **Framework**: NestJS v11+ (Node.js framework)
- **Runtime**: Node.js 22+ with TypeScript v5+
- **HTTP Server**: Fastify (high-performance web framework)
- **Validation**: Zod v4+ (TypeScript-first schema validation)
- **Testing**: Vitest (fast unit testing framework)
- **Coverage**: Vitest Coverage V8
- **Mutation Testing**: Stryker Mutator
- **Documentation**: OpenAPI/Swagger (API documentation)
- **Package Manager**: pnpm (fast, disk space efficient)
- **Build Tool**: Vite (fast build and dev server)
- **Code Quality**: ESLint + Prettier
- **Mocking**: MSW (Mock Service Worker)

## 🚨 Configuration Management Rules - CRITICAL

### ❌ NEVER DO:

- Hardcode URLs, API keys, or any configuration directly in code
- Use `process.env` directly in services or controllers
- Define configuration values inside business logic

### ✅ ALWAYS DO:

- Define non-secret config in `env/appsettings.json`
- Define secrets in `env/dev.env.json`, `env/qa.env.json`, etc.
- Create configuration interfaces and inject them via dynamic providers
- Define configuration as far out as possible (in modules)
- Use dependency injection for all configuration

## 📂 Path Aliases and Import Conventions

- Use **package.json path aliases**: `#libs/zod`, `#libs/http`, `#libs/decorators`
- Always include **.ts extension** in relative imports
- Group imports: external packages first, then internal modules
- Use **named imports** and avoid default exports where possible

```typescript
// ✅ CORRECT import order and style
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ZodDto } from '#libs/zod';
import { HttpClient } from '#libs/http';
import { UserService } from '../services/user.service.ts';
import { CreateUserDto } from './create-user.dto.ts';

// ❌ WRONG - missing extensions, wrong order
import { CreateUserDto } from './create-user.dto';
import { UserService } from '../services/user.service';
import { Injectable } from '@nestjs/common';
```

## 🚨 Common Pitfalls to Avoid

1. **Don't use `any` type** - Always provide explicit types
2. **Don't forget error handling** - Wrap async operations in try-catch
3. **Don't skip validation** - Use ZodValidationPipe for all inputs
4. **Don't hardcode values** - Use environment variables and configuration
5. **Don't forget security** - Apply appropriate guards to controllers
6. **Don't skip tests** - Create comprehensive unit and integration tests
7. **Don't ignore documentation** - Provide OpenAPI docs for all endpoints
8. **Don't mix concerns** - Keep controllers thin, put logic in services

# Essential Commands

## 🚀 Quick Reference

```bash
pnpm start:dev          # Development with hot reload
pnpm test:dev --run  # Tests without coverage
pnpm test:dev --coverage --run  # Tests with coverage
pnpm test:dev           # Watch mode testing
pnpm lint               # Code quality checks
pnpm format             # Code formatting
pnpm build              # Production build
```

For comprehensive command documentation, see `patterns.md` quick reference section.

# Development Guidelines

## 🎯 Core Principles

- **Type Safety First**: Leverage TypeScript and Zod for complete type safety from API to database
- **Test-Driven Development**: Write tests for all new functionality and maintain high test coverage
- **Modular Architecture**: Organize code into feature-based modules with clear separation of concerns
- **Documentation**: Document APIs using OpenAPI/Swagger and maintain up-to-date README files
- **Code Quality**: Follow consistent coding standards and use automated tools for formatting and linting

## 📚 Built-in Libraries Usage

### Zod Integration

- Use `ZodDto` for all data transfer objects with automatic validation
- Create type-safe schemas with `z.object()`, `z.array()`, etc.
- Leverage custom validators: `phone()`, `epoch()` for specialized data types
- Always provide schema names for OpenAPI documentation: `ZodDto(schema, 'ModelName')`

### HTTP Client

- Use the built-in HTTP client for external API calls
- Configure timeouts and error handling appropriately
- Implement proper retry logic for critical external dependencies

### Security Decorators

- Apply `@ApiKey()` decorator to controllers that require authentication
- Use `@AllowAnonymous()` for public endpoints within protected controllers
- Create custom security guards using `createSecurityGuard()` factory

## 🏗️ Module Development

### When creating new modules:

1. **Define DTOs first** with Zod schemas in `schemas/` directory
2. **Implement services** with business logic and proper dependency injection
3. **Create controllers** with RESTful endpoints and proper HTTP status codes
4. **Add documentation** using controller.docs.ts files with OpenAPI decorators
5. **Write comprehensive tests** for both services and controllers
6. **Register modules** in the module index and app.module.ts

### Best Practices:

- **Single Responsibility**: Each service should have a clear, focused purpose
- **Dependency Injection**: Use constructor injection for all dependencies
- **Error Handling**: Implement proper error handling with meaningful error messages
- **Validation**: Validate all inputs using Zod DTOs and NestJS pipes
- **Logging**: Use appropriate log levels and include contextual information
- **Performance**: Consider caching, pagination, and database optimization

## 🧪 Testing Strategy

- **Unit Tests**: Test individual functions and methods in isolation
- **Integration Tests**: Test module interactions and API endpoints
- **Mock External Dependencies**: Use MSW for HTTP mocking and vitest-mock-extended for service mocking
- **Coverage Goals**: Maintain at least 80% code coverage across the project
- **Mutation Testing**: Run periodic mutation tests to verify test quality

## 🔒 Security Considerations

- **Input Validation**: Validate all inputs using Zod schemas
- **Authentication**: Implement proper API key or JWT authentication
- **Authorization**: Use role-based access control where appropriate
- **Environment Variables**: Keep sensitive data in environment variables
- **HTTPS**: Always use HTTPS in production environments
- **Rate Limiting**: Implement rate limiting for public APIs

## 📋 Code Review Checklist

- [ ] All new code includes appropriate tests
- [ ] Zod schemas are defined for all DTOs
- [ ] API endpoints are documented with OpenAPI
- [ ] Error handling is implemented properly
- [ ] Code follows established patterns and conventions
- [ ] No hardcoded values (use environment variables)
- [ ] Performance implications have been considered
- [ ] Security implications have been reviewed

## 🚀 Deployment Preparation

- **Environment Configuration**: Ensure all required environment variables are documented
- **Database Migrations**: Include any necessary database schema changes
- **Dependencies**: Update package.json with any new dependencies
- **Documentation**: Update API documentation and README files
- **Testing**: Run full test suite including mutation tests
- **Build Verification**: Test the production build locally before deployment

# Configuration Management Rules - CRITICAL

## ❌ NEVER DO:

- Hardcode URLs, API keys, or any configuration directly in code
- Use `process.env` directly in services or controllers
- Define configuration values inside business logic

## ✅ ALWAYS DO:

- Define non-secret config in `env/appsettings.json`
- Define secrets in `env/dev.env.json`, `env/qa.env.json`, etc.
- Create configuration interfaces and inject them via dynamic providers
- Define configuration as far out as possible (in modules)
- Use dependency injection for all configuration

## 📂 Path Aliases and Import Conventions

- Use **package.json path aliases**: `#libs/zod`, `#libs/http`, `#libs/decorators`
- Always include **.ts extension** in relative imports
- Group imports: external packages first, then internal modules
- Use **named imports** and avoid default exports where possible

## 🚨 Common Pitfalls to Avoid

1. **Don't use `any` type** - Always provide explicit types
2. **Don't forget error handling** - Wrap async operations in try-catch
3. **Don't skip validation** - Use ZodValidationPipe for all inputs
4. **Don't hardcode values** - Use environment variables and configuration
5. **Don't forget security** - Apply appropriate guards to controllers
6. **Don't skip tests** - Create comprehensive unit and integration tests
7. **Don't ignore documentation** - Provide OpenAPI docs for all endpoints
8. **Don't use plain commit messages** - Always use conventional commits with gitmojis
9. **Don't mix concerns** - Keep controllers thin, put logic in services
10. **Don't mix concerns** - Keep controllers thin, put logic in services
