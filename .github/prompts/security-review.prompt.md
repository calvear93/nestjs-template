---
mode: agent
description: 'Review security aspects following OWASP guidelines and NestJS best practices'
---

# Security Review Prompt

Review the security aspects of [COMPONENT] and ensure:

1. Proper input validation using Zod schemas
2. Appropriate authentication and authorization
3. Secure handling of sensitive data
4. Protection against common vulnerabilities
5. Proper error handling without information leakage
6. Rate limiting where appropriate
7. HTTPS enforcement in production
8. Environment variable usage for secrets
9. Proper logging without exposing sensitive data
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

- [ ] Input validation with Zod schemas
- [ ] Authentication decorators applied (@ApiKey)
- [ ] Sensitive data properly protected
- [ ] Error messages don't leak information
- [ ] Environment variables used for secrets
- [ ] HTTPS enforced in production
- [ ] Rate limiting implemented
- [ ] Logging excludes sensitive data
- [ ] OWASP guidelines followed
- [ ] Security headers configured
