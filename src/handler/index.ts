import { HttpRouter } from "@effect/platform"
import { HealthHandler } from "./health.js"
import { AuthHandler } from "./AuthHandler.js"
import { UserHandler } from "./UserHandler.js"
import { AuthMiddleware } from "../middleware/auth.js"

// ============================================================
// Application Router - Central Registration
// ============================================================
// Add new handlers here as the application grows:
//   HttpRouter.mount("/products", ProductHandler),
//   HttpRouter.mount("/orders", OrderHandler),
// ============================================================

// Protected routes - require authentication
const ProtectedRoutes = HttpRouter.empty.pipe(
  HttpRouter.mount("/", UserHandler),
  HttpRouter.use(AuthMiddleware)
)

export const AppRouter = HttpRouter.empty.pipe(
  // Health & readiness checks (public)
  HttpRouter.mount("/", HealthHandler),

  // Auth routes (public)
  HttpRouter.mount("/", AuthHandler),

  // Protected API routes (require authentication)
  HttpRouter.mount("/", ProtectedRoutes),
)
