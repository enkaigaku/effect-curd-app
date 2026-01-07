import { Effect, Context } from "effect"
import { HttpMiddleware, HttpServerRequest, HttpServerResponse } from "@effect/platform"
import { AuthService } from "../service/AuthService.js"
import { JwtPayload } from "../schema/Auth.js"

// ============================================================
// Current User Context
// ============================================================

export class CurrentUser extends Context.Tag("CurrentUser")<CurrentUser, JwtPayload>() {}

// ============================================================
// Auth Middleware
// ============================================================

export const AuthMiddleware = HttpMiddleware.make((app) =>
  Effect.gen(function* () {
    const request = yield* HttpServerRequest.HttpServerRequest
    const authService = yield* AuthService

    // Get Authorization header
    const authHeader = request.headers["authorization"]
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return yield* HttpServerResponse.json(
        { error: "Missing or invalid Authorization header" },
        { status: 401 }
      )
    }

    const token = authHeader.slice(7) // Remove "Bearer " prefix

    // Verify token
    const payloadResult = yield* authService.verifyToken(token).pipe(
      Effect.map((payload) => ({ success: true as const, payload })),
      Effect.catchAll((error) => Effect.succeed({ success: false as const, error }))
    )

    if (!payloadResult.success) {
      return yield* HttpServerResponse.json(
        { error: payloadResult.error.message },
        { status: 401 }
      )
    }

    // Provide CurrentUser context and continue to the app
    return yield* app.pipe(
      Effect.provideService(CurrentUser, payloadResult.payload)
    )
  })
)

// ============================================================
// Helper: Get current user from context
// ============================================================

export const getCurrentUser = Effect.flatMap(
  Effect.context<CurrentUser>(),
  (ctx) => Effect.succeed(Context.get(ctx, CurrentUser))
)
