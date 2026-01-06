import { Schema } from "effect"

// ============================================================
// User Entity Schema
// ============================================================

export class User extends Schema.Class<User>("User")({
  id: Schema.Number,
  name: Schema.String,
  email: Schema.String,
  createdAt: Schema.DateFromSelf,
  updatedAt: Schema.DateFromSelf,
}) {}

// ============================================================
// Input Schemas for CRUD Operations
// ============================================================

export class CreateUserInput extends Schema.Class<CreateUserInput>("CreateUserInput")({
  name: Schema.String.pipe(
    Schema.minLength(1, { message: () => "Name is required" }),
    Schema.maxLength(255, { message: () => "Name must be at most 255 characters" })
  ),
  email: Schema.String.pipe(
    Schema.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, { message: () => "Invalid email format" })
  ),
}) {}

export class UpdateUserInput extends Schema.Class<UpdateUserInput>("UpdateUserInput")({
  name: Schema.optional(
    Schema.String.pipe(
      Schema.minLength(1, { message: () => "Name cannot be empty" }),
      Schema.maxLength(255, { message: () => "Name must be at most 255 characters" })
    )
  ),
  email: Schema.optional(
    Schema.String.pipe(
      Schema.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, { message: () => "Invalid email format" })
    )
  ),
}) {}

// ============================================================
// Path Parameter Schema
// ============================================================

export class UserIdParam extends Schema.Class<UserIdParam>("UserIdParam")({
  id: Schema.NumberFromString.pipe(
    Schema.int({ message: () => "ID must be an integer" }),
    Schema.positive({ message: () => "ID must be positive" })
  ),
}) {}
