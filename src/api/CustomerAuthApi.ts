import { HttpApiEndpoint, HttpApiGroup, HttpApiSchema, OpenApi } from "@effect/platform";
import { Schema } from "effect";

// ============================================================
// Customer Auth Schemas
// ============================================================

export class CustomerLoginInput extends Schema.Class<CustomerLoginInput>("CustomerLoginInput")({
  email: Schema.String,
  password: Schema.String,
}) {}

export class CustomerRegisterInput extends Schema.Class<CustomerRegisterInput>("CustomerRegisterInput")({
  email: Schema.String,
  password: Schema.String,
  firstName: Schema.String,
  lastName: Schema.String,
  storeId: Schema.optionalWith(Schema.Number, { default: () => 1 }),
}) {}

export class CustomerAuthResponse extends Schema.Class<CustomerAuthResponse>("CustomerAuthResponse")({
  customerId: Schema.Number,
  email: Schema.String,
  firstName: Schema.String,
  lastName: Schema.String,
  token: Schema.String,
}) {}

export class CustomerProfileResponse extends Schema.Class<CustomerProfileResponse>("CustomerProfileResponse")({
  customerId: Schema.Number,
  email: Schema.String,
  firstName: Schema.String,
  lastName: Schema.String,
  storeId: Schema.Number,
  isActive: Schema.Boolean,
}) {}

export class UpdatePasswordInput extends Schema.Class<UpdatePasswordInput>("UpdatePasswordInput")({
  currentPassword: Schema.String,
  newPassword: Schema.String,
}) {}

// ============================================================
// Customer Auth API Error Schemas
// ============================================================

export class CustomerAuthError extends Schema.TaggedError<CustomerAuthError>()(
  "CustomerAuthError",
  { message: Schema.String },
  HttpApiSchema.annotations({ status: 401 })
) {}

export class CustomerEmailExistsError extends Schema.TaggedError<CustomerEmailExistsError>()(
  "CustomerEmailExistsError",
  { message: Schema.String, email: Schema.String },
  HttpApiSchema.annotations({ status: 409 })
) {}

// ============================================================
// Customer Auth API Definition
// ============================================================

export class CustomerAuthApi extends HttpApiGroup.make("customer-auth")
  .add(
    HttpApiEndpoint.post("login", "/customer/login")
      .addSuccess(CustomerAuthResponse)
      .addError(CustomerAuthError)
      .setPayload(CustomerLoginInput)
      .annotate(OpenApi.Summary, "Customer login")
      .annotate(OpenApi.Description, "Authenticate a customer and receive a JWT token.")
  )
  .add(
    HttpApiEndpoint.post("register", "/customer/register")
      .addSuccess(CustomerAuthResponse)
      .addError(CustomerEmailExistsError)
      .addError(CustomerAuthError)
      .setPayload(CustomerRegisterInput)
      .annotate(OpenApi.Summary, "Customer registration")
      .annotate(OpenApi.Description, "Register a new customer account.")
  )
  .add(
    HttpApiEndpoint.get("profile", "/customer/profile/:customerId")
      .addSuccess(CustomerProfileResponse)
      .addError(CustomerAuthError)
      .setPath(Schema.Struct({ customerId: Schema.NumberFromString }))
      .annotate(OpenApi.Summary, "Get customer profile")
      .annotate(OpenApi.Description, "Get customer profile information.")
  )
  .add(
    HttpApiEndpoint.put("updatePassword", "/customer/password/:customerId")
      .addSuccess(Schema.Struct({ success: Schema.Boolean }))
      .addError(CustomerAuthError)
      .setPath(Schema.Struct({ customerId: Schema.NumberFromString }))
      .setPayload(UpdatePasswordInput)
      .annotate(OpenApi.Summary, "Update password")
      .annotate(OpenApi.Description, "Update customer password.")
  ) {}
