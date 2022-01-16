<h2 align="center"><b>NestJS Skeleton</b></h2>

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

<p align="center">
  A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.
</p>

<p align="center">
  <a href="https://github.com/calvear93/nestjs-template" target="_blank">
    <img src="https://img.shields.io/github/license/calvear93/nestjs-template" alt="Package License" />
  </a>
</p>

## ✒ **Description**

Nest is a framework for building efficient, scalable <a href="http://nodejs.org" target="_blank">Node.js</a> server-side applications. It uses modern JavaScript, is built with <a href="http://www.typescriptlang.org" target="_blank">TypeScript</a> and under the hood, Nest makes use of <a href="https://expressjs.com/" target="_blank">Express</a>.

### Easy API REST building in NestJS.

Main feature are:

-   `eslint` with `prettier`
-   `babel` for post-build optimizations
-   Environment variables handler using `env-cmd`
-   `swagger` ready
-   `postgresql` with `typeorm`
-   `docker` ready

## ⛩ **Structure**

```bash
├── README.md
├── CHANGELOG.md
├── LICENSE.md
├── .vscode/
├── env/
│   ├── exec/
│   │   ├── env.schema.json # env vars schema
│   │   └── loader.js # environment variables loader for env-cmd
│   ├── secrets/ # will contains dev.env.json, qa.env.json, etc.
│   └── appsettings.json # non secret environment variables
├── src/
│   ├── shared/ # common utils, guards, decorators, etc.
│   ├── config/
│   ├── database/
│   │   ├── common/
│   │   ├── migrations/
│   │   ├── schema/ # database entities
│   │   └── default.database.config.ts # default database connection config
│   ├── modules/ # app modules
│   │   ├── health/ # health/liveness module
│   │   ├── sample/
│   │   │   ├── controllers/
│   │   │   ├── services/
│   │   │   └── sample.module.ts
│   │   ├── sample-orm/
│   │   │   ├── controllers/
│   │   │   ├── services/
│   │   │   └── sample-orm.module.ts
│   │   └── sample-worker/
│   │       ├── controllers/
│   │       ├── services/
│   │       ├── providers/
│   │       ├── utils/
│   │       └── sample-worker.module.ts
│   ├── env.d.ts # .env environment types definition
│   ├── main.module.ts
│   └── main.ts
├── .eslintrc.json
├── Dockerfile
├── tsconfig.json
├── tsconfig.build.json
└── package.json
```

## 📥 **Getting Started**

