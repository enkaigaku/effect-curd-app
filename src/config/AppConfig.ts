import { Config, Effect, Redacted } from "effect";

// ============================================================
// Application Configuration using Effect Config
// ============================================================

/**
 * All application configuration in one place using Effect's Config module.
 * This provides type-safe, composable configuration with proper error handling.
 */

// ------------------------------------------------------------
// Server Configuration
// ------------------------------------------------------------

export const ServerConfig = Config.all({
  port: Config.integer("PORT").pipe(Config.withDefault(8080)),
});

// ------------------------------------------------------------
// JWT Configuration
// ------------------------------------------------------------

export const JwtConfig = Config.all({
  /** JWT secret - should be set in production */
  secret: Config.redacted("JWT_SECRET").pipe(
    Config.withDefault(Redacted.make("default-jwt-secret-change-in-production"))
  ),
});

// ------------------------------------------------------------
// Logging Configuration
// ------------------------------------------------------------

export const LogConfig = Config.all({
  level: Config.string("LOG_LEVEL").pipe(
    Config.withDefault("info")
  ),
});

// ------------------------------------------------------------
// Telemetry Configuration
// ------------------------------------------------------------

export const TelemetryConfig = Config.all({
  endpoint: Config.string("OTEL_EXPORTER_OTLP_ENDPOINT").pipe(
    Config.withDefault("http://localhost:4318")
  ),
});

// ------------------------------------------------------------
// Rate Limiter Configuration
// ------------------------------------------------------------

export const RateLimiterConfig = Config.all({
  windowMs: Config.integer("RATE_LIMIT_WINDOW_MS").pipe(
    Config.withDefault(60000) // 1 minute
  ),
  maxRequests: Config.integer("RATE_LIMIT_MAX_REQUESTS").pipe(
    Config.withDefault(100) // 100 requests per minute
  ),
});

// ------------------------------------------------------------
// Combined Application Configuration
// ------------------------------------------------------------

export const AppConfig = Config.all({
  server: ServerConfig,
  jwt: JwtConfig,
  log: LogConfig,
  telemetry: TelemetryConfig,
  rateLimiter: RateLimiterConfig,
});

export type AppConfig = Config.Config.Success<typeof AppConfig>;

// ------------------------------------------------------------
// Helper to get JWT secret as TextEncoder bytes (for jose)
// ------------------------------------------------------------

export const getJwtSecretBytes = Effect.gen(function* () {
  const config = yield* JwtConfig;
  const secretValue = Redacted.value(config.secret);
  return new TextEncoder().encode(secretValue);
});

// Create a Layer that provides JWT secret bytes
export class JwtSecretService extends Effect.Service<JwtSecretService>()("JwtSecretService", {
  effect: Effect.gen(function* () {
    const secretBytes = yield* getJwtSecretBytes;
    return { secretBytes };
  }),
}) {}
