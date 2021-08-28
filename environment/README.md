## 1. Requirements

#### 1.1. Dependencies

-   Install **env-cmd** library with `npm i -D env-cmd`.

#### 1.2. NPM Scripts

For load desired environment, add you npm script like **`env-cmd -e <env>,<mode> -r environment/loader.js <your-command>`**.

-   **mode**: (build|debug|test) execution mode global variables.
-   **env**: (dev|qa|prod) environment variables.

_For example: `env-cmd -e dev,debug -r environment/loader.js npm run start`_

## 2. Structure

#### 2.1. Modes (environment/global)

Your `environment/global` folder should contains files below:

-   **default.env.json**: default variables for the rest of environments.
-   **build.env.json**: loaded on build execution.
-   **test.env.json**: loaded on test execution.
-   **debug.env.json**: loaded on local debugging execution.

_This folder contains every global environment variables files a.k.a. environment execution modes._

#### 2.2. Environments (environment/env)

Your `environment/env` folder should contains files below:

-   **dev.env.json**: development environment.
-   **dev.local.env.json**: local development environment. Replaces non local.
-   **qa.env.json**: quality assurance environment.
-   **qa.local.env.json**: local qa environment. Replaces non local.
-   **prod.env.json**: production environment.
-   **prod.local.env.json**: local production environment. Replaces non local.

_This folder should contains environment variables files for system environments._

## 4. Priority

### From lowest to highest.

-   `default.env.json` (default values)
-   `(debug|build|test).env.json`
-   `(dev|qa|prod).env.json`
-   `(dev|qa|prod).local.env.json` (replaces all previous vars)
