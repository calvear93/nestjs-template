# NESTJS BOILERPLATE

This is a boilerplate for NodeJS using the framework [NestJS](https://nestjs.com/).

## Structure 💡

```bash
├── README.md
├── CHANGELOG.md
├── LICENCE.md
├── .vscode/ # visual code ideal settings
├── src/
│   ├── common/ # common utils, guards, decorators, etc.
│   ├── config/ # base app config
│   ├── database/
│   │   ├── schema/ # default database entities
│   │   └── default.database.config.ts # default database connection config
│   ├── modules/ # app modules
│   │   └── sample/ # sample module
│   │       ├── controllers/ # module HTTP controllers
│   │       ├── services/ # services and repositories
│   │       ├── sample.module.ts
│   │       └── index.ts
│   ├── environment.d.ts
│   ├── main.module.ts
│   └── main.js
├── .env.js # environment variables
├── .eslintrc.json # eslint config and rules
├── Dockerfile # node alpine docker builder for nestjs
├── tsconfig.js # typescript transpilation config
├── tsconfig.build.js # config for build
└── package.json
```

## Branches and Environments 📋

Project has 4 environments base for project building.

-   **debug**: local environment based on development.
-   **development**: environment with breaking changes and new features.
-   **qa**: environment for testing and quality assurance.
-   **production**: productive environment.

Also, pipeline has automated deployments depending of branch updated.

-   **feature/\***: new features/requirements, it doesn't deploys to any environment.
-   **develop**: accumulates new features for current sprint development, it deploys to 'development' environment.
-   **release/\***: has features of last release, it deploys to 'QA' environment.
-   **main**: releases tested and certified from 'QA' environment, it deploys to 'production' environment.
-   **hotfix/\***: specific fixes from main, it deploys to 'development' environment.

## Executing ⚙️

Project uses **npm scripts** for eases execution, testing and building.
Many of these script run on a defined environment, specified after ':', and
it environment may be 'debug', 'development', 'qa' or 'production'.

| Command               | Action                  |
| --------------------- | ----------------------- |
| npm run start:[env]   | executes the app        |
| npm run build:[env]   | build the app           |
| npm run orm:[env]     | executes ORM commands   |
| npm run test:[env]    | executes tests          |
| npm run test:coverage | testing coverage report |
| npm run test:inspect  | testing debug           |
| npm run lint:analyze  | code format review      |
| npm run lint:fix      | code format review/fix  |
| npm run format        | prettier code format    |

## Commands ⚙️

### TypeORM

| Command                                               | Action                                        |
| ----------------------------------------------------- | --------------------------------------------- |
| npm run orm -- migration:create -n [migration_name]   | creates a blank migration file                |
| npm run orm -- migration:generate -n [migration_name] | generates a new migration from schema changes |
| npm run orm -- migration:run                          | syncrhonizes migrations with database         |
| npm run orm -- migration:revert                       | reverts last migration applied to database    |

### Docker

| Command                                                                      | Action       |
| ---------------------------------------------------------------------------- | ------------ |
| docker build --build-arg ENV=[env] --tag [image_name] .                      | docker build |
| docker run -d -it -p [expose_port]:80/tcp --name [instance_name][image_name] | docker exec  |

### Node Tools

| Command                          | Action                    |
| -------------------------------- | ------------------------- |
| npm install -g npm@latest        | npm update                |
| npm update --save/--save-dev     | soft updated for packages |
| npx npm-check-updates -u         | hard update for packages  |
| git config core.ignorecase false | git case-sensitive enable |

## Linting 🧿

Project uses two linters, for code formatting and code styling normalizing.

-   **eslint**: TypeScript linter with Airbnb React base config and some other additions.
-   **prettier**: optional Prettier config.

For correct interpretation of linters, is recommended to use [Visual Studio Code](https://code.visualstudio.com/) as IDE and install the plugins in .vscode folder at 'extensions.json', as well as use the config provided in 'settings.json'

## Deployment 📦

Use included Azure Pipeline for CI/CD - edit [azure-pipeline.yml](azure-pipeline.yml) file for custom projects variables.

Branches environments are defined as:

-   **main**: production
-   **release/\***: qa
-   **develop**: development
-   **hotfix/\***: development
-   **feature/\***: none

## Built with 🛠️

-   [Express](https://expressjs.com/es/) - NodeJS HTTP framework.
-   [NestJS](https://nestjs.com/) - NodeJS framework.
-   [TypeORM](https://typeorm.io/) - TypeScript ORM.
-   [env-cmd](https://github.com/toddbluhm/env-cmd) - NodeJS app's environment utility.

---

⌨ by Alvear Candia, Cristopher Alejandro <caalvearc@achs.cl>
