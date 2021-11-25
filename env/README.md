## 1. Requirements

#### 1.1. Dependencies

-   Install **env-cmd** library with `npm i -D env-cmd`.

#### 1.2. NPM Scripts

For load desired environment, add you npm script like **`env-cmd -e <env>,<mode> -r env/exec/loader.js [--verbose] <your-command>`**.

-   **mode**: (build|debug|test) execution mode global variables.
-   **env**: (dev|qa|prod) environment variables.

_For example: `env-cmd -e dev,debug -r env/exec/loader.js npm run start`_

## 2. Structure

#### 2.1. Non secrets (base.env.json)

Your `base.env.json` could contains an structure like below:

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

Your `env` folder would contains files below:

-   **.dev.env.json**: development environment.
-   **.dev.local.env.json**: local development environment (takes precedence).
-   **.qa.env.json**: quality assurance environment.
-   **.qa.local.env.json**: local qa environment (takes precedence).
-   **.prod.env.json**: production environment.
-   **.prod.local.env.json**: local production environment (takes precedence).

_This folder should contains environment variables files for system environments._

## 4. Priority

Variables loading priority.

### From lowest to highest.

-   `base.env.json` -> default
-   `base.env.json` -> dev|qa|prod
-   `(dev|qa|prod).env.json`
-   `base.env.json` -> debug|build|test
-   `(dev|qa|prod).local.env.json` (takes precedence over previous)
