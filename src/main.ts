import { Layer } from "effect"
import { BunHttpServer, BunRuntime } from "@effect/platform-bun"
import { HttpApiBuilder } from "@effect/platform"
import { ApiLive, DocsLive } from "./handler/index.js"
import { AuthService } from "./service/AuthService.js"
import { UserService } from "./service/UserService.js"
import { UserRepository } from "./repository/UserRepository.js"
import { DatabaseLive } from "./config/Database.js"
import { TracingLive } from "./config/Telemetry.js"
import { LoggerLive, currentLogLevel } from "./config/Logger.js"

// ============================================================
// HTTP Server Configuration
// ============================================================

const PORT = 8080

const ServerLive = BunHttpServer.layer({ port: PORT })

// ============================================================
// Application Layer Composition
// ============================================================

// Layer dependency graph (using Effect.Service pattern):
// ApiLive (handler/index.ts)
//   ├── HealthHandler
//   ├── AuthHandler → AuthService
//   └── UserHandler → UserService → UserRepository → Database
//                   → AuthService (for token verification)

const ServicesLive = Layer.mergeAll(
  AuthService.Default,
  UserService.Default.pipe(Layer.provide(UserRepository.Default))
).pipe(
  Layer.provide(UserRepository.Default),
  Layer.provide(DatabaseLive)
)

// ============================================================
// Bootstrap
// ============================================================

const HttpLive = HttpApiBuilder.serve().pipe(
  Layer.provide(DocsLive),
  Layer.provide(ApiLive),
  Layer.provide(ServicesLive),
  Layer.provide(ServerLive),
  Layer.provide(TracingLive),
  Layer.provide(LoggerLive)
)

console.log("🚀 Effect-ts CRUD Server starting...")
console.log(`📍 Server running at http://localhost:${PORT}`)
console.log(`📊 Log level: ${currentLogLevel.label}`)
console.log("🔭 Jaeger UI at http://localhost:16686")
console.log("📖 Swagger UI at http://localhost:8080/docs")
console.log("📚 Available endpoints:")
console.log("   GET    /health          - Health check")
console.log("   GET    /ready           - Readiness check")
console.log("   POST   /auth/register   - Register new user")
console.log("   POST   /auth/login      - Login and get token")
console.log("   GET    /auth/me         - Get current user (requires auth)")
console.log("   GET    /users           - Get all users (requires auth)")
console.log("   GET    /users/:id       - Get user by ID (requires auth)")
console.log("   PUT    /users/:id       - Update user (requires auth)")
console.log("   DELETE /users/:id       - Delete user (requires auth)")
console.log("")

// Run with LoggerLive configuration, disable BunRuntime's default pretty logger
const program = Layer.launch(HttpLive)

BunRuntime.runMain(program, { disablePrettyLogger: true })
