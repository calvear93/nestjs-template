# Copilot Instructions

This directory contains instructions for GitHub Copilot to understand the project structure, coding standards, and development practices.

## Files Overview

- **`copilot-instructions.md`** - Main project overview, technology stack, and development guidelines
- **`coding-standards.md`** - TypeScript formatting rules, test organization, and style conventions
- **`patterns.md`** - Comprehensive NestJS development patterns, testing strategies, and best practices
- **`architecture-guide.md`** - Project structure, module organization, and architectural conventions

## Quick Reference

### Essential Commands

```bash
pnpm start:dev                 # Development with hot reload
pnpm test:dev --coverage --run # Run tests with coverage
pnpm test:dev                  # Watch mode testing
pnpm lint                      # Code quality checks
pnpm format                    # Code formatting
```

### Key Principles

- **Type Safety First**: Zod validation and TypeScript throughout
- **Configuration Management**: Never hardcode values, use dependency injection
- **Testing Strategy**: Comprehensive test coverage with arrange/act/assert structure
- **Security**: API keys, proper validation, and authorization patterns

## Usage

These instruction files are automatically recognized by GitHub Copilot and provide context-aware code suggestions that follow the project's established patterns and conventions.
