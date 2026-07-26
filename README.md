# 🎬 Filmporte Backend – Movie Ticketing API

A clean, scalable REST API for a simplified movie ticketing platform built with **NestJS**, **TypeScript**, **CQRS**, **TypeORM**, and **PostgreSQL**.

---

## 📌 Features

- 🔐 Role-based authentication (Producer / Viewer)
- 🔑 JWT Authentication
- 🏗️ CQRS architecture for scalability and maintainability
- 🎥 Full movie management for Producers
- 🌍 Public listing of published movies
- 🎟️ Ticket purchasing for Viewers (one ticket per movie)
- 📄 Pagination and filtering
- 📚 Swagger / OpenAPI documentation
- ✅ Global validation, exception handling, and response transformation

---

## 🛠 Tech Stack

- NestJS
- TypeScript
- CQRS (`@nestjs/cqrs`)
- TypeORM
- PostgreSQL
- Passport JWT
- class-validator
- class-transformer
- Swagger (OpenAPI)

---

# 🚀 Getting Started

## Prerequisites

Ensure you have the following installed:

- Node.js 18+
- Yarn
- PostgreSQL 14+

---

## 1. Clone the Repository

```bash
git clone https://github.com/Guruscode/filmporte-backend.git
cd filmporte-backend
```

---

## 2. Install Dependencies

```bash
yarn install
```

---

## 3. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Update the `.env` file with your PostgreSQL credentials.

Example:

```env
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_NAME=filmporte

JWT_SECRET=your-secret-key

DB_SYNCHRONIZE=true
```

---

## 4. Create the Database

```bash
psql -U postgres -c "CREATE DATABASE filmporte;"
```

---

## 5. Run the Application

Development mode:

```bash
yarn dev
```

Production build:

```bash
yarn build
yarn start:prod
```

---

## 🌐 API URLs

| Service | URL |
|----------|-----|
| API | http://localhost:3000/api |
| Swagger Documentation | http://localhost:3000/docs |

---

# 📖 API Overview

## Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/auth/register` | Register as Producer or Viewer | Public |
| POST | `/api/v1/auth/login` | Login | Public |

---

## Movies

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/v1/movies/published` | List published movies | Public |
| GET | `/api/v1/movies/:id` | Get movie details | Public |
| POST | `/api/v1/movies` | Create movie | Producer |
| GET | `/api/v1/movies/my/list` | List my movies | Producer |
| PUT | `/api/v1/movies/:id` | Update my movie | Producer |
| DELETE | `/api/v1/movies/:id` | Delete my movie | Producer |

---

## Purchases

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/v1/purchases` | Purchase a movie ticket | Viewer |
| GET | `/api/v1/purchases/my` | View my purchases | Viewer |
| GET | `/api/v1/purchases/producer` | View purchases for my movies | Producer |

---

# 🏛 Architecture Decisions

This project follows modern backend architecture principles.

### CQRS

Commands and Queries are separated to improve:

- Scalability
- Testability
- Maintainability
- Clear separation of responsibilities

### Modular Architecture

The application is organized into independent modules:

- Authentication
- Movies
- Purchases
- Users
- Common

Each module owns its controllers, services, commands, queries, DTOs, and entities.

### Security

- JWT Authentication
- Role-based Authorization
- Route Guards
- Custom Decorators

### Global Application Features

- Validation Pipes
- Exception Filters
- Response Interceptors
- DTO Validation
- Consistent API Responses

### Database Design

- UUID primary keys
- Proper foreign key relationships
- Unique constraints
- Indexed lookup fields

---

# 📂 Project Structure

```
src/
│
├── auth/
├── users/
├── movies/
├── purchases/
├── common/
├── config/
├── database/
└── main.ts
```

Each module follows the CQRS pattern:

```
movies/
├── commands/
├── queries/
├── handlers/
├── dto/
├── entities/
├── controllers/
└── services/
```

---

# 📌 Assumptions

- A user can only have one role:
  - Producer
  - Viewer

- A Viewer can purchase a particular movie only once.

- This restriction is enforced at the database level.

- `DB_SYNCHRONIZE=true` is intended for development only.

- Production deployments should use database migrations.

- Transaction references are mocked using UUID-based strings.

---

# 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `yarn dev` | Start development server (watch mode) |
| `yarn build` | Build the application |
| `yarn start:prod` | Run the production build |
| `yarn format` | Auto-format code with Prettier |
| `yarn lint` | Run ESLint with auto-fix |
| `yarn test` | Run unit tests |
| `yarn test:watch` | Run tests in watch mode |
| `yarn test:cov` | Run tests with coverage report |
| `yarn test:e2e` | Run end-to-end tests |
| `yarn migration:create` | Create a new empty migration file |
| `yarn migration:generate` | Generate a migration from entity changes |
| `yarn migration:run` | Run pending migrations |
| `yarn migration:revert` | Revert the last migration |

