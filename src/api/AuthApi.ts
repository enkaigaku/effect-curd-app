import { HttpApiEndpoint, HttpApiGroup, HttpApiSchema, OpenApi } from "@effect/platform"
import { Schema } from "effect"
import { LoginInput, RegisterInput, AuthToken } from "../schema/Auth.js"
import { User } from "../schema/User.js"

// ============================================================
// Auth API Error Schemas
// ============================================================

export class UnauthorizedError extends Schema.TaggedError<UnauthorizedError>()(
  "UnauthorizedError",
  { message: Schema.String },
  HttpApiSchema.annotations({ status: 401 })
) {}

export class InvalidCredentialsError extends Schema.TaggedError<InvalidCredentialsError>()(
  "InvalidCredentialsError",
  { message: Schema.String },
  HttpApiSchema.annotations({ status: 401 })
) {}

export class ValidationError extends Schema.TaggedError<ValidationError>()(
  "ValidationError",
  { message: Schema.String },
  HttpApiSchema.annotations({ status: 400 })
) {}

// ============================================================
// Auth API Definition
// ============================================================

export class AuthApi extends HttpApiGroup.make("auth")
  .add(
    HttpApiEndpoint.post("register", "/auth/register")
      .addSuccess(AuthToken)
      .setPayload(RegisterInput)
      .addError(ValidationError)
      .annotate(OpenApi.Summary, "Register a new user")
      .annotate(OpenApi.Description, "Create a new user account and receive an access token")
  )
  .add(
    HttpApiEndpoint.post("login", "/auth/login")
      .addSuccess(AuthToken)
      .setPayload(LoginInput)
      .addError(InvalidCredentialsError)
      .annotate(OpenApi.Summary, "Login to get access token")
      .annotate(OpenApi.Description, "Authenticate with email and password to receive an access token")
  )
  .add(
    HttpApiEndpoint.get("me", "/auth/me")
      .addSuccess(User)
      .addError(UnauthorizedError)
      .annotate(OpenApi.Summary, "Get current user info")
      .annotate(OpenApi.Description, "Returns the authenticated user's information. Requires Bearer token.")
  ) {}
