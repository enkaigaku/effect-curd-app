import { BunHttpServer } from "@effect/platform-bun"

// ============================================================
// HTTP Server Configuration
// ============================================================

export const PORT = parseInt(process.env["PORT"] ?? "8080", 10)

export const ServerLive = BunHttpServer.layer({ port: PORT })
