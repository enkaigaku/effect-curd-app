import { Effect, Data } from "effect"
import * as jose from "jose"
import { JwtPayload } from "../schema/Auth.js"

// ============================================================
// Auth Errors
// ============================================================

export class InvalidCredentialsError extends Data.TaggedError("InvalidCredentialsError")<{
  readonly message: string
}> {}

export class UnauthorizedError extends Data.TaggedError("UnauthorizedError")<{
  readonly message: string
}> {}

export class TokenExpiredError extends Data.TaggedError("TokenExpiredError")<{
  readonly message: string
}> {}

// ============================================================
// JWT Configuration
// ============================================================

const JWT_SECRET = process.env["JWT_SECRET"] ?? "your-super-secret-key-change-in-production"
const JWT_EXPIRES_IN = process.env["JWT_EXPIRES_IN"] ?? "1h"

const secret = new TextEncoder().encode(JWT_SECRET)

// Parse expiration string to seconds
const parseExpiresIn = (expiresIn: string): number => {
  const match = expiresIn.match(/^(\d+)([smhd])$/)
  if (!match) return 3600 // default 1 hour
  const [, value, unit] = match
  const multipliers: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 }
  return parseInt(value!) * (multipliers[unit!] ?? 3600)
}

// ============================================================
// Auth Service
// ============================================================

export class AuthService extends Effect.Service<AuthService>()("AuthService", {
  effect: Effect.gen(function* () {
    
    const generateToken = (userId: number, email: string): Effect.Effect<string, never> =>
      Effect.tryPromise({
        try: async () => {
          const now = Math.floor(Date.now() / 1000)
          const expiresIn = parseExpiresIn(JWT_EXPIRES_IN)
          
          return await new jose.SignJWT({ email })
            .setProtectedHeader({ alg: "HS256" })
            .setSubject(userId.toString())
            .setIssuedAt(now)
            .setExpirationTime(now + expiresIn)
            .sign(secret)
        },
        catch: () => new Error("Failed to generate token"),
      }).pipe(Effect.orDie)

    const verifyToken = (token: string): Effect.Effect<JwtPayload, UnauthorizedError | TokenExpiredError> =>
      Effect.async<JwtPayload, UnauthorizedError | TokenExpiredError>((resume) => {
        jose.jwtVerify(token, secret)
          .then(({ payload }) => {
            resume(Effect.succeed(new JwtPayload({
              sub: parseInt(payload.sub ?? "0"),
              email: payload["email"] as string,
              iat: payload.iat ?? 0,
              exp: payload.exp ?? 0,
            })))
          })
          .catch((error: unknown) => {
            if (error instanceof jose.errors.JWTExpired) {
              resume(Effect.fail(new TokenExpiredError({ message: "Token has expired" })))
            } else {
              resume(Effect.fail(new UnauthorizedError({ message: "Invalid token" })))
            }
          })
      })

    const getExpiresIn = (): number => parseExpiresIn(JWT_EXPIRES_IN)

    // Simple password hashing (for demo - use bcrypt/argon2 in production)
    const hashPassword = (password: string): Effect.Effect<string, never> =>
      Effect.sync(() => {
        const encoder = new TextEncoder()
        const data = encoder.encode(password + JWT_SECRET)
        return Array.from(new Uint8Array(data))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('')
      })

    const verifyPassword = (password: string, hash: string): Effect.Effect<boolean, never> =>
      Effect.gen(function* () {
        const passwordHash = yield* hashPassword(password)
        return passwordHash === hash
      })

    return {
      generateToken,
      verifyToken,
      getExpiresIn,
      hashPassword,
      verifyPassword,
    }
  }),
  dependencies: [],
}) {}
