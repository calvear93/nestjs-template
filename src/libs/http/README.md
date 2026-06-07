# 🌐 `#libs/http` — Fetch HTTP Client

> A typed, `fetch`-based HTTP client for NestJS with first-class **query serialization**, **timeouts**, **interceptors**, and **error throwing** — wired into DI as a module or a provider.

Built on the native Fetch API (no `axios`). You get a small `HttpClient` class plus two ways to inject it, typed responses, and ergonomic helpers for query strings and JSON bodies.

## ✨ Highlights

- **Typed responses** — `client.get<User>(url)` → `HttpResponse<User>` with a typed `.json()`.
- **Smart query strings** — nested objects (dot-notation), arrays (comma-joined), `Date`/`bigint`, nullish values dropped.
- **JSON & form bodies** — pass `data`; content-type is set for you (`URLSearchParams` → form-urlencoded).
- **Timeouts & cancellation** — `timeout` aborts with `TimeoutError`; bring your own `AbortController` via `cancel`.
- **Throws on errors** — non-2xx raises `HttpError` (toggle with `throwOnClientError`); network failures become `BAD_GATEWAY`.
- **DI-ready** — `HttpModule.register()` (a shared client) or `HttpProvider.register()` (named, per-service clients).

## 📦 API at a glance

| Export                          | Type                                         | Use it to…                               |
| ------------------------------- | -------------------------------------------- | ---------------------------------------- |
| `HttpClient`                    | class                                        | make requests (standalone or injected)   |
| `HttpModule`                    | `register(config?) => DynamicModule`         | provide a shared client to a module      |
| `HttpProvider`                  | `register(config?) => FactoryProvider`       | provide named clients in `providers: []` |
| `HttpError`                     | `Error` + `status`, `statusText`, `response` | catch non-2xx responses                  |
| `TimeoutError`                  | `Error`                                      | catch aborted-by-timeout requests        |
| `HttpMethod` / `HttpStatusCode` | enums                                        | reference verbs / status codes           |

**`HttpClient` methods** — all return `Promise<HttpResponse<R>>`:

| Method                            | Body? | Notes                                  |
| --------------------------------- | ----- | -------------------------------------- |
| `get<R>(url, config?)`            | no    |                                        |
| `delete<R>(url, config?)`         | no    |                                        |
| `post/put/patch<R>(url, config?)` | yes   | `config.data` → serialized body        |
| `request<R>(url, options?)`       | —     | low-level escape hatch                 |
| `setHeader(k, v)` · `config`      | —     | mutate base headers/config             |
| `HttpClient.basicAuth(u, p)`      | —     | static · base64url for `Authorization` |

**Request `config`** — extends `RequestInit` (minus `signal`) with: `query`, `data` (body methods), `timeout` (ms), `cancel` (`AbortController`), `onRequest` (interceptor), `headers`.

## 🚀 Quick start (standalone)

```typescript
import { HttpClient } from '#libs/http';

const api = new HttpClient({ url: 'https://api.example.com' });

// typed GET — responses are fetch Responses, so call .json()
const res = await api.get<User>('/users/1');
const user = await res.json(); // User

// POST with a JSON body (content-type set automatically)
const created = await api
	.post<User>('/users', { data: { name: 'Ada' } })
	.then((r) => r.json());
```

## 🔌 NestJS integration

**Option A — `HttpModule` (one shared client per module):**

```typescript
import { Module } from '@nestjs/common';
import { HttpModule } from '#libs/http';

@Module({
	imports: [
		HttpModule.register({ url: 'https://api.example.com', global: true }),
	],
})
export class AppModule {}
```

```typescript
import { Injectable } from '@nestjs/common';
import { HttpClient } from '#libs/http';

@Injectable()
export class UserService {
	constructor(private readonly http: HttpClient) {}

	getUser(id: number) {
		return this.http.get<User>(`/users/${id}`).then((r) => r.json());
	}
}
```

**Option B — `HttpProvider` (named clients, e.g. several upstreams):**

```typescript
import { Module } from '@nestjs/common';
import { HttpProvider } from '#libs/http';

const BILLING_API = 'BILLING_API';

@Module({
	providers: [
		HttpProvider.register({
			useToken: BILLING_API,
			url: 'https://billing.internal',
		}),
	],
})
export class BillingModule {}

// inject with @Inject(BILLING_API) private readonly billing: HttpProvider
```

## 🧰 Request features

### Query parameters

```typescript
await api.get('/search', {
	query: {
		q: 'nest',
		tags: ['a', 'b'], //        → tags=a,b
		page: { size: 20, n: 2 }, // → page.size=20&page.n=2
		empty: null, //             dropped
	},
});
```

### Timeouts & cancellation

```typescript
import { TimeoutError } from '#libs/http';

try {
	await api.get('/slow', { timeout: 3000 }); // aborts after 3s
} catch (e) {
	if (e instanceof TimeoutError) retry();
}

const ctrl = new AbortController();
api.get('/stream', { cancel: ctrl });
ctrl.abort(); // cancel manually
```

### Request interceptor & auth

```typescript
const api = new HttpClient({
	url: 'https://api.example.com',
	onRequest: (options) => {
		options.headers = {
			...options.headers,
			'x-trace': crypto.randomUUID(),
		};
	},
});

api.setHeader('authorization', `Basic ${HttpClient.basicAuth('user', 'pass')}`);
```

### Error handling

```typescript
import { HttpError } from '#libs/http';

try {
	await api.get('/protected');
} catch (e) {
	if (e instanceof HttpError) {
		console.error(e.status, e.statusText); // e.g. 401 UNAUTHORIZED
		const body = await e.json(); // the parsed error payload
	}
}

// opt out of throwing and inspect the response yourself
const lenient = new HttpClient({ url: '…', throwOnClientError: false });
const res = await lenient.get('/maybe-404');
if (!res.ok) handle(res.status);
```

## 🧪 Testing

Mock the client with `vitest-mock-extended` when unit-testing a service:

```typescript
import { mock } from 'vitest-mock-extended';
import { HttpClient, type HttpResponse } from '#libs/http';

const http = mock<HttpClient>();
http.get.mockResolvedValue({
	json: async () => ({ name: 'Ada' }),
} as HttpResponse<User>);

const service = new UserService(http);
expect(await service.getUser(1)).toEqual({ name: 'Ada' });
```

For integration tests against real `fetch`, spin up a throwaway server with the helper bundled in `src/libs/http/__mocks__/` (import it by relative path — it's a test-only helper, not part of the public `#libs/http` entrypoint):

```typescript
import { createHttpMockServer } from './__mocks__/create-http-mock-server.mock.ts';

const [server, handler, port] = await createHttpMockServer();
handler.mockImplementation((_req, res) =>
	res.end(JSON.stringify({ ok: true })),
);
const api = new HttpClient({ url: `http://localhost:${port}` });
// …assert on handler calls, then server.close()
```

## 🧠 How it works

Each call merges the base config with per-request options (headers deep-merged), runs the optional `onRequest` interceptor, serializes `query` into the URL and `data` into the body, and arms an `AbortController` when `timeout` is set. It then `fetch`es and — unless `throwOnClientError` is `false` — throws `HttpError` for any non-`ok` response; a network `TypeError` is normalized into an `HttpError` with status `BAD_GATEWAY`. The resolved value is the native `Response`, narrowed to `HttpResponse<R>` so `.json()` is typed. `HttpModule` binds a single `HttpClient` instance under a token (default `HttpClient`); `HttpProvider` is an `HttpClient` subclass exposing a `FactoryProvider` for `providers: []`.
