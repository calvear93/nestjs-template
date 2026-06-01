---
mode: agent
description: 'Improve code quality following NestJS template standards and best practices'
---

# Code Quality Improvement Prompt

Improve the code quality of [FILE/COMPONENT] by:

1. Applying TypeScript best practices
2. Improving error handling and validation
3. Optimizing performance where applicable
4. Enhancing code readability and maintainability
5. Following the project's coding standards
6. Ensuring proper dependency injection
7. Adding missing documentation
8. Improving test coverage
9. Applying consistent naming conventions
10. Removing code duplication

Follow `AGENTS.md` (the single source of truth) and
`.github/instructions/coding-standards.instructions.md` for the full lint and
style contract; the points below are the high-value highlights.

## Maintain:

- Backward compatibility
- Existing functionality
- Test coverage
- Type safety
- Project architecture patterns

## Code Quality Areas:

### TypeScript Best Practices:

- Prefer `unknown` + narrowing over `any`; explicit types everywhere
- Use inline `type` imports (`import { type Foo } from '...'`)
- Apply union types, generics, and type guards appropriately

### Error Handling:

- Throw NestJS HTTP exceptions (`NotFoundException`, `BadRequestException`, …)
  with messages; map transport errors from `#libs/http`
- Name the catch parameter `error`; log via `Logger` (never `console.log`)
- Validate inputs with `ZodDto` / `ZodValidationPipe`

### Performance Optimization:

- Identify and fix performance bottlenecks
- Optimize database queries
- Implement proper caching strategies
- Reduce memory footprint

### Code Organization:

- Apply single responsibility principle
- Remove code duplication
- Improve method and variable naming
- Organize imports properly

## Quality Checklist:

- [ ] TypeScript strict mode compliance
- [ ] Proper error handling implemented
- [ ] Performance optimizations applied
- [ ] Code duplication removed
- [ ] Documentation updated
- [ ] Test coverage maintained
- [ ] Naming conventions followed
- [ ] Architecture patterns respected
- [ ] Dependencies properly injected
- [ ] Configuration externalized
