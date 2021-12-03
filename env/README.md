## 1. Requirements

#### 1.1. Dependencies

-   Install **env-cmd** library with `npm i -D env-cmd`.

#### 1.2. NPM Scripts

For load desired environment, add you npm script like **`env-cmd -e <env>,<mode> -r env/exec/loader.js [--verbose] <your-command>`**.

-   **mode**: (build|debug|test) execution mode global variables.
-   **env**: (dev|qa|prod) environment variables.

_For example: `env-cmd -e dev,debug -r env/exec/loader.js npm run start`_

## 2. Structure

#### 2.1. Non secrets (appsettings.json)

Your `appsettings.json` could contains an structure like below:

```json
{
    // (optional) base default variables
    "default": {
        ...
    },
    // (optional) execution modes
    "mode": {
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
        }
    },
    // (optional) execution environments
    "env": {
        "dev": {
            ...
        },
        ...
    },
}
```

_This file contains every global environment variables files a.k.a. execution modes._

#### 2.2. Environments

Your `env/secrets` folder would contains files below:

-   **dev.env.json**: development environment.
-   **dev.local.env.json**: local development environment (takes precedence).
-   **qa.env.json**: quality assurance environment.
-   **qa.local.env.json**: local qa environment (takes precedence).
-   **prod.env.json**: production environment.
-   **prod.local.env.json**: local production environment (takes precedence).

_This folder should contains environment variables files for system environments._

## 3. Nested Keys

You can organize your keys in nested objects like:

```json
{
    // .dev.env.json
    "GROUP1": {
        "VAR": "anyValue1",
        ...
    },
    "GROUP2": {
        "VAR": "anyValue2",
        "SUBGROUP1": {
            "VAR": "anyValue1",
            ...
        },
        ...
    },
    "VAR3": "anyValue3",
    ...
}
```

So, in your application you can use the variables as shown below:

```javascript
const myVar1 = process.env.GROUP1_VAR;
const myVar2 = process.env.GROUP2_VAR;
const myVar2 = process.env.GROUP2_SUBGROUP1_VAR;
const myVar3 = process.env.VAR3;
```

## 4. Priority

Variables loading priority.

### From lowest to highest.

-   `appsettings.json` -> default
-   `appsettings.json` -> dev|qa|prod
-   `(dev|qa|prod).env.json`
-   `appsettings.json` -> debug|build|test
-   `(dev|qa|prod).local.env.json` (takes precedence over previous)
