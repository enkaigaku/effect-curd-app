# Effect-ts CRUD Application

A layered backend CRUD application built with Effect-ts, PostgreSQL, and Bun runtime.

## Features

- **Effect-ts** - Functional programming with powerful error handling and dependency injection
- **HttpApi + OpenAPI** - Auto-generated Swagger documentation at `/docs`
- **JWT Authentication** - Secure API endpoints with Bearer tokens
- **PostgreSQL** - Type-safe SQL queries with `@effect/sql`
- **Rate Limiting** - Configurable request throttling per IP
- **CORS** - Cross-origin resource sharing support
- **OpenTelemetry** - Distributed tracing with Jaeger integration
- **Database Migrations** - Version-controlled schema changes

## Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | Bun |
| Framework | Effect-ts, @effect/platform |
| Database | PostgreSQL, @effect/sql |
| Auth | JWT (jose), bcrypt |
| Docs | OpenAPI 3.1, Swagger UI |
| Tracing | OpenTelemetry, Jaeger |

## Project Structure

```
src/
├── api/           # API endpoint definitions (HttpApiEndpoint)
├── config/        # Configuration layers (Server, CORS, RateLimiter, etc.)
├── handler/       # Route handlers (HttpApiBuilder.group)
├── middleware/    # Auth middleware
├── migrations/    # Database migration SQL files
├── repository/    # Data access layer
├── schema/        # Effect schemas (User, Auth)
├── scripts/       # Migration runner
├── service/       # Business logic (UserService, AuthService)
└── main.ts        # Application entry point
```

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) >= 1.0
- [Docker](https://www.docker.com/) (for PostgreSQL & Jaeger)

### Installation

```bash
# Install dependencies
bun install

# Copy environment variables
cp .env.example .env

# Start PostgreSQL & Jaeger
bun run db:up

# Run database migrations
bun run migrate

# Start development server
bun run dev
```

### Available Scripts

| Script | Description |
|--------|-------------|
| `bun run dev` | Start development server with hot reload |
| `bun run build` | Build for production |
| `bun run start` | Run production build |
| `bun run check` | TypeScript type checking |
| `bun run migrate` | Run database migrations |
| `bun run db:up` | Start Docker containers |
| `bun run db:down` | Stop Docker containers |

## API Endpoints

### Public Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/ready` | Readiness check |
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login and get token |
| GET | `/auth/me` | Get current user info |

### Protected Routes (require Bearer token)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users` | List all users (paginated) |
| GET | `/users/:id` | Get user by ID |
| PUT | `/users/:id` | Update user |
| DELETE | `/users/:id` | Delete user |

## Environment Variables

```bash
# Server
PORT=8080

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=effect_crud
DB_USER=postgres
DB_PASSWORD=postgres

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1h

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
```

## Documentation

- **Swagger UI**: http://localhost:8080/docs
- **Jaeger UI**: http://localhost:16686

## License

MIT
