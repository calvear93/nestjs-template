# NESTJS BOILERPLATE

This is a boilerplate for NodeJS using the framework [NestJS](https://nestjs.com/).

## Structure 💡

```bash
├── README.md
├── CHANGELOG.md
├── LICENCE.md
├── .vscode/ # visual code ideal settings
├── environment/ # environment variables handler
│   ├── base/ # build, debug and test mode vars
│   ├── env/
│   │   └── default.env.json # default environment variables
│   └── loader.js # loader for npm scripts
├── src/
│   ├── common/ # common utils, guards, decorators, etc.
│   ├── config/ # base app config
│   ├── database/
│   │   ├── common/ # base entities
│   │   ├── migrations/
│   │   ├── schema/ # database entities
│   │   └── default.database.config.ts # default database connection config
│   ├── modules/ # app modules
│   │   ├── sample/ # sample module
│   │   │   ├── controllers/ # module HTTP controllers
│   │   │   ├── services/ # services and repositories
│   │   │   ├── sample.module.ts
│   │   │   └── index.ts
│   │   └── sample-orm/ # sample ORM module
│   │       ├── controllers/
│   │       ├── services/
│   │       ├── sample-orm.module.ts
│   │       └── index.ts
│   ├── environment.d.ts # .env environment type definition
│   ├── main.module.ts
│   └── main.js
├── .eslintrc.json # eslint config and rules
├── Dockerfile # node alpine docker builder for nestjs
├── tsconfig.js # typescript transpilation config
├── tsconfig.build.js # config for build
└── package.json
```

## Branches and Environments 📋

Project has 3 environments (infrastructure) base for project building.

-   **development**: environment with breaking changes and new features.
-   **qa**: environment for testing and quality assurance.
-   **production**: productive environment.

Also, pipeline has automated deployments depending of branch updated.

-   **feature/\***: new features/requirements, it doesn't deploys to any environment.
-   **prerelease/\***: accumulates new features for current sprint development, it deploys to 'development' environment.
-   **release/\***: has features of last release, it deploys to 'qa' environment.
-   **main**: releases tested and certified from 'qa' environment, it deploys to 'production' environment.
-   **hotfix/\***: specific fixes from main, it deploys to 'development' environment.

## Executing ⚙️

Project uses **npm scripts** for eases execution, testing and building.
Many of these script run on a defined environment, specified after ':', and
it environment may be 'development', 'qa' or 'production'.

| Command                    | Action                  |
| -------------------------- | ----------------------- |
| npm run start:<env>        | executes the app        |
| npm run build:<env>        | build the app           |
| npm run orm:<env> -- <cmd> | executes ORM commands   |
| npm run test:<env>         | executes tests          |
| npm run test:coverage      | testing coverage report |
| npm run test:inspect       | testing debug           |
| npm run lint:analyze       | code format review      |
| npm run lint:fix           | code format review/fix  |

## Commands ⚙️

### [TypeORM](https://typeorm.io/#/using-cli)

| Command                                                             | Action                                        |
| ------------------------------------------------------------------- | --------------------------------------------- |
| npm run orm:<env> -- migration:create -n <migrationName>            | creates a blank migration file                |
| npm run orm:<env> -- migration:generate -n <migrationName> --pretty | generates a new migration from schema changes |
| npm run orm:<env> -- migration:run                                  | synchronizes migrations with database         |
| npm run orm:<env> -- migration:revert                               | reverts last migration applied to database    |
| npm run orm:<env> -- migration:show                                 | show migrations                               |
| npm run orm:<env> -- migration:sync                                 | applies schema to database without migrations |
| npm run orm:<env> -- migration:drop                                 | drops database schema                         |
| npm run orm:<env> -- entity:create -n <EntityName>                  | create a new entity                           |
| npm run orm:<env> -- entity:subscriber -n <SubscriberName>          | create a new subscriber                       |

[!] You must clear dist folder in order to avoid to execute unwanted
migrations when you use start command (e.g. start:dev).
Set "deleteOutDir" true in `nest-cli.json`.
[!] You must use default relative path (using dots) on database entities.

### Docker

| Command                                                                       | Action       |
| ----------------------------------------------------------------------------- | ------------ |
| docker build --build-arg ENV=<env> --tag <image_name> .                       | docker build |
| docker run -d -it -p <expose_port>:80/tcp --name <instance_name> <image_name> | docker exec  |

### Node Tools

| Command                      | Action                    |
| ---------------------------- | ------------------------- |
| npm install -g npm@latest    | npm update                |
| npm update --save/--save-dev | soft updated for packages |
| npx npm-check-updates -u     | hard update for packages  |

### Git Helpful Commands

| Command                                 | Action                             |
| --------------------------------------- | ---------------------------------- |
| git config core.ignorecase false        | case-sensitive enable              |
| git rebase -i <commit-hash> --autostash | rebase history                     |
| git push --force                        | force push your rebase             |
| git checkout <branch>                   | select branch                      |
| git fetch origin <branch>               | retrieves branch remote changes    |
| git reset --hard origin/<branch>        | resets your branch to remote state |

## Linting 🧿

Project uses two linters, for code formatting and code styling normalizing.

-   **eslint**: TypeScript linter with Airbnb React base config and some other additions.

For correct interpretation of linters, is recommended to use [Visual Studio Code](https://code.visualstudio.com/) as IDE and install the plugins in .vscode folder at 'extensions.json', as well as use the config provided in 'settings.json'

## Deployment 📦

Use included Azure Pipeline for CI/CD - edit [azure-pipeline.yml](azure-pipeline.yml) file for custom projects variables.

Branches environments are defined as:

-   **main**: production
-   **release/\***: qa
-   **prerelease/\***: development
-   **hotfix/\***: development
-   **feature/\***: none

## Built with 🛠️

-   [Express](https://expressjs.com/es/) - NodeJS HTTP framework.
-   [NestJS](https://nestjs.com/) - NodeJS framework.
-   [TypeORM](https://typeorm.io/) - TypeScript ORM.
-   [Threads.JS](https://threads.js.org/) - Worker Threads made easy.
-   [env-cmd](https://github.com/toddbluhm/env-cmd) - NodeJS app's environment utility.

## Useful packages 🗂

-   [linq-to-typescript](https://github.com/arogozine/LinqToTypeScript) - LINQ for TypeScript.
-   [nanoid](https://github.com/ai/nanoid) - Tiny unique string ID generator.
-   [uuid](https://github.com/uuidjs/uuid) - UUID generator.
-   [class-validator](https://github.com/typestack/class-validator) - Decorator based property validation.
-   [class-transformer](https://github.com/typestack/class-transformer) - TypeScript object parser.

---

⌨ by Alvear Candia, Cristopher Alejandro <calvear93@gmail.com>
