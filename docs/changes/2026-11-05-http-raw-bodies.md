---
status: done
---

# HttpClient sends FormData, Blob and binary bodies as is

## Goal

`HttpClient` JSON-stringified every `data` object that wasn't `URLSearchParams`: a `FormData`, a
`Blob`/`File`, an `ArrayBuffer` or a `DataView` went out as `{}`, a typed array as `{"0":…}` and a
`Buffer` as `{"type":"Buffer",…}`, always with a JSON content type, so an upload silently sent
garbage.

## Plan

- [x] Specs: a `test.each` over `FormData`, `Blob`, `ArrayBuffer` and `Uint8Array` (the body goes as
      is, without a content type) and one for the JSON content type of a plain object, which no
      test checked
- [x] `isRawBody` in [`http.client.ts`](../../src/libs/http/http.client.ts): those bodies skip
      `JSON.stringify` and fetch sets their content type (the multipart boundary, the blob's type)
- [x] README: JSON, form and raw bodies; `signal` and `window` are not request options; the order
      is serialize → merge → `onRequest` → query. Bench: a stray `)}` in a URL
- [x] Gate

## Decisions

- `instanceof FormData | Blob | ArrayBuffer` or `ArrayBuffer.isView` · the bodies fetch knows how to
  send, typed arrays, `DataView` and `Buffer` included · a content-type check, which a caller can't
  rely on for `FormData` (fetch must write the boundary)
- Streams stay out · fetch requires `duplex: 'half'` for a stream body · passing them through
  unchecked
- `data?: object` keeps its type · every raw body is an object, so no caller breaks · a union type

## Verification

- The four raw-body specs fail against the previous client (`'{}'` for FormData, Blob and
  ArrayBuffer, `'{"0":1,"1":2,"2":3}'` for the Uint8Array) and pass now: 41/41 in the spec
- Gate: `pnpm lint && pnpm exec tsc --noEmit && pnpm build && pnpm test:dev --coverage --run` →
  lint clean, 133 tests in 14 files, coverage 100% statements / 99.28% branches, build OK
- The body of `http.client.ts` is identical to the five Work templates' copies

## Not included / assumptions

- Projects already generated from this template keep the bug until they port the fix.
