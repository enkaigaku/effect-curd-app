import { HttpApiBuilder, HttpServerRequest } from "@effect/platform"
import { Effect } from "effect"
import { Api, InvalidCredentialsError, ValidationError, UnauthorizedError } from "../api/index.js"
import { AuthService } from "../service/AuthService.js"
import { UserService } from "../service/UserService.js"
import { User } from "../schema/User.js"
import { AuthToken } from "../schema/Auth.js"

// ============================================================
// Auth Handler Implementation
// ============================================================

export const AuthHandler = HttpApiBuilder.group(Api, "auth", (handlers) =>
  handlers
    .handle("register", ({ payload }) =>
      Effect.gen(function* () {
        const authService = yield* AuthService
        const userService = yield* UserService

        yield* Effect.logInfo(`Registering new user: ${payload.email}`)

        // Hash password
        const hashedPassword = yield* authService.hashPassword(payload.password)

        // Create user with hashed password
        const user = yield* userService.createUser({
          name: payload.name,
          email: payload.email,
          password: hashedPassword,
        }).pipe(
          Effect.mapError(() => new ValidationError({ message: "Registration failed" }))
        )

        // Generate token
        const accessToken = yield* authService.generateToken(user.id, user.email)

        yield* Effect.logInfo(`User registered successfully: ${user.id}`)

        return new AuthToken({
          accessToken,
          tokenType: "Bearer",
          expiresIn: authService.getExpiresIn(),
        })
      })
    )
    .handle("login", ({ payload }) =>
      Effect.gen(function* () {
        const authService = yield* AuthService
        const userService = yield* UserService

        yield* Effect.logDebug(`Login attempt for: ${payload.email}`)

        // Find user by email
        const user = yield* userService.getUserByEmail(payload.email).pipe(
          Effect.mapError(() => new InvalidCredentialsError({ message: "Invalid email or password" }))
        )

        // Verify password
        const isValid = yield* authService.verifyPassword(payload.password, user.password)
        if (!isValid) {
          yield* Effect.logWarning(`Failed login attempt for: ${payload.email}`)
          return yield* Effect.fail(new InvalidCredentialsError({ message: "Invalid email or password" }))
        }

        // Generate token
        const accessToken = yield* authService.generateToken(user.id, user.email)

        yield* Effect.logInfo(`User logged in: ${user.id}`)

        return new AuthToken({
          accessToken,
          tokenType: "Bearer",
          expiresIn: authService.getExpiresIn(),
        })
      })
    )
    .handle("me", () =>
      Effect.gen(function* () {
        const request = yield* HttpServerRequest.HttpServerRequest
        const authService = yield* AuthService
        const userService = yield* UserService

        // Get Authorization header
        const authHeader = request.headers["authorization"]
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
          return yield* Effect.fail(new UnauthorizedError({ message: "Missing or invalid Authorization header" }))
        }

        const token = authHeader.slice(7)
        const jwtPayload = yield* authService.verifyToken(token).pipe(
          Effect.mapError((e) => new UnauthorizedError({ message: e.message }))
        )

        // Get full user info
        const user = yield* userService.getUserById(jwtPayload.sub).pipe(
          Effect.mapError(() => new UnauthorizedError({ message: "User not found" }))
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
)
