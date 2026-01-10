import { Effect, Layer } from "effect"
import { SqlClient } from "@effect/sql"
import { NodeContext } from "@effect/platform-node"
import { DatabaseLive } from "../config/Database.js"
import * as fs from "node:fs/promises"
import * as path from "node:path"

// ============================================================
// Migration Service
// ============================================================

const MIGRATIONS_DIR = path.join(process.cwd(), "src/migrations")

export const runMigrations = Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient

  yield* Effect.logInfo("Checking for pending migrations...")

  // Ensure migrations table exists
  yield* sql`
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `

  // Get applied migrations
  const appliedRows = yield* sql`SELECT name FROM migrations`
  const appliedNames = new Set(appliedRows.map((row: any) => row.name))

  // Read migration files
  const files = yield* Effect.tryPromise(() => fs.readdir(MIGRATIONS_DIR))
  const migrationFiles = files
    .filter((f) => f.endsWith(".sql"))
    .sort() // Ensure order (e.g. 001_init.sql, 002_add_column.sql)

  for (const file of migrationFiles) {
    if (!appliedNames.has(file)) {
      yield* Effect.logInfo(`Applying migration: ${file}`)

      const content = yield* Effect.tryPromise(() =>
        fs.readFile(path.join(MIGRATIONS_DIR, file), "utf-8")
      )

      yield* sql.withTransaction(
        Effect.gen(function* () {
          // Execute migration SQL
          // Note: using unsafe because we're running raw SQL files
          yield* sql.unsafe(content)

          // Record migration
          yield* sql`INSERT INTO migrations (name) VALUES (${file})`
        })
      )

      yield* Effect.logInfo(`Migration ${file} applied successfully`)
    }
  }

  yield* Effect.logInfo("All migrations are up to date.")
}).pipe(
  Effect.provide(DatabaseLive),
  Effect.provide(NodeContext.layer)
)
