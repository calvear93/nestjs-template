# API Documentation Prompt

Create comprehensive API documentation for [MODULE/ENDPOINT] including:

1. OpenAPI/Swagger specifications via the colocated `*.controller.docs.ts`
2. Clear endpoint descriptions (`ApiOperation`)
3. Request/response examples sourced from the Zod schema (`standardSchema`)
4. Error response documentation (`ApiResponse` per status)
5. Authentication requirements (`@ApiKey()` / `@AllowAnonymous()`)
6. Parameter descriptions and validation rules (driven by the Zod schema)
7. Response schema definitions
8. Integration examples

## Follow the project's documentation patterns:

- Use the colocated `*.controller.docs.ts` structure (`DecoratorsLookUp`)
- Include realistic examples
- Document all possible responses
- Provide clear status codes (`HttpStatusCode` from `#libs/http`)
- Use consistent terminology

See `AGENTS.md` and `.github/instructions/patterns.instructions.md` for the
canonical docs recipe.

## Documentation Structure:

### Controller Documentation (`*.controller.docs.ts`):

Document each endpoint in a colocated docs file typed with
`DecoratorsLookUp<Controller>` and wire it via `@ApplyControllerDocs(...)` on the
controller. Keep `@Api*()` decorators out of the controller body. Reference the
response schema through `ApiResponse({ standardSchema })` — request schemas are
picked up automatically from the route's `@Body`/`@Query`/`@Param({ schema })`
and need no manual `ApiBody` schema (see `#libs/zod`'s README, "OpenAPI
Integration"). Use `HttpStatusCode` from `#libs/http`.

```typescript
import { HttpStatusCode } from '#libs/http';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { type DecoratorsLookUp } from '../../../../libs/decorators/apply.decorator.ts';
import { ItemSchema } from '../schemas/item.schema.ts';
import { type ItemController } from './item.controller.ts';

export const ItemControllerDocs: DecoratorsLookUp<ItemController> = {
	class: [ApiTags('Items')],
	method: {
		findById: [
			ApiOperation({ summary: 'Get item by id' }),
			ApiResponse({
				description: 'Item retrieved',
				standardSchema: ItemSchema,
				status: HttpStatusCode.OK,
			}),
			ApiResponse({
				description: 'Item not found',
				status: HttpStatusCode.NOT_FOUND,
			}),
		],
	},
};
```

### Required Documentation Elements:

- **Endpoint Summary**: Brief description of what the endpoint does
- **Parameters**: All query, path, and body parameters with types
- **Request Examples**: Sample requests in JSON format
- **Response Examples**: Sample responses for success and error cases
- **Status Codes**: All possible HTTP status codes with descriptions
- **Authentication**: Required authentication methods

## Documentation Checklist:

- [ ] OpenAPI decorators live in the colocated `*.controller.docs.ts` file
- [ ] Docs map typed as `DecoratorsLookUp<Controller>` and applied via
      `@ApplyControllerDocs(...)`
- [ ] All endpoints have clear descriptions
- [ ] Response schemas referenced via `ApiResponse({ standardSchema })`
- [ ] Error responses documented
- [ ] Authentication requirements specified
- [ ] Parameter validation rules included
- [ ] Consistent terminology used
