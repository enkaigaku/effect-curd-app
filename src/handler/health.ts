import { HttpRouter, HttpServerResponse } from "@effect/platform"

// ============================================================
// Health Check Handler
// ============================================================

export const HealthHandler = HttpRouter.empty.pipe(
  HttpRouter.get(
    "/health",
    HttpServerResponse.json({ status: "ok" })
  ),

  HttpRouter.get(
    "/ready",
    HttpServerResponse.json({ status: "ready" })
  )
)
