import { Effect, Layer, Logger } from "effect"
import { BunHttpServer, BunRuntime } from "@effect/platform-bun"
import { HttpRouter, HttpServer, HttpServerResponse } from "@effect/platform"
import { UserHandler } from "./handler/UserHandler.js"
import { UserService } from "./service/UserService.js"
import { UserRepository } from "./repository/UserRepository.js"
import { DatabaseLive } from "./config/Database.js"

// ============================================================
// Application Router
// ============================================================

const AppRouter = HttpRouter.empty.pipe(
  // Health check endpoint
  HttpRouter.get("/health", HttpServerResponse.json({ status: "ok" })),
  // Mount user routes
  HttpRouter.mount("/", UserHandler)
)

// ============================================================
// HTTP Server Configuration
// ============================================================

const PORT = 8080

const ServerLive = BunHttpServer.layer({ port: PORT })

// ============================================================
// Logger Configuration (UTC timestamps)
// ============================================================

const UtcLogger = Logger.prettyLogger({
  formatDate: (date) => date.toISOString(),
})

// ============================================================
// Application Layer Composition
// ============================================================

// Layer dependency graph (using Effect.Service pattern):
// UserHandler
//   └── UserService.Default
//         └── UserRepository.Default
//               └── Database (PostgreSQL with connection pool)

const AppLive = UserService.Default.pipe(
  Layer.provide(UserRepository.Default),
  Layer.provide(DatabaseLive)
)

// ============================================================
// Bootstrap
// ============================================================

const HttpLive = AppRouter.pipe(
  HttpServer.serve(),
  HttpServer.withLogAddress,
  Layer.provide(ServerLive),
  Layer.provide(AppLive)
)

console.log("🚀 Effect-ts CRUD Server starting...")
console.log(`📍 Server running at http://localhost:${PORT}`)
console.log("📚 Available endpoints:")
console.log("   GET    /health          - Health check")
console.log("   GET    /users           - Get all users")
console.log("   GET    /users/:id       - Get user by ID")
console.log("   POST   /users           - Create new user")
console.log("   PUT    /users/:id       - Update user")
console.log("   DELETE /users/:id       - Delete user")
console.log("")

// Run with custom UTC logger, disable BunRuntime's default pretty logger
const program = Layer.launch(HttpLive).pipe(
  Effect.provide(Logger.replace(Logger.defaultLogger, UtcLogger))
)

BunRuntime.runMain(program, { disablePrettyLogger: true })
