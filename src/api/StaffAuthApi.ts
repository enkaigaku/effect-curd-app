import { HttpApiEndpoint, HttpApiGroup, HttpApiSchema, OpenApi } from "@effect/platform";
import { Schema } from "effect";

// ============================================================
// Staff Auth Schemas
// ============================================================

export class StaffLoginInput extends Schema.Class<StaffLoginInput>("StaffLoginInput")({
  username: Schema.String,
  password: Schema.String,
}) {}

export class StaffAuthResponse extends Schema.Class<StaffAuthResponse>("StaffAuthResponse")({
  staffId: Schema.Number,
  username: Schema.String,
  firstName: Schema.String,
  lastName: Schema.String,
  storeId: Schema.Number,
  token: Schema.String,
}) {}

export class StaffProfileResponse extends Schema.Class<StaffProfileResponse>("StaffProfileResponse")({
  staffId: Schema.Number,
  username: Schema.String,
  email: Schema.NullOr(Schema.String),
  firstName: Schema.String,
  lastName: Schema.String,
  storeId: Schema.Number,
  isActive: Schema.Boolean,
}) {}

export class StaffUpdatePasswordInput extends Schema.Class<StaffUpdatePasswordInput>("StaffUpdatePasswordInput")({
  currentPassword: Schema.String,
  newPassword: Schema.String,
}) {}

// ============================================================
// Staff Auth API Error Schemas
// ============================================================

export class StaffAuthError extends Schema.TaggedError<StaffAuthError>()(
  "StaffAuthError",
  { message: Schema.String },
  HttpApiSchema.annotations({ status: 401 })
) {}

// ============================================================
// Staff Auth API Definition
// ============================================================

export class StaffAuthApi extends HttpApiGroup.make("staff-auth")
  .add(
    HttpApiEndpoint.post("login", "/staff/login")
      .addSuccess(StaffAuthResponse)
      .addError(StaffAuthError)
      .setPayload(StaffLoginInput)
      .annotate(OpenApi.Summary, "Staff login")
      .annotate(OpenApi.Description, "Authenticate a staff member and receive a JWT token.")
  )
  .add(
    HttpApiEndpoint.get("profile", "/staff/profile/:staffId")
      .addSuccess(StaffProfileResponse)
      .addError(StaffAuthError)
      .setPath(Schema.Struct({ staffId: Schema.NumberFromString }))
      .annotate(OpenApi.Summary, "Get staff profile")
      .annotate(OpenApi.Description, "Get staff member profile information.")
  )
  .add(
    HttpApiEndpoint.put("updatePassword", "/staff/password/:staffId")
      .addSuccess(Schema.Struct({ success: Schema.Boolean }))
      .addError(StaffAuthError)
      .setPath(Schema.Struct({ staffId: Schema.NumberFromString }))
      .setPayload(StaffUpdatePasswordInput)
      .annotate(OpenApi.Summary, "Update staff password")
      .annotate(OpenApi.Description, "Update staff member password.")
  )
  .add(
    HttpApiEndpoint.get("list", "/staff")
      .addSuccess(Schema.Array(StaffProfileResponse))
      .addError(StaffAuthError)
      .annotate(OpenApi.Summary, "List staff members")
      .annotate(OpenApi.Description, "Get list of all staff members.")
  ) {}
