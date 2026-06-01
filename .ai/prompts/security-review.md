# Security Review Prompt

Review the security aspects of [COMPONENT] and ensure:

1. Proper input validation using Zod schemas
2. Appropriate authentication and authorization
3. Secure handling of sensitive data
4. Protection against common vulnerabilities
5. Proper error handling without information leakage
6. Rate limiting where appropriate
7. HTTPS enforcement in production
8. Secrets read only in the config layer (`src/app/config/`), never
   `process.env` in services/controllers
9. Proper logging (NestJS `Logger`) without exposing sensitive data
10. Following OWASP security guidelines

## Focus on:

- Authentication mechanisms
- Input sanitization
- Error message security
- Data exposure prevention

## Security Areas:

### Input Validation:

- All inputs validated with Zod schemas
- SQL injection prevention
- XSS protection
- Command injection prevention

### Authentication & Authorization:

- Proper API key validation
- Role-based access control
- JWT token security
- Session management

### Data Protection:

- Sensitive data encryption
- Secure data transmission
- Proper password handling
- PII protection

### Error Handling:

- No sensitive information in error messages
- Proper error logging
- Rate limiting on authentication endpoints
- Fail-safe defaults

## Security Checklist:

- [ ] Input validation with `ZodDto` / `ZodValidationPipe`
- [ ] `@ApiKey()` applied at controller level; `@AllowAnonymous()` only where intended
- [ ] Custom guards built with `createSecurityGuard()` (`#libs/decorators`)
- [ ] Sensitive data properly protected
- [ ] Error messages don't leak information (use NestJS HTTP exceptions)
- [ ] Secrets read only in the config layer, never `process.env` in services
- [ ] HTTPS enforced in production
- [ ] Rate limiting implemented
- [ ] Logging via `Logger` excludes sensitive data
- [ ] OWASP guidelines followed
- [ ] Security headers configured

Cross-check against `AGENTS.md` (Security) and
`.github/instructions/coding-standards.instructions.md`.
