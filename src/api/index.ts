import { HttpApi, OpenApi } from "@effect/platform"
import { HealthApi } from "./HealthApi.js"
import { AuthApi } from "./AuthApi.js"
import { UserApi } from "./UserApi.js"
import { FilmApi } from "./FilmApi.js"
import { InventoryApi } from "./InventoryApi.js"
import { RentalApi } from "./RentalApi.js"

// ============================================================
// Combined API Definition
// ============================================================

export const Api = HttpApi.make("Effect CRUD API")
  .add(HealthApi)
  .add(AuthApi)
  .add(UserApi)
  .add(FilmApi)
  .add(InventoryApi)
  .add(RentalApi)
  .annotate(OpenApi.Title, "DVD Rental API")
  .annotate(OpenApi.Version, "1.0.0")
  .annotate(OpenApi.Description, "A DVD rental service built with Effect-ts, PostgreSQL, and JWT authentication")

// Re-export all API groups
export { HealthApi } from "./HealthApi.js"
export { AuthApi, UnauthorizedError, InvalidCredentialsError, ValidationError, EmailAlreadyExistsError } from "./AuthApi.js"
export { UserApi, UserNotFoundError, DatabaseError } from "./UserApi.js"
export { FilmApi, FilmNotFoundError, DatabaseQueryError } from "./FilmApi.js"
export { InventoryApi, StoreNotFoundError, InventoryError } from "./InventoryApi.js"
export { RentalApi, RentalNotFoundError, CustomerNotFoundError, NoInventoryError, RentalError } from "./RentalApi.js"
