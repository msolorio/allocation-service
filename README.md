# Allocation Service

[![TypeScript version][ts-badge]][typescript-5-4] [![Node.js version][nodejs-badge]][nodejs] [![Build Status - GitHub Actions][gha-badge]][gha-ci]

Backend API for allocating customer orders to batches of stock in a warehouse.

### Stack
- Node.js
- TypeScript
- PostgreSQL
- Express.js
- Prisma ORM
- Jest
- Docker
- Github Actions

---

### [Dependency Inversion](https://en.wikipedia.org/wiki/Dependency_inversion_principle)

The application creates abstractions around I/O and injects them. The service layer can be passed a fake implementation of I/O, allowing for testing the application "edge-to-edge" with fast, in-memory unit tests.

![in-memory-implementation](README_assets/in-memory-implementation.png)

---

For real-world, the service layer is passed real I/O that talks to a database.

![e2e-implementation](README_assets/e2e-implementation.png)

---

The application uses a few well known patterns, to aid dependency inversion.

**Repository** - an abstraction around data access. Handles syncing between the domain model and the ORM.<br>
**Unit of Work** - an abstraction around transactions and atomicity.<br>
**Service Layer** - the entrypoint for injecting I/O and defines the application's use cases.<br>
**Domain Model** - an object module of the business domain free of dependencies on data access.<br>

**Trade-offs** - Each pattern adds indirection and congintive load for those unfamiliar. Use of each would be considered independently and wouldn't be necessary in a simple application. You could, for example, still use dependency inversion with only a repository and a service layer.

### Setup
Install docker and then run

```sh
git clone git@github.com:msolorio/allocation-service.git
cd allocation-service
make build
make up
make migrate
make test
```

### Make Scripts

- `make build` - Build docker container
- `make up` - Start app and TypeScript in watch mode
- `make down` - Remove containers
- `make logs` - Show container logs
- `make test` - Run tests
- `make migrate` - Run db migrations
- `make run <command>` - Run a command in the container

[ts-badge]: https://img.shields.io/badge/TypeScript-5.4-blue.svg
[typescript-5-4]: https://devblogs.microsoft.com/typescript/announcing-typescript-5-4/
[nodejs-badge]: https://img.shields.io/badge/Node.js-=%2020.16.0-blue.svg
[nodejs]: https://nodejs.org/dist/v20.16/docs/api/
[gha-badge]: https://github.com/jsynowiec/node-typescript-boilerplate/actions/workflows/nodejs.yml/badge.svg
[gha-ci]: https://github.com/jsynowiec/node-typescript-boilerplate/actions/workflows/nodejs.yml