import { Layer } from "effect";
import { BunRuntime } from "@effect/platform-bun";
import { HttpApiBuilder } from "@effect/platform";
import { ApiLive, DocsLive } from "./handler/index.js";
import { ServerLive, PORT } from "./config/Server.js";
import { CorsLive, allowedOrigins } from "./config/Cors.js";
import { RateLimiterLive, rateLimitConfig } from "./config/RateLimiter.js";
import { ServicesLive } from "./config/Services.js";
import { TracingLive } from "./config/Telemetry.js";
import { LoggerLive, currentLogLevel } from "./config/Logger.js";

// ============================================================
// Bootstrap
// ============================================================

const HttpLive = HttpApiBuilder.serve().pipe(
  Layer.provide(CorsLive),
  Layer.provide(RateLimiterLive),
  Layer.provide(DocsLive),
  Layer.provide(ApiLive),
  Layer.provide(ServicesLive),
  Layer.provide(ServerLive),
  Layer.provide(TracingLive),
  Layer.provide(LoggerLive),
  Layer.provide(HttpApiBuilder.Middleware.layer),
);

console.log("🚀 Effect-ts CRUD Server starting...");
console.log(`📍 Server running at http://localhost:${PORT}`);
console.log(`📊 Log level: ${currentLogLevel.label}`);
console.log(`🌐 CORS enabled for: ${allowedOrigins.join(", ")}`);
console.log(`🛡️  Rate limit: ${rateLimitConfig.maxRequests} req/${rateLimitConfig.windowMs / 1000}s`);
console.log("🔭 Jaeger UI at http://localhost:16686");
console.log(`📖 Swagger UI at http://localhost:${PORT}/docs`);
console.log("📚 Available endpoints:");
console.log("   GET    /health          - Health check");
console.log("   GET    /ready           - Readiness check");
console.log("   POST   /auth/register   - Register new user");
console.log("   POST   /auth/login      - Login and get token");
console.log("   GET    /auth/me         - Get current user (requires auth)");
console.log("   GET    /users           - Get all users (requires auth)");
console.log("   GET    /users/:id       - Get user by ID (requires auth)");
console.log("   PUT    /users/:id       - Update user (requires auth)");
console.log("   DELETE /users/:id       - Delete user (requires auth)");
console.log("");

// Run with LoggerLive configuration, disable BunRuntime's default pretty logger
const app = Layer.launch(HttpLive);

BunRuntime.runMain(app, { disablePrettyLogger: true });
