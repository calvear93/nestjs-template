<h2 align="center"><b>NestJS Skeleton</b></h2>
<h3 align="center"><b>API</b></h3>

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

<p align="center">
  A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.
</p>

<p align="center">
  <a href="https://github.com/calvear93/nestjs-template" target="_blank">
	<img src="https://img.shields.io/github/license/calvear93/nestjs-template" alt="Package License" />
  </a>
</p>

## 📥 **Getting Started**

> ⚡ **Quick start:** run `pwsh ./INIT.ps1` to configure the project interactively — it fills the placeholders below, formats the result, and removes itself.

Otherwise, replace these terms across the project by hand:

- `(((project-name)))` — repo/project name, e.g. `my-project`
- `(((app-name)))` — package/app name, e.g. `sample-api`
- `(((app-title)))` — human-readable title, e.g. `Sample API`
- `(((app-description)))` — short description of the app
- `(((base-path)))` — base API path segment, e.g. `sample` (empty = `/api`)

1. Install [Node.js](https://nodejs.org/) — see `engines.node` in `package.json` (**Node `>=24`**).
2. Install [pnpm](https://pnpm.io/installation).
3. Run `pnpm install`.
4. Start with `pnpm start:dev` (or run tests with `pnpm test:dev`).

> The `env` CLI (`@calvear/env`) loads variables from `env/` before each command. The app runs on Fastify with API versioning enabled.

### Docker

- Export environment variables for build mode:
    - `pnpm exec env export -e dev -m build -p .env`
- Build and run:
    - `docker build --no-cache -f Dockerfile --tag image_name .`
    - `docker run --env-file .env -d -it -p 8080:8080/tcp --name container_name image_name`
- Open `http://localhost:8080/api/(((base-path)))`.

## 📋 **Environments**

This template ships with two `env` environments:

- **dev**: development environment
- **release**: production-like environment

These are environment profiles loaded by the `env` CLI (not necessarily Git branches).

## 🧪 **Executing**

Project uses **pnpm scripts** to run, test and build.
Some scripts are environment-specific, using the suffix `:<env>` where `<env>` is `dev` or `release`.

| Command                      | Action                       |
| ---------------------------- | ---------------------------- |
| pnpm start:`<env>`           | executes the app             |
| pnpm build:`<env>`           | build the app                |
| pnpm preview                 | builds and serves the app    |
| pnpm test:`<env>`            | executes tests               |
| pnpm test:`<env>` --coverage | executes tests with coverage |
| pnpm env:schema              | updates env JSON schema      |
| pnpm format                  | code format                  |
| pnpm lint                    | code style review            |

## 🔥 **Helping Commands**

| Command                       | Action                    |
| ----------------------------- | ------------------------- |
| `(Get-Command node.exe).Path` | get current node exe path |

## 🏗️ **Architecture Overview**

A modular NestJS API on Fastify, built around a few in-house libraries; each ships its own README with usage and examples:

- **🧩 Zod Integration** — `ZodDto`, `ZodValidationPipe`, custom validators, OpenAPI from schemas · [`src/libs/zod`](src/libs/zod/README.md)
- **🌐 HTTP Client** — Fetch-based client with NestJS module integration and typed errors · [`src/libs/http`](src/libs/http/README.md)
- **🔐 Security Decorators** — `createSecurityGuard()`, `@ApiKey()`, `@AllowAnonymous()` · [`src/libs/decorators`](src/libs/decorators/README.md)

Feature modules live under `src/app/modules/<name>/` (flat layout); configuration is read only in `src/app/config/`.

## 🧱 **Creating Modules**

Start from the canonical scaffolds in [`.vscode/__templates__/`](.vscode/__templates__/) (controller, service, module, DTO, guard, …) instead of writing boilerplate by hand. The step-by-step procedure and copy-paste recipes live in the docs below.

## 📚 **Documentation**

Conventions, patterns, and worked examples live in the docs — start with whichever fits:

| Topic                                               | Where                                              |
| --------------------------------------------------- | -------------------------------------------------- |
| Project contract (stack, rules, conventions)        | [`AGENTS.md`](AGENTS.md)                           |
| Architecture, coding standards, copy-paste patterns | [`.github/instructions/`](.github/instructions/)   |
| Reusable skills & the OpenSpec spec-driven workflow | [`.ai/`](.ai/README.md)                            |
| Task playbooks (module / endpoint / docs / testing) | [`.ai/prompts/`](.ai/prompts/)                     |
| Canonical code scaffolds for new files              | [`.vscode/__templates__/`](.vscode/__templates__/) |
| High-quality examples already in this repo          | [`exemplars.md`](exemplars.md)                     |
| Library usage (Zod · HTTP · Decorators)             | [`src/libs/`](src/libs/)                           |

## 🧰 Configuring fnm (Fast Node Manager)

fnm (Fast Node Manager) is a lightweight Node.js version manager used by this template to run multiple Node versions easily.

- Install fnm following the official instructions: https://github.com/Schniz/fnm
- On Windows, fnm stores the default Node alias file at:
  `C:\Users\{username}\AppData\Roaming\fnm\aliases\default`

Important: Add `C:\Users\{username}\AppData\Roaming\fnm\aliases\default` to your Windows System PATH so Node MCP servers can find the fnm-managed Node; then restart your terminals.
