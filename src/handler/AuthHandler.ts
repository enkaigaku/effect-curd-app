import { Effect } from "effect"
import { HttpRouter, HttpServerRequest, HttpServerResponse } from "@effect/platform"
import { AuthService, InvalidCredentialsError } from "../service/AuthService.js"
import { UserService } from "../service/UserService.js"
import { LoginInput, RegisterInput, AuthToken } from "../schema/Auth.js"

// ============================================================
// Error Response Helper
// ============================================================

const errorResponse = (status: number, message: string) =>
  HttpServerResponse.json({ error: message }, { status })

// ============================================================
// Auth Handler Routes
// ============================================================

export const AuthHandler = HttpRouter.empty.pipe(
  // POST /auth/register - Register a new user
  HttpRouter.post(
    "/auth/register",
    Effect.gen(function* () {
      const authService = yield* AuthService
      const userService = yield* UserService
      const body = yield* HttpServerRequest.schemaBodyJson(RegisterInput)

      yield* Effect.logInfo(`Registering new user: ${body.email}`)

      // Hash password
      const hashedPassword = yield* authService.hashPassword(body.password)

      // Create user with hashed password
      const user = yield* userService.createUser({
        name: body.name,
        email: body.email,
        password: hashedPassword,
      })

      // Generate token
      const accessToken = yield* authService.generateToken(user.id, user.email)

      yield* Effect.logInfo(`User registered successfully: ${user.id}`)

      return yield* HttpServerResponse.json(
        new AuthToken({
          accessToken,
          tokenType: "Bearer",
          expiresIn: authService.getExpiresIn(),
        }),
        { status: 201 }
      )
    }).pipe(
      Effect.catchTag("ParseError", () => 
        errorResponse(400, "Invalid input: name, valid email, and password (min 6 chars) required")
      ),
      Effect.catchTag("RequestError", () => errorResponse(400, "Invalid request body")),
      Effect.catchTag("DatabaseError", () => errorResponse(500, "Registration failed"))
    )
  ),

  // POST /auth/login - Login and get token
  HttpRouter.post(
    "/auth/login",
    Effect.gen(function* () {
      const authService = yield* AuthService
      const userService = yield* UserService
      const body = yield* HttpServerRequest.schemaBodyJson(LoginInput)

      yield* Effect.logDebug(`Login attempt for: ${body.email}`)

      // Find user by email
      const user = yield* userService.getUserByEmail(body.email).pipe(
        Effect.catchTag("UserNotFoundError", () =>
          Effect.fail(new InvalidCredentialsError({ message: "Invalid email or password" }))
        )
      )

      // Verify password
      const isValid = yield* authService.verifyPassword(body.password, user.password)
      if (!isValid) {
        yield* Effect.logWarning(`Failed login attempt for: ${body.email}`)
        return yield* Effect.fail(new InvalidCredentialsError({ message: "Invalid email or password" }))
      }

      // Generate token
      const accessToken = yield* authService.generateToken(user.id, user.email)

      yield* Effect.logInfo(`User logged in: ${user.id}`)

      return yield* HttpServerResponse.json(
        new AuthToken({
          accessToken,
          tokenType: "Bearer",
          expiresIn: authService.getExpiresIn(),
        })
      )
    }).pipe(
      Effect.catchTag("ParseError", () => 
        errorResponse(400, "Invalid input: email and password required")
      ),
      Effect.catchTag("RequestError", () => errorResponse(400, "Invalid request body")),
      Effect.catchTag("InvalidCredentialsError", (e) => errorResponse(401, e.message)),
      Effect.catchTag("DatabaseError", () => errorResponse(500, "Login failed"))
    )
  ),

  // GET /auth/me - Get current user info (requires auth)
  HttpRouter.get(
    "/auth/me",
    Effect.gen(function* () {
      const request = yield* HttpServerRequest.HttpServerRequest
      const authService = yield* AuthService
      const userService = yield* UserService

      // Get Authorization header
      const authHeader = request.headers["authorization"]
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return yield* errorResponse(401, "Missing or invalid Authorization header")
      }

      const token = authHeader.slice(7)
      const payload = yield* authService.verifyToken(token)

      // Get full user info
      const user = yield* userService.getUserById(payload.sub)

      return yield* HttpServerResponse.json({
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })
    }).pipe(
      Effect.catchTag("UnauthorizedError", (e) => errorResponse(401, e.message)),
      Effect.catchTag("TokenExpiredError", (e) => errorResponse(401, e.message)),
      Effect.catchTag("UserNotFoundError", () => errorResponse(404, "User not found")),
      Effect.catchTag("DatabaseError", () => errorResponse(500, "Failed to get user info"))
    )
  )
)