---

# 📚 API Documentation

Once the application is running, Swagger documentation is available at:

```
http://localhost:3000/docs
```

---

# 🗄️ Database Migrations

This project uses **TypeORM migrations** for safe, version-controlled schema changes.

> ⚠️ **Important:** `DB_SYNCHRONIZE=true` is intended for development only.
> In production, set `DB_SYNCHRONIZE=false` and use migrations.

### When to use migrations

Whenever you modify an entity file (add/remove columns, change types, add indexes),
create a migration instead of relying on `synchronize`.

### Workflow

```bash
# 1. Update your entity files (e.g., Movie, User, Purchase)

# 2. Generate a migration from the changes
yarn migration:generate src/database/migrations/YourMigrationName

# 3. Review the generated SQL in the migration file

# 4. Run the migration
yarn migration:run

# 5. (If needed) Revert the last migration
yarn migration:revert
```

### How it works

- `migration:generate` compares your entities against the database and produces
  a migration class with `up()` and `down()` methods.
- `migration:run` executes all pending migrations in order.
- Migrations are stored in `src/database/migrations/`.
- The CLI DataSource is configured in `src/config/typeorm.config.ts`.

### Example

```bash
yarn migration:generate src/database/migrations/AddPosterUrlToMovies
yarn migration:run
```

---

# 🧪 Testing

This project uses **Jest** as the test framework with **ts-jest** for TypeScript support.

There are **49 unit tests** across **16 test suites** covering all handlers and services.

### Test structure

Tests are co-located with their source files in `__tests__` directories:

```
handlers/
├── __tests__/
│   ├── create-movie.handler.spec.ts
│   ├── update-movie.handler.spec.ts
│   ├── delete-movie.handler.spec.ts
│   ├── get-movie-by-id.handler.spec.ts
│   ├── get-my-movies.handler.spec.ts
│   ├── get-published-movies.handler.spec.ts
│   └── purchase-ticket.handler.spec.ts
├── create-movie.handler.ts
└── ...
```

### Running tests

```bash
# Run all tests
yarn test

# Run tests in watch mode (useful during development)
yarn test:watch

# Run tests with coverage report
yarn test:cov

# Run end-to-end tests
yarn test:e2e
```

### Coverage

Coverage reports are generated in the `/coverage` directory. Open `coverage/lcov-report/index.html` in a browser to view the full report.

### Testing approach

- **Unit tests** use mocked repositories (`jest.Mocked<Repository<T>>`) to isolate the handler/service logic.
- **Handlers** are tested by executing commands/queries and asserting the repository interaction and return values.
- **Services** are tested by verifying the correct command/query is dispatched to the CommandBus/QueryBus.
- Edge cases (not found, forbidden, conflicts, empty results, custom pagination) are covered.

---

# 🤖 CI/CD Pipeline

This project uses **GitHub Actions** for continuous integration and deployment.

### Workflow: `.github/workflows/ci.yml`

The pipeline runs on every push and pull request to `staging` and `develop` branches.

### Stages

| Stage | Command | What it does |
|-------|---------|-------------|
| **Install** | `yarn install --frozen-lockfile` | Installs exact dependencies from the lockfile |
| **Lint** | `yarn lint` | Runs ESLint to catch code quality and formatting issues |
| **Type check** | `npx tsc --noEmit` | Verifies TypeScript compiles cleanly (no type errors) |
| **Tests** | `yarn test:cov` | Runs all 49 unit tests and generates a coverage report |
| **Build** | `yarn build` | Compiles the NestJS production build |
| **Coverage artifact** | `actions/upload-artifact` | Saves the coverage report for 7 days |

### Auto-promotion (staging → develop)

When code is pushed to the `staging` branch and all quality checks pass, the pipeline **automatically merges staging into `develop`**. This ensures `develop` always contains a tested, green build.

### Concurrency

If you push multiple commits in quick succession, the workflow **cancels any previous in-progress run** for the same branch, saving CI minutes.

### Visual pipeline summary

```
Push to staging
      │
      ▼
┌─────────────────────┐
│   Quality Checks     │
│  ┌───────────────┐  │
│  │  Install       │  │
│  │  Lint          │  │
│  │  Type check    │  │
│  │  Tests + Cover │  │
│  │  Build         │  │
│  └───────┬───────┘  │
└──────────┼──────────┘
           │
           ▼ (pass)
┌─────────────────────┐
│  Auto-promote       │
│  staging → develop  │
└─────────────────────┘
```

---

# 👤 Author

Built as part of the **Filmporte Backend Engineering Assessment**.

---

## 📄 License

This project is provided for assessment purposes.