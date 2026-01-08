import { HttpApiEndpoint, HttpApiGroup, HttpApiSchema, OpenApi } from "@effect/platform"
import { Schema } from "effect"
import { User, UpdateUserInput } from "../schema/User.js"
import { UnauthorizedError } from "./AuthApi.js"

// ============================================================
// User API Error Schemas
// ============================================================

export class UserNotFoundError extends Schema.TaggedError<UserNotFoundError>()(
  "UserNotFoundError",
  { message: Schema.String },
  HttpApiSchema.annotations({ status: 404 })
) {}

export class DatabaseError extends Schema.TaggedError<DatabaseError>()(
  "DatabaseError",
  { message: Schema.String },
  HttpApiSchema.annotations({ status: 500 })
) {}

// ============================================================
// Path Parameters
// ============================================================

const UserIdPath = Schema.Struct({
  id: Schema.NumberFromString,
})

// ============================================================
// User API Definition
// ============================================================

export class UserApi extends HttpApiGroup.make("users")
  .add(
    HttpApiEndpoint.get("getAll", "/users")
      .addSuccess(Schema.Array(User))
      .addError(UnauthorizedError)
      .addError(DatabaseError)
      .annotate(OpenApi.Summary, "Get all users")
      .annotate(OpenApi.Description, "Returns a list of all users. Requires authentication.")
  )
  .add(
    HttpApiEndpoint.get("getById", "/users/:id")
      .addSuccess(User)
      .setPath(UserIdPath)
      .addError(UnauthorizedError)
      .addError(UserNotFoundError)
      .addError(DatabaseError)
      .annotate(OpenApi.Summary, "Get user by ID")
      .annotate(OpenApi.Description, "Returns a single user by their ID. Requires authentication.")
  )
  .add(
    HttpApiEndpoint.put("update", "/users/:id")
      .addSuccess(User)
      .setPath(UserIdPath)
      .setPayload(UpdateUserInput)
      .addError(UnauthorizedError)
      .addError(UserNotFoundError)
      .addError(DatabaseError)
      .annotate(OpenApi.Summary, "Update user")
      .annotate(OpenApi.Description, "Update user's name or email. Requires authentication.")
  )
  .add(
    HttpApiEndpoint.del("delete", "/users/:id")
      .addSuccess(Schema.Struct({ message: Schema.String }))
      .setPath(UserIdPath)
      .addError(UnauthorizedError)
      .addError(UserNotFoundError)
      .addError(DatabaseError)
      .annotate(OpenApi.Summary, "Delete user")
      .annotate(OpenApi.Description, "Delete a user by ID. Requires authentication.")
  ) {}
