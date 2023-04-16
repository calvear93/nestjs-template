<h2 align="center"><b>NestJS Skeleton</b></h2>
<h3 align="center"><b>API REST</b></h3>

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

## ⛩ **Structure**

```bash
├── env/
│   ├── appsettings.json
│   ├── dev.env.json # secret file, autogen
│   └── release.env.json # secret file, autogen
├── src/
│   ├── __tests__/
│   ├── app/
│   │   ├── main.module.ts
│   │   ├── config/
│   │   └── modules/
│   │       ├── health/
│   │       └── sample/
│   │           ├── controllers/
│   │           ├── services/
│   │           └── sample.module.ts
│   ├── libs/
│   ├── main.ts # entry file
│   └── env.d.ts
├── Dockerfile
├── tsconfig.json
└── package.json
```

## 📥 **Getting Started**

-   Replace globally these terms:

    -   `(((base-path)))` api base path, i.e. sample (for get /api/sample/v*/*)
    -   `(((app-name)))` app name, i.e. sample-api
    -   `(((app-title)))` app title, i.e. Sample API
    -   `(((project-name)))` project name, i.e. my-project
    -   `(((project-description)))` project description, i.e. API for manage user data

-   Install [NodeJS](https://nodejs.org/es/).
-   Install [PNPM](https://pnpm.io/installation)
-   Execute `pnpm install` command.
-   Execute `pnpm env:schema` command.
-   Run either `pnpm start:dev` or `pnpm test:dev` commands.

## 📋 **Branches and Environments**

Project has 2 environments (infrastructure) base for project building.

-   **dev (development)**: environment with breaking changes and new features.
-   **release (production)**: release environment.

## 🧪 **Executing**

Project uses **npm scripts** for eases execution, testing and building.
Many of these script run on a defined environment, specified after ':', and
it environment may be 'dev' or 'release'.

| Command                      | Action                       |
| ---------------------------- | ---------------------------- |
| pnpm start:`<env>`           | executes the app             |
| pnpm build:`<env>`           | build the app                |
| pnpm test:`<env>`            | executes tests               |
| pnpm test:`<env>` --coverage | executes tests with coverage |
| pnpm env:schema              | updates env JSON schema      |
| pnpm format                  | code format                  |
| pnpm lint                    | code style review            |
| pnpm lint -- -- --fix        | code style review/fix        |
