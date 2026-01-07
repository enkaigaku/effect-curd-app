import { Effect } from "effect"
import { HttpRouter, HttpServerRequest, HttpServerResponse } from "@effect/platform"
import { UserService } from "../service/UserService.js"
import { UpdateUserInput, UserIdParam } from "../schema/User.js"
import { UserNotFoundError, DatabaseError } from "../repository/UserRepository.js"

// ============================================================
// Error Response Helper
// ============================================================

const errorResponse = (status: number, message: string) =>
  HttpServerResponse.json({ error: message }, { status })

const handleServiceError = (error: UserNotFoundError | DatabaseError) => {
  if (error._tag === "UserNotFoundError") {
    return errorResponse(404, `User with id ${error.id} not found`)
  }
  console.error("Database error:", error.cause)
  return errorResponse(500, "Internal server error")
}

// ============================================================
// User Handler Routes
// ============================================================
// Note: User creation is handled by POST /auth/register
// This handler only provides read, update, and delete operations
// ============================================================

export const UserHandler = HttpRouter.empty.pipe(
  // GET /users - Get all users
  HttpRouter.get(
    "/users",
    Effect.gen(function* () {
      const userService = yield* UserService
      const users = yield* userService.getAllUsers()
      return yield* HttpServerResponse.json(users)
    }).pipe(
      Effect.catchTag("DatabaseError", (e) => handleServiceError(e))
    )
  ),

  // GET /users/:id - Get user by ID
  HttpRouter.get(
    "/users/:id",
    Effect.gen(function* () {
      const userService = yield* UserService
      const params = yield* HttpRouter.schemaPathParams(UserIdParam)
      const user = yield* userService.getUserById(params.id)
      return yield* HttpServerResponse.json(user)
    }).pipe(
      Effect.catchTag("ParseError", () => errorResponse(400, "Invalid user ID")),
      Effect.catchTag("UserNotFoundError", (e) => handleServiceError(e)),
      Effect.catchTag("DatabaseError", (e) => handleServiceError(e))
    )
  ),

  // PUT /users/:id - Update a user
  HttpRouter.put(
    "/users/:id",
    Effect.gen(function* () {
      const userService = yield* UserService
      const params = yield* HttpRouter.schemaPathParams(UserIdParam)
      const body = yield* HttpServerRequest.schemaBodyJson(UpdateUserInput)
      const user = yield* userService.updateUser(params.id, body)
      return yield* HttpServerResponse.json(user)
    }).pipe(
      Effect.catchTag("ParseError", () => errorResponse(400, "Invalid input")),
      Effect.catchTag("RequestError", () => errorResponse(400, "Invalid request body")),
      Effect.catchTag("UserNotFoundError", (e) => handleServiceError(e)),
      Effect.catchTag("DatabaseError", (e) => handleServiceError(e))
    )
  ),

  // DELETE /users/:id - Delete a user
  HttpRouter.del(
    "/users/:id",
    Effect.gen(function* () {
      const userService = yield* UserService
      const params = yield* HttpRouter.schemaPathParams(UserIdParam)
      yield* userService.deleteUser(params.id)
      return yield* HttpServerResponse.json({ message: "User deleted successfully" })
    }).pipe(
      Effect.catchTag("ParseError", () => errorResponse(400, "Invalid user ID")),
      Effect.catchTag("UserNotFoundError", (e) => handleServiceError(e)),
      Effect.catchTag("DatabaseError", (e) => handleServiceError(e))
    )
  )
)
