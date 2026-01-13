import { Effect } from "effect";
import { SqlClient } from "@effect/sql";
import { BunContext, BunFileSystem, BunRuntime } from "@effect/platform-bun";
import { FileSystem, Path } from "@effect/platform";
import { DatabaseLive } from "../config/Database.js";

// ============================================================
// Migration Service
// ============================================================

const runMigrationsEffect = Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient;
  const fs = yield* FileSystem.FileSystem;
  const pathService = yield* Path.Path;

  const migrationsDir = pathService.join(process.cwd(), "migrations");

  yield* Effect.logInfo("Checking for pending migrations...");

  // Ensure migrations table exists
  yield* sql`
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `;

  // Get applied migrations
  const appliedRows = yield* sql`SELECT name FROM migrations`;
  const appliedNames = new Set(appliedRows.map((row: any) => row.name));

  // Read migration files
  const files = yield* fs.readDirectory(migrationsDir);
  const migrationFiles = files.filter((f) => f.endsWith(".sql")).sort();

  for (const file of migrationFiles) {
    if (!appliedNames.has(file)) {
      yield* Effect.logInfo(`Applying migration: ${file}`);

      const content = yield* fs.readFileString(pathService.join(migrationsDir, file));

      yield* sql.withTransaction(
        Effect.gen(function* () {
          // Execute migration SQL
          yield* sql.unsafe(content);

          // Reset search_path in case migration changed it
          yield* sql`SET search_path TO public`;

          // Record migration
          yield* sql`INSERT INTO migrations (name) VALUES (${file})`;
        }),
      );

      yield* Effect.logInfo(`Migration ${file} applied successfully`);
    }
  }

  yield* Effect.logInfo("All migrations are up to date.");
});

export const runMigrations = runMigrationsEffect.pipe(
  Effect.provide(DatabaseLive),
  Effect.provide(BunFileSystem.layer),
  Effect.provide(BunContext.layer),
);

// Run if executed directly
BunRuntime.runMain(runMigrations);
