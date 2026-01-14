import { HttpApiEndpoint, HttpApiGroup, HttpApiSchema, OpenApi } from "@effect/platform";
import { Schema } from "effect";
import { RentalDetail, CreateRentalInput, RentalCreated, RentalReturned } from "../schema/Rental.js";
import { CustomerInfo } from "../schema/Customer.js";

// ============================================================
// Rental API Error Schemas
// ============================================================

export class RentalNotFoundError extends Schema.TaggedError<RentalNotFoundError>()(
  "RentalNotFoundError",
  { message: Schema.String, rentalId: Schema.Number },
  HttpApiSchema.annotations({ status: 404 })
) {}

export class CustomerNotFoundError extends Schema.TaggedError<CustomerNotFoundError>()(
  "CustomerNotFoundError",
  { message: Schema.String, customerId: Schema.Number },
  HttpApiSchema.annotations({ status: 404 })
) {}

export class NoInventoryError extends Schema.TaggedError<NoInventoryError>()(
  "NoInventoryError",
  { message: Schema.String, filmId: Schema.Number, storeId: Schema.Number },
  HttpApiSchema.annotations({ status: 409 })
) {}

export class RentalError extends Schema.TaggedError<RentalError>()(
  "RentalError",
  { message: Schema.String },
  HttpApiSchema.annotations({ status: 500 })
) {}

// ============================================================
// Rental API Definition
// ============================================================

export class RentalApi extends HttpApiGroup.make("rentals")
  .add(
    HttpApiEndpoint.post("create", "/rentals")
      .addSuccess(RentalCreated)
      .addError(CustomerNotFoundError)
      .addError(NoInventoryError)
      .addError(RentalError)
      .setPayload(CreateRentalInput)
      .annotate(OpenApi.Summary, "Create a rental")
      .annotate(OpenApi.Description, "Rent a film to a customer. Checks inventory availability and customer status.")
  )
  .add(
    HttpApiEndpoint.put("return", "/rentals/:rentalId/return")
      .addSuccess(RentalReturned)
      .addError(RentalNotFoundError)
      .addError(RentalError)
      .setPath(Schema.Struct({ rentalId: Schema.NumberFromString }))
      .annotate(OpenApi.Summary, "Return a rental")
      .annotate(OpenApi.Description, "Mark a rental as returned. Calculates late fees if applicable.")
  )
  .add(
    HttpApiEndpoint.get("getById", "/rentals/:rentalId")
      .addSuccess(RentalDetail)
      .addError(RentalNotFoundError)
      .setPath(Schema.Struct({ rentalId: Schema.NumberFromString }))
      .annotate(OpenApi.Summary, "Get rental details")
      .annotate(OpenApi.Description, "Get detailed information about a specific rental.")
  )
  .add(
    HttpApiEndpoint.get("customerRentals", "/customers/:customerId/rentals")
      .addSuccess(Schema.Array(RentalDetail))
      .addError(CustomerNotFoundError)
      .setPath(Schema.Struct({ customerId: Schema.NumberFromString }))
      .annotate(OpenApi.Summary, "Get customer rental history")
      .annotate(OpenApi.Description, "Get rental history for a specific customer.")
  )
  .add(
    HttpApiEndpoint.get("customerInfo", "/customers/:customerId")
      .addSuccess(CustomerInfo)
      .addError(CustomerNotFoundError)
      .setPath(Schema.Struct({ customerId: Schema.NumberFromString }))
      .annotate(OpenApi.Summary, "Get customer info")
      .annotate(OpenApi.Description, "Get customer information by ID.")
  ) {}
