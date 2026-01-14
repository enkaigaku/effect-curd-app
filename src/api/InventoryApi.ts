import { HttpApiEndpoint, HttpApiGroup, HttpApiSchema, OpenApi } from "@effect/platform";
import { Schema } from "effect";
import { FilmAvailability } from "../schema/Inventory.js";
import { StoreWithAddress } from "../schema/Store.js";

// ============================================================
// Inventory API Error Schemas
// ============================================================

export class StoreNotFoundError extends Schema.TaggedError<StoreNotFoundError>()(
  "StoreNotFoundError",
  { message: Schema.String, storeId: Schema.Number },
  HttpApiSchema.annotations({ status: 404 })
) {}

export class InventoryError extends Schema.TaggedError<InventoryError>()(
  "InventoryError",
  { message: Schema.String },
  HttpApiSchema.annotations({ status: 500 })
) {}

// ============================================================
// Inventory API Definition
// ============================================================

export class InventoryApi extends HttpApiGroup.make("inventory")
  .add(
    HttpApiEndpoint.get("stores", "/stores")
      .addSuccess(Schema.Array(StoreWithAddress))
      .addError(InventoryError)
      .annotate(OpenApi.Summary, "List all stores")
      .annotate(OpenApi.Description, "Get a list of all rental stores with address information.")
  )
  .add(
    HttpApiEndpoint.get("storeById", "/stores/:storeId")
      .addSuccess(StoreWithAddress)
      .addError(StoreNotFoundError)
      .addError(InventoryError)
      .setPath(Schema.Struct({ storeId: Schema.NumberFromString }))
      .annotate(OpenApi.Summary, "Get store details")
      .annotate(OpenApi.Description, "Get detailed information about a specific store.")
  )
  .add(
    HttpApiEndpoint.get("filmAvailability", "/films/:filmId/availability")
      .addSuccess(Schema.Array(FilmAvailability))
      .addError(InventoryError)
      .setPath(Schema.Struct({ filmId: Schema.NumberFromString }))
      .annotate(OpenApi.Summary, "Check film availability")
      .annotate(OpenApi.Description, "Check availability of a film across all stores.")
  )
  .add(
    HttpApiEndpoint.get("filmAvailabilityAtStore", "/stores/:storeId/films/:filmId/availability")
      .addSuccess(FilmAvailability)
      .addError(StoreNotFoundError)
      .addError(InventoryError)
      .setPath(Schema.Struct({ 
        storeId: Schema.NumberFromString,
        filmId: Schema.NumberFromString 
      }))
      .annotate(OpenApi.Summary, "Check film availability at store")
      .annotate(OpenApi.Description, "Check availability of a specific film at a specific store.")
  ) {}