-   Replace globally these terms:

    -   `<base-path>` api base path, i.e. access (for get /api/access/v*/*)
    -   `<app-name>` app name, i.e. access-api
    -   `<project-name>` project name, i.e. my-project
    -   `<project-title>` project title, i.e. My Project
    -   `<project-description>` project description, i.e. API for manage user data

-   Configure your database config for dev environment.

    -   Configure your `dev.env.json` file in `env/secrets` folder as:

    ```json
    {
        "DEFAULT_DB_HOST": "db-host",
        "DEFAULT_DB_DATABASE": "db_name",
        "DEFAULT_DB_USERNAME": "db_user",
        "DEFAULT_DB_PASSWORD": "db_password",
        "DEFAULT_DB_ORM_RUN_MIGRATIONS": true,
        "DEFAULT_DB_ORM_LOGGING": true
    }
    ```

    -   Configure your `dev.local.env.json` file in `env/secrets` folder as:

    ```json
    {
        "DEFAULT_DB_HOST": "local-db-host",
        "DEFAULT_DB_DATABASE": "db_name_local",
        "DEFAULT_DB_USERNAME": "db_user_local",
        "DEFAULT_DB_PASSWORD": "db_password_local",
        "DEFAULT_DB_ORM_CACHE": false,
        "DEFAULT_DB_ORM_SYNCHRONIZE": false
    }
    ```

-   Install [NodeJS](https://nodejs.org/es/) for your machine.
-   Execute `npm install` command. (`npm i --force` in case of conflicts).
-   Create your `.dev.env.json` file in your [`env/secrets` folder](env/README.md).
-   Execute the app with `npm run start:dev`.

## 📋 **Branches and Environments**

Project has 3 environments (infrastructure) base for project building.

-   **dev (development)**: environment with breaking changes and new features.
-   **qa (quality assurance)**: environment for testing and quality assurance.
-   **prod (production)**: productive environment.

## 🧪 **Executing**

Project uses **npm scripts** for eases execution, testing and building.
Many of these script run on a defined environment, specified after ':', and
it environment may be 'dev', 'qa' or 'prod'.

| Command                      | Action                       |
| ---------------------------- | ---------------------------- |
| npm run start:`<env>`        | executes the app             |
| npm run build:`<env>`        | build the app                |
| npm run orm:`<env>` -- <cmd> | executes ORM commands        |
| npm run test:`<env>`         | executes tests               |
| npm run test:coverage        | executes tests with coverage |
| npm run test:inspect         | testing debug                |
| npm run lint                 | code format review           |
| npm run lint:fix             | code format review/fix       |

## ⚙️ **Commands**

### **1. [TypeORM](https://typeorm.io/#/using-cli)**

| Command                                                                 | Action                                        |
| ----------------------------------------------------------------------- | --------------------------------------------- |
| npm run orm:`<env>` -- migration:create -n `<migrationName>`            | creates a blank migration file                |
| npm run orm:`<env>` -- migration:generate -n `<migrationName>` --pretty | generates a new migration from schema changes |
| npm run orm:`<env>` -- migration:run                                    | synchronizes migrations with database         |
| npm run orm:`<env>` -- migration:revert                                 | reverts last migration applied to database    |
| npm run orm:`<env>` -- migration:show                                   | show migrations                               |
| npm run orm:`<env>` -- migration:sync                                   | applies schema to database without migrations |
| npm run orm:`<env>` -- migration:drop                                   | drops database schema                         |
| npm run orm:`<env>` -- entity:create -n `<EntityName>`                  | create a new entity                           |
| npm run orm:`<env>` -- entity:subscriber -n `<SubscriberName>`          | create a new subscriber                       |

[!] You must clear dist folder in order to avoid to execute unwanted
migrations when you use start command (e.g. start:dev).
Set "deleteOutDir" true in `nest-cli.json`.
[!] You must use default relative path (using dots) on database entities.

### **2. Docker**

| Command                                                                                                 | Action       |
| ------------------------------------------------------------------------------------------------------- | ------------ |
| docker build --build-arg ENV=`<env>` --tag `<image_name>` `<build-context>`                             | docker build |
| docker run -d -it -p `<expose_port>`:`<container_app_port>`/tcp --name `<instance_name>` `<image_name>` | docker exec  |

### **3. Node Tools**

| Command                      | Action                    |
| ---------------------------- | ------------------------- |
| npm install -g npm@latest    | npm update                |
| npm update --save/--save-dev | soft updated for packages |
| npx npm-check-updates -u     | hard update for packages  |

### **4. Git Helpful Commands**

| Command                                   | Action                             |
| ----------------------------------------- | ---------------------------------- |
| git config core.ignorecase false          | case-sensitive enable              |
| git rebase -i `<commit-hash>` --autostash | rebase history                     |
| git push --force                          | force push your rebase             |
| git checkout `<branch>`                   | select branch                      |
| git fetch `<remote>` `<branch>`           | retrieves branch remote changes    |
| git reset --hard `<remote>`/`<branch>`    | resets your branch to remote state |
| git gc --prune=now --aggressive           | repository maintenance command     |
| git clean -fd                             | remove untracked empty folders     |

### **5. Git Subtree**

| Command                                                                  | Action              |
| ------------------------------------------------------------------------ | ------------------- |
| git remote add -f `<remote-name>` `<branch>`                             | adds a remote       |
| git subtree add --prefix `<path>` `<remote-name>` `<branch>` [--squash]  | attaches a subtree  |
| git fetch `<remote-name>` `<branch>`                                     | fetches a remote    |
| git subtree pull --prefix `<path>` `<remote-name>` `<branch>` [--squash] | pulls from subtree  |
| git subtree push --prefix `<path>` `<remote-name>` `<branch>` [--squash] | push subtree change |

## 🧿 **Linting**

Project use linters, for code formatting and code styling normalizing.

-   **[eslint](https://eslint.org/)**: tool for identifying and reporting on patterns found in ECMAScript/JavaScript code
-   **[prettier](https://prettier.io/)**: opinionated code formatter

For correct interpretation of linters, is recommended to use [Visual Studio Code](https://code.visualstudio.com/)
as IDE and install the plugins in .vscode folder at 'extensions.json', as well as use the config provided in 'settings.json'

## 🛠️ **Troubleshooting**

-   **I want to debug my code with breakpoints**:

    You can debug in Visual Studio Code, using the `launch.json` profile in .vscode, pressing F5 or in Run and Debug sidebar option.

-   **`<cmd>` is not recognized as an internal or external command, operable program or batch file.**:

    In Windows, sometimes appear this message, because some node module isn't installed for your system version.
    In example, if you execute `npm i` in WSL, and execute `npm run start:dev` in Powershell, you get the error
    for `env-cmd` is not recognized.
    So, you should execute `npm i` in Powershell terminal for solve that.

-   **I've some errors with migrations, my migrations or model doesn't get updated**:

    You can remove your `dist` folder or enable `"deleteOutDir": true` in the file `nest-cli.json` for debug, 'cause hot-reload has some problems sometimes.

-   **API doesn't works! locally gives me a 404 not found**:

    Sometimes (specially on WSL) system ports get dirty, so you should change
    your debug port or restart your computer.

-   **I can't see my console logs for my unit tests**:

    You can set "verbose": false in jest.config.json for show your console logs.

-   **When pushing to remote subtree, you get the error below**:

```bash
To https://any.domain.com/repo/_git/project
! [rejected]        420a15d0c81da609f217d7a22f5581656dc3e9cf -> anyBranch (non-fast-forward)
error: failed to push some refs to 'https://any.domain.com/repo/_git/project'
hint: Updates were rejected because a pushed branch tip is behind its remote
hint: counterpart. Check out this branch and integrate the remote changes
hint: (e.g. 'git pull ...') before pushing again.
hint: See the 'Note about fast-forwards' in 'git push --help' for details.
```

use commands below:

| Command                                                                            | Action                          |
| ---------------------------------------------------------------------------------- | ------------------------------- |
| git subtree split --prefix `<path>` --onto=`<subtree-remote-name>`/`<branch>`      | splits a subtree for force push |
| git push `<subtree-remote-name>` `<hash-returned-previous-cmd>`:`<branch>` --force | force push                      |

## 🧮 **Built with**

-   [Express](https://expressjs.com/es/) - NodeJS HTTP framework
-   [NestJS](https://nestjs.com/) - NodeJS framework
-   [TypeORM](https://typeorm.io/) - TypeScript ORM
-   [Threads.JS](https://threads.js.org/) - Worker Threads made easy
-   [env-cmd](https://github.com/toddbluhm/env-cmd) - NodeJS app's environment utility

## 🔦 **Useful packages**

-   [linq-to-typescript](https://github.com/arogozine/LinqToTypeScript) - LINQ for TypeScript
-   [nanoid](https://github.com/ai/nanoid) - Tiny unique string ID generator
-   [uuid](https://github.com/uuidjs/uuid) - UUID generator
-   [class-validator](https://github.com/typestack/class-validator) - Decorator based property validation
-   [class-transformer](https://github.com/typestack/class-transformer) - TypeScript object parser
-   [typescript-string-operations](https://github.com/iwt-svenulrich/typescript-string-operations#readme)
-   [Luxon](https://moment.github.io/luxon/) - Datetime complete library

---

⌨ by Alvear Candia, Cristopher Alejandro <calvear93@gmail.com>
