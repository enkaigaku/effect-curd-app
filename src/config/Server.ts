import { Effect, Layer } from "effect";
import { BunHttpServer } from "@effect/platform-bun";
import { ServerConfig } from "./AppConfig.js";

// ============================================================
// HTTP Server Configuration (uses Effect Config)
// ============================================================

export const ServerLive = Layer.unwrapEffect(
  Effect.gen(function* () {
    const config = yield* ServerConfig;
    return BunHttpServer.layer({ port: config.port });
  })
);

