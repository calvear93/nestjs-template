# Environment Variables Configuration Guide

## Table of Contents

1. [Requirements](#requirements)
2. [File Structure](#file-structure)
3. [Schema](#schema)
4. [Load Priority](#load-priority)
5. [Usage Example](#usage-example)
6. [CLI Options](#cli-options)

---

## 1. Requirements

### 1.1. Dependencies

This template uses the **env** CLI from `@calvear/env`.

If you're starting from this template, it's already included in `devDependencies`.
If you need to add it to a different project, install it with pnpm:

```bash
pnpm add -D @calvear/env
```

### 1.2. Scripts

To load the desired environment, use the following format in your scripts:

```bash
env -e <env> -m <mode>[ <mode2>] : <your-command>
```

- **env**: project-defined environment name (this template ships with `dev` and `release`)
- **mode**: `build` | `debug` | `test` (you can use multiple)

Example:

```bash
env -e dev -m debug : vite
```

---

## 2. File Structure

### 2.1. Non-secret Variables (`appsettings.json`)

Recommended structure:

```json
{
	// base default variables
	"|DEFAULT|": {
		...
	},
	// execution modes
	"|MODE|": {
		// on build
		"build": {
			...
		},
		// on local debugging
		"debug": {
			...
		},
		// on testing
		"test": {
			...
		},
		// any custom mode
		...
	},
	// execution variables per environment
	"|ENV|": {
		"<env-name>": {
			...
		},
		...
	},
	// (optional) local execution variables per environment
	"|LOCAL|": {
		"<env-name>": {
			...
		},
		...
	}
}
```

### 2.2. Secret and Local Variables

- `<env>.env.json`: secret variables per environment (recommended to keep out of version control).
- `<env>.local.env.json`: local overrides (highest priority).

This repository includes `dev.local.env.json` as an example. Create `release.env.json`, `release.local.env.json`, etc. as needed.

---

## 3. Schema

The `env/settings/schema.json` file defines the structure and validation rules for environment variables.

- Generate/update it with `pnpm env:schema`.
- Keep it committed so everyone validates the same contract in CI and local development.
- If you intentionally stop using a variable, remove it from the schema.

---

## 4. Load Priority

From lowest to highest:

1. `appsettings.json` (default)
2. `appsettings.json` (<env>)
3. `appsettings.json` (debug|build|test)
4. `<env>.env.json`
5. `<env>.local.env.json` (highest priority)

---

## 5. Usage Example & Best Practices

### 5.1. Nested Variables

You can organize variables in nested objects. The default delimiter in this template is `_` (see `env/settings/settings.json`).

Example file:

```json
{
	"DATABASE": {
		"HOST": "localhost",
		"PORT": 5432
	},
	"API": {
		"KEY": "my-api-key"
	}
}
```

Access in code:

```js
// Prefer reading env vars at the application boundary (bootstrap/config providers)
// and inject them into services/controllers.
const dbHost = process.env.DATABASE_HOST;
const apiKey = process.env.API_KEY;
```

### 5.2. Tips

- Keep sensitive variables only in `.env.json` files and never in version control.
- Use local files for machine-specific variables.
- Avoid using `process.env` directly inside services/controllers; read once and inject via providers.
- Update the schema to keep validation and documentation up to date.

---

## 6. CLI Options

The `env` command supports a wide range of options to customize environment loading and management:

| Option                  | Alias            | Type    | Default                      | Description                                                       |
| ----------------------- | ---------------- | ------- | ---------------------------- | ----------------------------------------------------------------- |
| `--env`                 | `-e`             | string  |                              | Selects the environment to load (`dev`, `qa`, `prod`, etc.)       |
| `--mode`                | `-m`             | array   |                              | Sets the execution mode(s) (`build`, `debug`, `test`, etc.)       |
| `--configFile`          | `-c`             | string  | `env/settings/settings.json` | Path to a custom config file                                      |
| `--schemaFile`          | `-s`, `--schema` | string  | `env/settings/schema.json`   | Path to the environment schema file                               |
| `--packageJson`         | `--pkg`          | string  |                              | Path to a custom `package.json`                                   |
| `--root`                |                  | string  | `env`                        | Default environment folder path                                   |
| `--local`               | `-l`             | boolean |                              | Forces loading of local variables for the selected environment    |
| `--ci`                  | `--ci`           | boolean | auto-detect                  | Enables CI mode (continuous integration)                          |
| `--nestingDelimiter`    | `-nd`            | string  | `_`                          | Delimiter for nested keys (e.g. `l1_l2`)                          |
| `--arrayDescomposition` | `--arrDesc`      | boolean | `false`                      | Whether to serialize or break down arrays                         |
| `--expand`              | `-x`             | boolean | `false`                      | Interpolates environment variables using themselves               |
| `--resolve`             | `-r`             | string  | `merge`                      | Schema update mode: `merge` or `override`                         |
| `--nullable`            | `--null`         | boolean | `true`                       | Whether variables are nullable in schema                          |
| `--detectFormat`        | `-df`            | boolean | `true`                       | Whether to include string format in schema                        |
| `--logLevel`            | `--log`          | string  | `info`                       | Logging level: `silly`, `trace`, `debug`, `info`, `warn`, `error` |
| `--logMaskAnyRegEx`     | `--mrx`          | array   | `[]`                         | (Advanced) Mask values matching regex in logs                     |
| `--logMaskValuesOfKeys` | `--mvk`          | array   | `[]`                         | (Advanced) Mask values of specific keys in logs                   |
| `--exportIgnoreKeys`    | `--iek`          | array   | `[]`                         | (Advanced) Ignore specific keys when exporting                    |
| `--help`                | `-h`             |         |                              | Shows help information for the CLI                                |
| `--version`             | `-v`             |         |                              | Displays the current version of the CLI                           |

### Usage Notes

- You can combine options as needed. The command after the colon (`:`) will run with the loaded environment variables.
- In this template, `nestingDelimiter` defaults to `_`.
- For advanced usage, refer to the official documentation or run `env -h` for all available options.
- Most options have sensible defaults; override them only for custom workflows or advanced scenarios.
- Logging and masking options are useful for CI/CD and security-sensitive environments.
- Schema options (`resolve`, `nullable`, `detectFormat`, etc.) help maintain strict validation and documentation.

---
