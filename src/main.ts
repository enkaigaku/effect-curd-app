import { Effect, Layer } from "effect";
import { BunRuntime } from "@effect/platform-bun";
import { HttpApiBuilder } from "@effect/platform";
import { ApiLive, DocsLive } from "./handler/index.js";
import { ServerLive } from "./config/Server.js";
import { CorsLive, allowedOrigins } from "./config/Cors.js";
import { RateLimiterLive } from "./config/RateLimiter.js";
import { ServicesLive } from "./config/Services.js";
import { TracingLive } from "./config/Telemetry.js";
import { LoggerLive } from "./config/Logger.js";
import { ServerConfig, LogConfig, RateLimiterConfig } from "./config/AppConfig.js";

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
);

// Print startup info (reads from Effect Config)
const printStartupInfo = Effect.gen(function* () {
  const server = yield* ServerConfig;
  const log = yield* LogConfig;
  const rateLimit = yield* RateLimiterConfig;
  
  console.log("🚀 DVD Rental API starting...");
  console.log(`📍 Server: http://localhost:${server.port}`);
  console.log(`📖 Swagger: http://localhost:${server.port}/docs`);
  console.log(`📊 Log level: ${log.level}`);
  console.log(`🌐 CORS: ${allowedOrigins.join(", ")}`);
  console.log(`🛡️  Rate limit: ${rateLimit.maxRequests} req/${rateLimit.windowMs / 1000}s`);
  console.log("🔭 Jaeger: http://localhost:16686");
  console.log("");
  console.log("📚 Endpoints:");
  console.log("   Health:     GET  /health, /ready");
  console.log("   Films:      GET  /films, /films/:id, /films/:id/actors, /films/:id/availability");
  console.log("   Categories: GET  /categories");
  console.log("   Stores:     GET  /stores, /stores/:id, /stores/:storeId/films/:filmId/availability");
  console.log("   Rentals:    POST /rentals, PUT /rentals/:id/return, GET /customers/:id/rentals");
  console.log("   Payments:   POST /payments, GET /payments/:id, /customers/:id/payments, /customers/:id/balance");
  console.log("   Customer:   POST /customer/login, /customer/register, GET /customer/profile/:id");
  console.log("   Staff:      POST /staff/login, GET /staff, /staff/profile/:id");
  console.log("");
});

// Run startup info effect synchronously
Effect.runSync(printStartupInfo);

// Run with LoggerLive configuration, disable BunRuntime's default pretty logger
const app = Layer.launch(HttpLive);

BunRuntime.runMain(app, { disablePrettyLogger: true });

