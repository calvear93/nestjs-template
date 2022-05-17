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
-   `swagger` ready
-   `docker` ready

## ⛩ **Structure**

```bash
├── README.md
├── env/
│   └── appsettings.json # non secret environment variables
├── src/
│   ├── app/
│   │   ├── main.module.ts
│   │   ├── config/
│   │   └── modules/ # app modules
│   │       ├── health/ # health/liveness module
│   │       ├── sample/
│   │       │   ├── controllers/
│   │       │   ├── services/
│   │       │   └── sample.module.ts
│   │       └── sample-worker/
│   │           ├── controllers/
│   │           ├── services/
│   │           ├── providers/
│   │           ├── utils/
│   │           └── sample-worker.module.ts
│   ├── tests/ # e2e tests
│   ├── libs/
│   │  ├── decorators/
│   │  └── utils/
│   ├── main.ts # app setup
│   └── env.d.ts # environment variables declaration
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

-   Set up your `dev.local.env.json` with:

```json
{
    "API_PREFIX": "api/local"
}
```

-   Install [NodeJS](https://nodejs.org/es/) for your machine.
-   Execute `npm install` command. (`npm i --force` in case of conflicts).
-   Create your `.dev.env.json` file in your [`env/secrets` folder](env/README.md).
-   Execute the app with `npm run start:dev` or `npm run test:dev`.

## 📋 **Branches and Environments**

Project has 3 environments (infrastructure) base for project building.

-   **dev (development)**: environment with breaking changes and new features.
-   **qa (quality assurance)**: environment for testing and quality assurance.
-   **prod (production)**: productive environment.

## 🧪 **Executing**

Project uses **npm scripts** for eases execution, testing and building.
Many of these script run on a defined environment, specified after ':', and
it environment may be 'dev', 'qa' or 'prod'.

| Command               | Action                       |
| --------------------- | ---------------------------- |
| npm run start:`<env>` | executes the app             |
| npm run build:`<env>` | build the app                |
| npm run test:`<env>`  | executes tests               |
| npm run test:coverage | executes tests with coverage |
| npm run test:inspect  | testing debug                |
| npm run env:schema    | updates env JSON schema      |
| npm run lint          | code format review           |
| npm run lint:fix      | code format review/fix       |

## ⚙️ **Commands**

### **1. Docker**

| Command                                                                                                 | Action       |
| ------------------------------------------------------------------------------------------------------- | ------------ |
| docker build --build-arg ENV=`<env>` --tag `<image_name>` `<build-context>`                             | docker build |
| docker run -d -it -p `<expose_port>`:`<container_app_port>`/tcp --name `<instance_name>` `<image_name>` | docker exec  |

### **2. Node Tools**

| Command                      | Action                    |
| ---------------------------- | ------------------------- |
| npm install -g npm@latest    | npm update                |
| npm update --save/--save-dev | soft updated for packages |
| npx npm-check-updates -u     | hard update for packages  |

### **3. Git Helpful Commands**

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

### **4. Git Subtree**

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
