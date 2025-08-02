---
mode: agent
description: 'Create a new API endpoint following NestJS template best practices'
---

# API Endpoint Creation Prompt

Create a new API endpoint for [ENDPOINT_DESCRIPTION] following these requirements:

1. Define Zod schema for request/response DTOs
2. Implement proper HTTP method and status codes
3. Add comprehensive validation using ZodValidationPipe
4. Include OpenAPI documentation with examples
5. Apply appropriate security decorators (@ApiKey or @AllowAnonymous)
6. Implement proper error handling
7. Add unit tests for the controller method
8. Follow RESTful conventions
9. Use dependency injection for services
10. Include request/response type safety

## Technical Requirements:

- Use Fastify response patterns
- Include proper logging with context
- Validate all inputs with Zod
- Return appropriate HTTP status codes
- Handle errors gracefully with meaningful messages

## Implementation Checklist:

- [ ] Zod schema defined for request/response
- [ ] Controller method implements proper HTTP verb
- [ ] OpenAPI documentation includes examples
- [ ] Security decorator applied (@ApiKey or @AllowAnonymous)
- [ ] Error handling with appropriate HTTP status codes
- [ ] Unit tests cover success and error scenarios
- [ ] Service injection properly configured
- [ ] Request validation using ZodValidationPipe
- [ ] Response follows consistent format
- [ ] Logging includes request context
