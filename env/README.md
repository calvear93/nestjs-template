# Environment variables (`env/`)

This folder defines the API's environment variables for each environment (`dev`, `release`).
[`@calvear/env`](https://github.com/calvear93/env) (the `env` command) gathers them from several
sources, validates them against a schema and injects them into `process.env` before running the
command after `:`.

```bash
pnpm start:dev       # the API with the dev configuration (and its secrets)
pnpm test:dev        # the tests with the dev configuration
pnpm build           # the production build (environment-independent)
```

## 1. Files

| File                     | Committed | Written by   | Purpose                                              |
| ------------------------ | --------- | ------------ | ---------------------------------------------------- |
| `appsettings.json`       | Yes       | The team     | Non-secret variables, per environment and per mode   |
| `settings/settings.json` | Yes       | The team     | `env` configuration: nesting delimiter, log masks, … |
| `settings/schema.json`   | Yes       | `env schema` | Validation schema of the variables                   |
| `<env>.env.json`         | No        | You          | Secrets of the environment                           |
| `<env>.local.env.json`   | No        | You          | Your personal values; they win over everything else  |

`env/.gitignore` only lets `appsettings.json`, `settings/` and this README through: secrets and
personal files are never committed. In VS Code, `<env>.env.json` and `<env>.local.env.json` get
autocompletion from `settings/schema.json` (`.vscode/schemas/`).

## 2. Environments and modes

`env -e <environment> -m <mode> [<mode>…] : <command>`

| Environment | Use                              |
| ----------- | -------------------------------- |
| `dev`       | Development                      |
| `release`   | The configuration of the release |

| Mode    | Use                                     |
| ------- | --------------------------------------- |
| `build` | Production build and its execution      |
| `debug` | Local execution with reload (`start:*`) |
| `test`  | Tests (`test:*`)                        |

**The environment is inferred from the script name:** `pnpm start:dev` loads `dev` without `-e`,
because `env` takes the last segment after `:`. A suffix that is not a defined environment (a typo
like `start:dve`) aborts the command. Scripts whose suffix is not an environment pass `-e`
(`preview`, `test:mutation`, `env:schema`), and so does any call outside a pnpm script.

`build` declares no environment on purpose: it loads only `|DEFAULT|` and `|MODE|.build`, and the
environment's values are injected when it is deployed.

## 3. Where each variable comes from

The sources are merged in this order; each one wins over the previous ones:

1. `package-json`: `NAME`, `VERSION`, `ENV`… from `package.json`.
2. `app-settings`, from `appsettings.json`:
    1. `|DEFAULT|`: shared values;
    2. `|ENV|.<environment>`;
    3. `|MODE|.<mode>`, in `-m` order;
    4. `appsettings.<environment>.json` and `appsettings.<mode>.json`, if they exist;
    5. `|LOCAL|.<environment>` and `appsettings.<environment>.local.json`, skipped in CI.
3. `secrets`: `<environment>.env.json`.
4. `local`: `<environment>.local.env.json`, skipped in CI.

The resulting variables are written into the child process environment, so they also win over the
ones already in your shell.

```json
{
	"$schema": "../node_modules/@calvear/env/schemas/env.schema.json",
	"|DEFAULT|": {
		"APP_NAME": "[[NAME]]",
		"SWAGGER_UI": true,
		"SECURITY": { "ENABLED": false, "HEADER_NAME": "x-api-key" }
	},
	"|MODE|": {
		"debug": {
			"NODE_ENV": "development",
			"PORT": 4004,
			"SECURITY": { "API_KEY": "debug" }
		}
	}
}
```

- **Nested keys:** flattened with `_` (`nestingDelimiter`), so `SECURITY.API_KEY` arrives as
  `process.env.SECURITY_API_KEY`.
- **Interpolation:** `[[KEY]]` reads another variable (`expand`); `[[NAME]]` comes from
  `package.json`.
- **Arrays add up:** a higher layer does not replace an array, it is appended to the one below.
- **Skipped keys:** a key starting with `#` is not loaded, so it serves as a note.
- **No comments:** these are strict JSON files; a `//` breaks them.
- **Everything is text:** `true` arrives as `'true'` and `4004` as `'4004'`.

## 4. Secrets

Secrets go in `<environment>.env.json` (for example a real `SECURITY.API_KEY`), never in
`appsettings.json`. There is no remote store: the file lives only on each machine (and in the
deployment's secret settings), so it is shared through a secure channel. A missing file simply loads
nothing.

## 5. Validation

`settings/schema.json` has one section per provider. With `schemaValidate` on, the variables are
validated against it before the command runs. `pnpm env:schema` rebuilds it from what `dev` loads in
`build` mode and merges the changes with the existing schema.

## 6. Using them in the code

- **`process.env` only at the edges:** it is read in the bootstrap and configuration code
  (`src/main.ts`, `src/app/app.ts`, the API key guard); services receive values through dependency
  injection.
- **Types:** `src/env.d.ts` declares the variables. They are all `string`; numbers and booleans are
  converted when read (`+process.env.PORT`, `process.env.SWAGGER_UI === 'true'`).
- **Logs:** with `--log debug` (`start:dev`) every resolved variable is printed; those matching
  `logMaskValuesOfKeys` in `settings.json` (keys, passwords, connection strings) show as `*****`.

## 7. Reference

| Script                        | Command                                        |
| ----------------------------- | ---------------------------------------------- |
| `start:dev` / `start:release` | `env -m debug : vite-node --watch src/main.ts` |
| `build`                       | `env -m build : vite build`                    |
| `preview`                     | `env -e dev -m build : node dist/main`         |
| `test:dev` / `test:release`   | `env -m test : vitest`                         |
| `test:mutation`               | `env -e dev -m test : stryker run`             |
| `env:schema`                  | `env schema -e dev -m build`                   |

`start:dev` adds `--log debug`. Every `env` option is described in the
[`@calvear/env` README](https://github.com/calvear93/env#readme).
