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
| `yarn lint` | Run ESLint |
| `yarn test` | Run unit tests |
| `yarn test:e2e` | Run end-to-end tests |

---

# 📚 API Documentation

Once the application is running, Swagger documentation is available at:

```
http://localhost:3000/docs
```

---

# 👤 Author

Built as part of the **Filmporte Backend Engineering Assessment**.

---

## 📄 License

This project is provided for assessment purposes.