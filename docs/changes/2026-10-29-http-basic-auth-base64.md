---
status: done
---

# HttpClient.basicAuth emits RFC 7617 base64

## Goal

`HttpClient.basicAuth` encoded the credential as **base64url**, but RFC 7617 requires standard
base64. base64url drops the `=` padding and rewrites `+`/`/` as `-`/`_`, so most credentials
produced a malformed `Authorization: Basic` header: a strict server rejects it or treats the call
as anonymous.

## Plan

- [x] Replace the round-trip spec (it decoded with base64url, so it could never fail) with the
      RFC 7617 vectors — failed against the old code (missing padding)
- [x] Encode with `TextEncoder` + `btoa` in [`http.client.ts`](../../src/libs/http/http.client.ts)
- [x] Gate

## Decisions

- `TextEncoder` + `btoa` · same body as the Work templates' copies of the client, which also run
  in the browser · `Buffer…toString('base64')` is Node-only

## Verification

- Gate: `pnpm lint && pnpm exec tsc --noEmit && pnpm build && pnpm test:dev --coverage --run` →
  lint clean, 126 tests passed, build OK

## Not included / assumptions

- Projects already generated from this template keep the bug until they port the fix.
