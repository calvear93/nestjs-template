# Environment Variables Configuration Guide

## Table of Contents

1. [Requirements](#requirements)
2. [File Structure](#file-structure)
3. [Schema](#schema)
4. [Load Priority](#load-priority)
5. [Usage Example](#usage-example)

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
