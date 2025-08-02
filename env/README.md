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

Install the **env** library:

```bash
npm i -D @calvear/env
```

### 1.2. NPM Scripts

To load the desired environment, use the following format in your scripts:

```bash
env -e <env> -m <mode>[ <mode2>] : <your-command>
```

- **env**: dev | qa | prod
- **mode**: build | debug | test (you can use multiple)

Example:

```bash
env -e dev -m debug : npm start
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

- `dev.env.json`, `qa.env.json`, `prod.env.json`: secret variables per environment.
- `dev.local.env.json`, `qa.local.env.json`, `prod.local.env.json`: local variables (highest priority).

---

## 3. Schema

The `settings/schema.json` file defines the structure and validation for environment files. It uses the JSON Schema v4 standard.

- When you add a new variable, use `env:schema` for update the schema.
- To ignore a variable, remove it from the schema.
- Variables can be retrieved from Azure Key Vault if configured.

---

## 4. Load Priority

From lowest to highest:

1. `appsettings.json` (default)
2. `appsettings.json` (dev|qa|prod)
3. `appsettings.json` (debug|build|test)
4. `<env>.env.json`
5. `<env>.local.env.json` (highest priority)

---

## 5. Usage Example & Best Practices

### 5.1. Nested Variables

You can organize variables in nested objects. The default delimiter is `_`.

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
const dbHost = process.env.DATABASE_HOST;
const apiKey = process.env.API_KEY;
```

### 5.2. Tips

- Keep sensitive variables only in `.env.json` files and never in version control.
- Use local files for machine-specific variables.
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
| `--nestingDelimiter`    | `-nd`            | string  | `__`                         | Delimiter for nested keys (e.g. `l1__l2`)                         |
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
- For advanced usage, refer to the official documentation or run `env -h` for all available options.
- Most options have sensible defaults; override them only for custom workflows or advanced scenarios.
- Logging and masking options are useful for CI/CD and security-sensitive environments.
- Schema options (`resolve`, `nullable`, `detectFormat`, etc.) help maintain strict validation and documentation.

---
