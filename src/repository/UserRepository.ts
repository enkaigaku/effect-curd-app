import { Effect, Data } from "effect"
import { SqlClient } from "@effect/sql"
import { User, CreateUserInput, UpdateUserInput } from "../schema/User.js"

// ============================================================
// Error Types (using Effect-ts idiomatic Data.TaggedError)
// ============================================================

export class UserNotFoundError extends Data.TaggedError("UserNotFoundError")<{
  readonly id: number
}> {}

export class DatabaseError extends Data.TaggedError("DatabaseError")<{
  readonly cause: unknown
}> {}

// ============================================================
// Helper: Map row to User
// ============================================================

const rowToUser = (row: Record<string, unknown>): User =>
  new User({
    id: row["id"] as number,
    name: row["name"] as string,
    email: row["email"] as string,
    createdAt: new Date(row["created_at"] as string),
    updatedAt: new Date(row["updated_at"] as string),
  })

// ============================================================
// Repository Service (using Effect.Service pattern)
// ============================================================

export class UserRepository extends Effect.Service<UserRepository>()("UserRepository", {
  effect: Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient

    const findAll = (): Effect.Effect<readonly User[], DatabaseError> =>
      sql`SELECT id, name, email, created_at, updated_at FROM users ORDER BY id`.pipe(
        Effect.map((rows) => rows.map(rowToUser)),
        Effect.mapError((cause) => new DatabaseError({ cause })),
        Effect.withSpan("UserRepository.findAll")
      )

    const findById = (id: number): Effect.Effect<User, UserNotFoundError | DatabaseError> =>
      sql`SELECT id, name, email, created_at, updated_at FROM users WHERE id = ${id}`.pipe(
        Effect.flatMap((rows) =>
          rows.length === 0
            ? Effect.fail(new UserNotFoundError({ id }))
            : Effect.succeed(rowToUser(rows[0]!))
        ),
        Effect.catchTag("SqlError", (cause) => Effect.fail(new DatabaseError({ cause }))),
        Effect.withSpan("UserRepository.findById", { attributes: { userId: id } })
      )

    const create = (input: CreateUserInput): Effect.Effect<User, DatabaseError> =>
      sql`
        INSERT INTO users (name, email)
        VALUES (${input.name}, ${input.email})
        RETURNING id, name, email, created_at, updated_at
      `.pipe(
        Effect.map((rows) => rowToUser(rows[0]!)),
        Effect.mapError((cause) => new DatabaseError({ cause })),
        Effect.withSpan("UserRepository.create", { attributes: { email: input.email } })
      )

    const update = (id: number, input: UpdateUserInput): Effect.Effect<User, UserNotFoundError | DatabaseError> =>
      sql`SELECT id FROM users WHERE id = ${id}`.pipe(
        Effect.flatMap((existing) =>
          existing.length === 0
            ? Effect.fail(new UserNotFoundError({ id }) as UserNotFoundError | DatabaseError)
            : sql`
                UPDATE users 
                SET name = COALESCE(${input.name ?? null}, name),
                    email = COALESCE(${input.email ?? null}, email),
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ${id}
                RETURNING id, name, email, created_at, updated_at
              `.pipe(
                Effect.map((rows) => rowToUser(rows[0]!)),
                Effect.mapError((cause) => new DatabaseError({ cause }) as UserNotFoundError | DatabaseError)
              )
        ),
        Effect.catchTag("SqlError", (cause) => Effect.fail(new DatabaseError({ cause }))),
        Effect.withSpan("UserRepository.update", { attributes: { userId: id } })
      )

    const deleteFn = (id: number): Effect.Effect<void, UserNotFoundError | DatabaseError> =>
      sql`DELETE FROM users WHERE id = ${id} RETURNING id`.pipe(
        Effect.flatMap((result) =>
          result.length === 0
            ? Effect.fail(new UserNotFoundError({ id }))
            : Effect.void
        ),
        Effect.catchTag("SqlError", (cause) => Effect.fail(new DatabaseError({ cause }))),
        Effect.withSpan("UserRepository.delete", { attributes: { userId: id } })
      )

    return {
      findAll,
      findById,
      create,
      update,
      delete: deleteFn,
    }
  }),
  dependencies: [],
}) {}
