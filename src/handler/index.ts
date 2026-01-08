import { HttpApiBuilder, HttpApiSwagger } from "@effect/platform"
import { Layer } from "effect"
import { Api } from "../api/index.js"
import { HealthHandler } from "./health.js"
import { AuthHandler } from "./AuthHandler.js"
import { UserHandler } from "./UserHandler.js"

// ============================================================
// API Implementation Layer
// ============================================================

export const ApiLive = HttpApiBuilder.api(Api).pipe(
  Layer.provide(HealthHandler),
  Layer.provide(AuthHandler),
  Layer.provide(UserHandler),
)

// ============================================================
// OpenAPI Swagger UI
// ============================================================

export const DocsLive = HttpApiSwagger.layer({ path: "/docs" })
