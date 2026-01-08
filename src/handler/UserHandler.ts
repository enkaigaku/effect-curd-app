import { HttpApiBuilder, HttpServerRequest } from "@effect/platform"
import { Effect } from "effect"
import { Api, UserNotFoundError, DatabaseError, UnauthorizedError } from "../api/index.js"
import { UserService } from "../service/UserService.js"
import { AuthService } from "../service/AuthService.js"
import { User } from "../schema/User.js"

// ============================================================
// Auth Helper
// ============================================================

const requireAuth = Effect.gen(function* () {
  const request = yield* HttpServerRequest.HttpServerRequest
  const authService = yield* AuthService

  const authHeader = request.headers["authorization"]
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return yield* Effect.fail(new UnauthorizedError({ message: "Missing or invalid Authorization header" }))
  }

  const token = authHeader.slice(7)
  return yield* authService.verifyToken(token).pipe(
    Effect.mapError((e) => new UnauthorizedError({ message: e.message }))
  )
})

// ============================================================
// User Handler Implementation (Protected Routes)
// ============================================================

export const UserHandler = HttpApiBuilder.group(Api, "users", (handlers) =>
  handlers
    .handle("getAll", () =>
      Effect.gen(function* () {
        yield* requireAuth
        const userService = yield* UserService
        const users = yield* userService.getAllUsers().pipe(
          Effect.mapError((e) => new DatabaseError({ message: String(e) }))
        )
        return users
      })
    )
    .handle("getById", ({ path }) =>
      Effect.gen(function* () {
        yield* requireAuth
        const userService = yield* UserService
        const user = yield* userService.getUserById(path.id).pipe(
          Effect.mapError((e) => 
            e._tag === "UserNotFoundError" 
              ? new UserNotFoundError({ message: `User with id ${path.id} not found` })
              : new DatabaseError({ message: String(e) })
          )
        )
        return new User({
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        })
      })
    )
    .handle("update", ({ path, payload }) =>
      Effect.gen(function* () {
        yield* requireAuth
        const userService = yield* UserService
        const user = yield* userService.updateUser(path.id, payload).pipe(
          Effect.mapError((e) => 
            e._tag === "UserNotFoundError" 
              ? new UserNotFoundError({ message: `User with id ${path.id} not found` })
              : new DatabaseError({ message: String(e) })
          )
        )
        return new User({
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        })
      })
    )
    .handle("delete", ({ path }) =>
      Effect.gen(function* () {
        yield* requireAuth
        const userService = yield* UserService
        yield* userService.deleteUser(path.id).pipe(
          Effect.mapError((e) => 
            e._tag === "UserNotFoundError" 
              ? new UserNotFoundError({ message: `User with id ${path.id} not found` })
              : new DatabaseError({ message: String(e) })
          )
        )
        return { message: "User deleted successfully" }
      })
    )
)
