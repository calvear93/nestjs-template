---
status: done
---

# Security hardening defaults

## Goal

Make a fresh project safe by default: the API key guard fails closed instead of shipping off,
browsers can only call the API from listed origins instead of any origin, and every container
variant runs without root.

## Plan

- [x] `SECURITY.ENABLED` on in `|DEFAULT|`; off only in the debug and test modes; `src/main.ts`
      warns when it is off in production
- [x] CORS from `CORS.ORIGINS` (`src/app/decorators/cors.util.ts`) instead of `cors: true`;
      debug allows the react template's dev server and preview (`localhost:3003`, `:4173`)
- [x] `Dockerfile.bun` runs as the image's `bun` user (`Dockerfile` and `Dockerfile.distroless`
      already ran as `node` / `nonroot`)

## Decisions

- Fail closed on `SECURITY.ENABLED` · a deployed service with no key must not start open; the
  guard already refuses to load without its values · keeping it off until each project flips it
- Warn, not refuse to boot, when security is off in production · a project may turn it off on
  purpose · throwing at startup
- Empty `CORS.ORIGINS` turns CORS off · server to server calls are unaffected and the browser
  case must be explicit · reflecting any origin
- API key comparison stays `!==` · internal callers, performance preferred · `timingSafeEqual`

## Verification

- Gate: `pnpm lint && pnpm exec tsc --noEmit && pnpm build && pnpm test:dev --coverage --run` →
  126 tests, 100 % lines (the one uncovered branch, in `security-guard.factory.ts`, predates
  this change)
- Docker, the three variants built with `docker build --no-cache` and run with the env of
  `env export -e dev -m build`:
    - default env (security on, no key) → refuses to boot naming the missing variables
    - user / uid: `Dockerfile` node / 1000, `Dockerfile.distroless` nonroot / 65532,
      `Dockerfile.bun` bun / 1000
    - with a key: anonymous route 200; protected route 401 without or with a wrong key, 200 with
      the right one
    - `CORS_ORIGINS=https://app.example.com`: that origin gets `access-control-allow-origin`, any
      other gets none
    - `SECURITY_ENABLED=false`: protected route open and the production warning printed

## Not included / assumptions

- Rate limiting, body limit, timeouts and helmet: left to the infrastructure in front of the API
- Security logging and correlation id: postponed
