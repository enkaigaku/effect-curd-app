import { Schema } from "effect"

// ============================================================
// Auth Request Schemas
// ============================================================

export class LoginInput extends Schema.Class<LoginInput>("LoginInput")({
  email: Schema.String.pipe(Schema.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)),
  password: Schema.String.pipe(Schema.minLength(6)),
}) {}

export class RegisterInput extends Schema.Class<RegisterInput>("RegisterInput")({
  name: Schema.String.pipe(Schema.minLength(1)),
  email: Schema.String.pipe(Schema.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)),
  password: Schema.String.pipe(Schema.minLength(6)),
}) {}

// ============================================================
// Auth Response Schemas
// ============================================================

export class AuthToken extends Schema.Class<AuthToken>("AuthToken")({
  accessToken: Schema.String,
  tokenType: Schema.Literal("Bearer"),
  expiresIn: Schema.Number,
}) {}

// ============================================================
// JWT Payload Schema
// ============================================================

export class JwtPayload extends Schema.Class<JwtPayload>("JwtPayload")({
  sub: Schema.Number,         // User ID
  email: Schema.String,
  iat: Schema.Number,         // Issued at
  exp: Schema.Number,         // Expiration
}) {}
