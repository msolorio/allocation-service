# Allocation Service

[![Build Status - GitHub Actions][gha-badge]][gha-ci]
[![Node.js version][nodejs-badge]][nodejs]
[![TypeScript version][ts-badge]][typescript-5-4]

Backend API for allocating customer orders to batches of stock in a warehouse. 📦

## Stack
- Node.js
- TypeScript
- Express.js
- Prisma ORM
- Jest
- Docker
- Github Actions

---

## Architecture

The application uses the [dependency inversion principle](https://en.wikipedia.org/wiki/Dependency_inversion_principle) to inject I/O, making the application easier and faster to test.

The service layer depends on an abstraction. For testing, it is passed a fake implementation of I/O. We can test the application "edge-to-edge" with fast, in-memory unit tests.

![in-memory-implementation](README_assets/in-memory-implementation.png)

---

For real-world, the service layer is passed real I/O that talks to a database. We've already exhaustively tested the service layer in-memory, so fewer e2e and integration tests are needed.

![e2e-implementation](README_assets/e2e-implementation.png)

---

### Setup
Install docker and then run

```sh
git clone git@github.com:msolorio/allocation-service.git
cd allocation-service
make build
make up
make test
```

## Make Scripts

- `make build` - Build docker container
- `make up` - Start app and TypeScript in watch mode
- `make down` - Remove containers
- `make logs` - Show container logs
- `make test` - Run tests
- `make run <command>` - Run a command in the container
