---
mode: agent
description: 'Create comprehensive API documentation using OpenAPI/Swagger standards'
---

# API Documentation Prompt

Create comprehensive API documentation for [MODULE/ENDPOINT] including:

1. OpenAPI/Swagger specifications
2. Clear endpoint descriptions
3. Request/response examples
4. Error response documentation
5. Authentication requirements
6. Rate limiting information
7. Usage examples in multiple formats
8. Parameter descriptions and validation rules
9. Response schema definitions
10. Integration examples

## Follow the project's documentation patterns:

- Use the controller.docs.ts structure
- Include realistic examples
- Document all possible responses
- Provide clear error codes
- Use consistent terminology

## Documentation Structure:

### Controller Documentation (controller.docs.ts):

```typescript
import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

export const GetItemDocs = () =>
	applyDecorators(
		ApiTags('Items'),
		ApiOperation({
			summary: 'Get item by ID',
			description: 'Retrieves a specific item by its unique identifier',
		}),
		ApiResponse({
			status: 200,
			description: 'Item retrieved successfully',
			// Include schema and examples
		}),
		ApiResponse({
			status: 404,
			description: 'Item not found',
		}),
	);
```

### Required Documentation Elements:

- **Endpoint Summary**: Brief description of what the endpoint does
- **Parameters**: All query, path, and body parameters with types
- **Request Examples**: Sample requests in JSON format
- **Response Examples**: Sample responses for success and error cases
- **Status Codes**: All possible HTTP status codes with descriptions
- **Authentication**: Required authentication methods
- **Rate Limits**: Any applicable rate limiting rules

## Documentation Checklist:

- [ ] OpenAPI decorators applied to controllers
- [ ] All endpoints have clear descriptions
- [ ] Request/response schemas defined
- [ ] Examples provided for all scenarios
- [ ] Error responses documented
- [ ] Authentication requirements specified
- [ ] Parameter validation rules included
- [ ] Rate limiting information provided
- [ ] Integration examples included
- [ ] Consistent terminology used
