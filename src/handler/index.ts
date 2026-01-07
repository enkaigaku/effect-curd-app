import { HttpRouter } from "@effect/platform"
import { HealthHandler } from "./health.js"
import { AuthHandler } from "./AuthHandler.js"
import { UserHandler } from "./UserHandler.js"

// ============================================================
// Application Router - Central Registration
// ============================================================
// Add new handlers here as the application grows:
//   HttpRouter.mount("/products", ProductHandler),
//   HttpRouter.mount("/orders", OrderHandler),
// ============================================================

export const AppRouter = HttpRouter.empty.pipe(
  // Health & readiness checks (no prefix)
  HttpRouter.mount("/", HealthHandler),

  // Auth routes (public)
  HttpRouter.mount("/", AuthHandler),

  // API routes
  HttpRouter.mount("/", UserHandler),
)
