import { Effect, Ref, Clock, Schedule, Duration, Layer } from "effect";
import {
  HttpApiBuilder,
  HttpMiddleware,
  HttpServerRequest,
  HttpServerResponse,
} from "@effect/platform";

// ============================================================
// Rate Limiter Configuration
// ============================================================

const WINDOW_MS = parseInt(process.env["RATE_LIMIT_WINDOW_MS"] ?? "60000", 10); // 1 minute
const MAX_REQUESTS = parseInt(process.env["RATE_LIMIT_MAX_REQUESTS"] ?? "100", 10); // 100 requests per minute

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// ============================================================
// Rate Limiter Middleware Builder
// ============================================================

export const makeRateLimiterMiddleware = Effect.gen(function* () {
  // Shared state for storing request counts per IP
  const state = yield* Ref.make(new Map<string, RateLimitEntry>());

  // Background cleanup task to remove expired entries
  yield* Effect.gen(function* () {
    const now = yield* Clock.currentTimeMillis;
    yield* Ref.update(state, (map) => {
      const newMap = new Map(map);
      for (const [ip, entry] of newMap.entries()) {
        if (now > entry.resetTime) {
          newMap.delete(ip);
        }
      }
      return newMap;
    });
  }).pipe(
    Effect.repeat(Schedule.spaced(Duration.millis(WINDOW_MS))),
    Effect.forkDaemon,
  );

  return HttpMiddleware.make((app) =>
    Effect.gen(function* () {
      const request = yield* HttpServerRequest.HttpServerRequest;
      // @ts-expect-error - source type definition might be incomplete
      const ip = request.source.remoteAddress ?? "unknown";
      const now = yield* Clock.currentTimeMillis;

      const isAllowed = yield* Ref.modify(state, (map) => {
        const newMap = new Map(map);
        const entry = newMap.get(ip);

        if (!entry || now > entry.resetTime) {
          newMap.set(ip, { count: 1, resetTime: now + WINDOW_MS });
          return [true, newMap] as const;
        }

        if (entry.count >= MAX_REQUESTS) {
          return [false, newMap] as const;
        }

        newMap.set(ip, { ...entry, count: entry.count + 1 });
        return [true, newMap] as const;
      });

      if (!isAllowed) {
        return yield* HttpServerResponse.json(
          { error: "Too Many Requests" },
          {
            status: 429,
            headers: { "Retry-After": String(Math.ceil(WINDOW_MS / 1000)) },
          },
        );
      }

      return yield* app;
    }),
  );
});

// ============================================================
// Rate Limiter Layer
// ============================================================

export const RateLimiterLive = Layer.unwrapEffect(
  Effect.gen(function* () {
    const middleware = yield* makeRateLimiterMiddleware;
    const mw = yield* HttpApiBuilder.Middleware;
    yield* mw.add(middleware);
    return Layer.empty;
  }),
);

// Export config for logging
export const rateLimitConfig = {
  windowMs: WINDOW_MS,
  maxRequests: MAX_REQUESTS,
};
