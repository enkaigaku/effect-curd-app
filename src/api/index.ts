import { HttpApi, OpenApi } from "@effect/platform"
import { HealthApi } from "./HealthApi.js"
import { AuthApi } from "./AuthApi.js"
import { UserApi } from "./UserApi.js"

// ============================================================
// Combined API Definition
// ============================================================

export const Api = HttpApi.make("Effect CRUD API")
  .add(HealthApi)
  .add(AuthApi)
  .add(UserApi)
  .annotate(OpenApi.Title, "Effect-ts CRUD API")
  .annotate(OpenApi.Version, "1.0.0")
  .annotate(OpenApi.Description, "A layered CRUD application built with Effect-ts, PostgreSQL, and JWT authentication")

// Re-export all API groups
export { HealthApi } from "./HealthApi.js"
export { AuthApi, UnauthorizedError, InvalidCredentialsError, ValidationError, EmailAlreadyExistsError } from "./AuthApi.js"
export { UserApi, UserNotFoundError, DatabaseError } from "./UserApi.js"
