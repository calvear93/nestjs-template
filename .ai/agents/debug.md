# Debug Mode Instructions

> **Source of truth:** defer to [`AGENTS.md`](../../AGENTS.md) and the deep docs in
> [`.github/instructions/`](../../.github/instructions/) for the stack, rules, structure, and commands.

You are in debug mode for a **NestJS Template** project using TypeScript, Fastify, Zod validation, and Vitest testing. Your primary objective is to systematically identify, analyze, and resolve bugs. Follow this structured debugging process:

## Phase 1: Problem Assessment

1. **Gather Context**: Understand the current issue by:
    - Reading error messages, stack traces, or failure reports
    - Examining the codebase structure and recent changes
    - Identifying the expected vs actual behavior
    - Reviewing relevant test files and their failures

2. **Reproduce the Bug**: Before making any changes:
    - Run the application or tests to confirm the issue
    - Document the exact steps to reproduce the problem
    - Capture error outputs, logs, or unexpected behaviors
    - Provide a clear bug report to the developer with:
        - Steps to reproduce
        - Expected behavior
        - Actual behavior
        - Error messages/stack traces
        - Environment details

## Phase 2: Investigation

3. **Root Cause Analysis**:
    - Trace the code execution path leading to the bug
    - Examine variable states, data flows, and control logic
    - Check for common issues: null references, off-by-one errors, race conditions, incorrect assumptions
    - Use search and usages tools to understand how affected components interact
    - Review git history for recent changes that might have introduced the bug

4. **Hypothesis Formation**:
    - Form specific hypotheses about what's causing the issue
    - Prioritize hypotheses based on likelihood and impact
    - Plan verification steps for each hypothesis

## Phase 3: Resolution

5. **Implement Fix**:
    - Make targeted, minimal changes to address the root cause
    - Ensure changes follow existing code patterns and conventions
    - Add defensive programming practices where appropriate
    - Consider edge cases and potential side effects

6. **Verification**:
    - Run tests to verify the fix resolves the issue
    - Execute the original reproduction steps to confirm resolution
    - Run broader test suites to ensure no regressions
    - Test edge cases related to the fix

## Phase 4: Quality Assurance

7. **Code Quality**:
    - Review the fix for code quality and maintainability
    - Add or update tests to prevent regression
    - Update documentation if necessary
    - Consider if similar bugs might exist elsewhere in the codebase

8. **Final Report**:
    - Summarize what was fixed and how
    - Explain the root cause
    - Document any preventive measures taken
    - Suggest improvements to prevent similar issues

## Debugging Guidelines

- **Be Systematic**: Follow the phases methodically, don't jump to solutions
- **Document Everything**: Keep detailed records of findings and attempts
- **Think Incrementally**: Make small, testable changes rather than large refactors
- **Consider Context**: Understand the broader system impact of changes
- **Communicate Clearly**: Provide regular updates on progress and findings
- **Stay Focused**: Address the specific bug without unnecessary changes
- **Test Thoroughly**: Verify fixes work in various scenarios and environments

Remember: Always reproduce and understand the bug before attempting to fix it. A well-understood problem is half solved.

## 🔧 Project-Specific Debugging Tools

Commands are in [`AGENTS.md`](../../AGENTS.md) — the ones most relevant to debugging are
`pnpm lint`, `pnpm test:dev --coverage --run`, `pnpm build`, and `pnpm start:dev`.

### Common Issue Patterns

#### Zod Validation Errors

- **Symptom**: 400 Bad Request with validation details
- **Check**: Zod schemas in `schemas/*.schema.ts`
- **Fix**: Ensure schemas match the data structure
- **Verify**: `.meta({ id: 'SchemaName' })` goes on the private `_`-prefixed base, **before**
  `z.compile()`, to register the schema as an OpenAPI component — see the `zod-schema` skill

```typescript
// Correct pattern
const _UserSchema = z
	.object({
		name: z.string().min(1),
		email: z.email(),
	})
	.meta({ id: 'User' });
export const UserSchema = z.compile(_UserSchema);
export type User = z.infer<typeof UserSchema>;
```

#### Configuration Issues

- **Symptom**: Undefined config values or runtime errors
- **Check**: Files in `env/appsettings.json` and `env/dev.env.json`
- **Fix**: Never use `process.env` directly outside `src/app/config/*.config.ts` — there is
  **no `ConfigService`** in this template
- **Verify**: Check module providers use `useFactory` pointing at a config factory (see
  [architecture-guide → Configuration architecture](../../.github/instructions/architecture-guide.instructions.md#configuration-architecture))

```typescript
// Correct pattern — src/app/config/api.config.ts
export const apiConfig = (): ApiConfig =>
	ApiConfigSchema.parse({ baseUrl: process.env.API_BASE_URL });

// module:
{ provide: 'API_CONFIG', useFactory: apiConfig }
```

#### Test Failures

- **Symptom**: Tests failing or flaky
- **Check**: Mock setup in `*.spec.ts` files
- **Fix**: Use `vitest-mock-extended` for type-safe mocks
- **Verify**: Clear mocks in `afterEach(() => vi.clearAllMocks())`

#### Import Path Issues

- **Symptom**: Module resolution errors
- **Check**: Use path aliases: `#libs/zod`, `#libs/http`, `#libs/decorators`
- **Fix**: Always include `.ts` extension in relative imports
- **Verify**: Check `package.json` imports section

#### Fastify-Specific Issues

- **Symptom**: Request body parsing errors
- **Check**: Content-Type headers and body parser configuration
- **Fix**: Ensure the route uses `@Body`/`@Query`/`@Param({ schema })` so `StandardSchemaValidationPipe` validates it
- **Verify**: Controller method signatures use correct decorators

### Debugging Workflow for This Project

1. **Check Errors First**: Run `pnpm lint` and check compilation errors
2. **Run Tests**: Execute `pnpm test:dev --coverage --run` to verify scope
3. **Check Logs**: Start with `pnpm start:dev` for detailed debug logs
4. **Validate Schemas**: Ensure Zod schemas are correctly defined
5. **Check Config**: Verify environment files in `env/` directory
6. **Review Patterns**: Reference `.github/instructions/patterns.instructions.md`
7. **Fix & Verify**: Apply minimal fix, run tests, check coverage

### Quality Verification Checklist

- [ ] Tests pass: `pnpm test:dev --coverage --run`
- [ ] No lint errors: `pnpm lint`
- [ ] Code formatted: `pnpm format`
- [ ] Coverage maintained or improved
- [ ] No hardcoded values (use config providers)
- [ ] Proper error handling with specific exceptions
- [ ] All imports use correct path aliases
- [ ] Schemas are `z.compile()`-wrapped; `.meta({ id })` (if any) is on the base, before compile
