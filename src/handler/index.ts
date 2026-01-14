import { HttpApiBuilder, HttpApiSwagger } from "@effect/platform"
import { Layer } from "effect"
import { Api } from "../api/index.js"
import { HealthHandler } from "./health.js"
import { AuthHandler } from "./AuthHandler.js"
import { UserHandler } from "./UserHandler.js"
import { FilmHandler } from "./FilmHandler.js"
import { InventoryHandler } from "./InventoryHandler.js"
import { RentalHandler } from "./RentalHandler.js"
import { PaymentHandler } from "./PaymentHandler.js"
import { CustomerAuthHandler } from "./CustomerAuthHandler.js"
import { StaffAuthHandler } from "./StaffAuthHandler.js"

// ============================================================
// API Implementation Layer
// ============================================================

export const ApiLive = HttpApiBuilder.api(Api).pipe(
  Layer.provide(HealthHandler),
  Layer.provide(AuthHandler),
  Layer.provide(UserHandler),
  Layer.provide(FilmHandler),
  Layer.provide(InventoryHandler),
  Layer.provide(RentalHandler),
  Layer.provide(PaymentHandler),
  Layer.provide(CustomerAuthHandler),
  Layer.provide(StaffAuthHandler),
)

// ============================================================
// OpenAPI Swagger UI
// ============================================================

export const DocsLive = HttpApiSwagger.layer({ path: "/docs" })
