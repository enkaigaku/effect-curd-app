import { BunHttpServer } from "@effect/platform-bun"

// ============================================================
// HTTP Server Configuration
// ============================================================

export const PORT = 8080

export const ServerLive = BunHttpServer.layer({ port: PORT })
