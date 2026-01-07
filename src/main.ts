import { Layer } from "effect"
import { BunHttpServer, BunRuntime } from "@effect/platform-bun"
import { HttpRouter, HttpServer, HttpServerResponse } from "@effect/platform"
import { UserHandler } from "./handler/UserHandler.js"
import { UserService } from "./service/UserService.js"
import { UserRepository } from "./repository/UserRepository.js"
import { DatabaseLive } from "./config/Database.js"
import { TracingLive } from "./config/Telemetry.js"
import { LoggerLive, currentLogLevel } from "./config/Logger.js"

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
// Application Layer Composition
// ============================================================

// Layer dependency graph (using Effect.Service pattern):
// UserHandler
//   └── UserService.Default
//         └── UserRepository.Default
//               └── Database (PostgreSQL with connection pool)
//               └── Tracing (OpenTelemetry → Jaeger)

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
  Layer.provide(AppLive),
  Layer.provide(TracingLive),
  Layer.provide(LoggerLive)
)

console.log("🚀 Effect-ts CRUD Server starting...")
console.log(`📍 Server running at http://localhost:${PORT}`)
console.log(`📊 Log level: ${currentLogLevel.label}`)
console.log("🔭 Jaeger UI at http://localhost:16686")
console.log("📚 Available endpoints:")
console.log("   GET    /health          - Health check")
console.log("   GET    /users           - Get all users")
console.log("   GET    /users/:id       - Get user by ID")
console.log("   POST   /users           - Create new user")
console.log("   PUT    /users/:id       - Update user")
console.log("   DELETE /users/:id       - Delete user")
console.log("")

// Run with LoggerLive configuration, disable BunRuntime's default pretty logger
const program = Layer.launch(HttpLive)

BunRuntime.runMain(program, { disablePrettyLogger: true })
