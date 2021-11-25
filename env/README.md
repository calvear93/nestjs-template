## 1. Requirements

#### 1.1. Dependencies

-   Install **env-cmd** library with `npm i -D env-cmd`.

#### 1.2. NPM Scripts

For load desired environment, add you npm script like **`env-cmd -e <env>,<mode> -r env/exec/loader.js [--verbose] <your-command>`**.

-   **mode**: (build|debug|test) execution mode global variables.
-   **env**: (dev|qa|prod) environment variables.

_For example: `env-cmd -e dev,debug -r env/exec/loader.js npm run start`_

## 2. Structure

#### 2.1. Modes (global.env.json)

Your `global.env.json` should contains structure below:

```json
{
    // base default variables
    "default": {
        ...
    },
    // on build
    "build": {
        ...
    },
    // on local debugging execution
    "debug": {
        ...
    },
    // on testing execution
    "test": {
        ...
    }
}

_This file contains every global environment variables files a.k.a. execution modes._

#### 2.2. Environments (environment/env)

Your `env` folder would contains files below:

-   **.dev.env.json**: development environment.
-   **.dev.local.env.json**: local development environment. Replaces non local.
-   **.qa.env.json**: quality assurance environment.
-   **.qa.local.env.json**: local qa environment. Replaces non local.
-   **.prod.env.json**: production environment.
-   **.prod.local.env.json**: local production environment. Replaces non local.

_This folder should contains environment variables files for system environments._

## 4. Priority

Loading variables priority.

### From lowest to highest.

-   `global.env.json` -> default
-   `(dev|qa|prod).env.json`
-   `global.env.json` -> debug|build|test
-   `(dev|qa|prod).local.env.json` (replaces all previous vars)
```
