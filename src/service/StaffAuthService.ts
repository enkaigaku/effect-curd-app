import { Effect, Data } from "effect";
import * as bcrypt from "bcrypt";
import * as jose from "jose";
import { SqlClient } from "@effect/sql";

// ============================================================
// Staff Auth Errors
// ============================================================

export class StaffNotFoundError extends Data.TaggedError("StaffNotFoundError")<{
  readonly username: string;
}> {}

export class StaffInvalidPasswordError extends Data.TaggedError("StaffInvalidPasswordError")<{
  readonly message?: string;
}> {}

export class StaffInactiveError extends Data.TaggedError("StaffInactiveError")<{
  readonly username: string;
}> {}

// ============================================================
// Staff Auth Types
// ============================================================

export interface StaffAuthResult {
  staffId: number;
  username: string;
  firstName: string;
  lastName: string;
  storeId: number;
  token: string;
}

export interface StaffProfile {
  staffId: number;
  username: string;
  email: string | null;
  firstName: string;
  lastName: string;
  storeId: number;
  isActive: boolean;
}

// ============================================================
// Staff Auth Service
// ============================================================

const JWT_SECRET = new TextEncoder().encode(
  process.env["JWT_SECRET"] ?? "staff-secret-key-change-in-production"
);

export class StaffAuthService extends Effect.Service<StaffAuthService>()("StaffAuthService", {
  effect: Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient;

    return {
      // Staff login
      login: (username: string, password: string) =>
        Effect.gen(function* () {
          yield* Effect.logInfo(`Staff login attempt: ${username}`);

          const rows = yield* sql`
            SELECT staff_id, username, first_name, last_name, email, store_id, active, password_hash
            FROM staff
            WHERE username = ${username}
          `;

          if (!rows[0]) {
            return yield* Effect.fail(new StaffNotFoundError({ username }));
          }

          const staff = rows[0] as any;

          if (!staff.active) {
            return yield* Effect.fail(new StaffInactiveError({ username }));
          }

          const isValid = yield* Effect.promise(() =>
            bcrypt.compare(password, staff.password_hash ?? "")
          );

          if (!isValid) {
            return yield* Effect.fail(new StaffInvalidPasswordError({}));
          }

          const token = yield* Effect.promise(() =>
            new jose.SignJWT({ 
              sub: String(staff.staff_id), 
              username: staff.username,
              storeId: staff.store_id,
              type: "staff"
            })
              .setProtectedHeader({ alg: "HS256" })
              .setIssuedAt()
              .setExpirationTime("8h") // Shorter expiry for staff
              .sign(JWT_SECRET)
          );

          yield* Effect.logInfo(`Staff logged in: ${staff.staff_id}`);

          return {
            staffId: staff.staff_id,
            username: staff.username,
            firstName: staff.first_name,
            lastName: staff.last_name,
            storeId: staff.store_id,
            token,
          } as StaffAuthResult;
        }),

      // Get staff profile
      getProfile: (staffId: number) =>
        Effect.gen(function* () {
          const rows = yield* sql`
            SELECT staff_id, username, email, first_name, last_name, store_id, active
            FROM staff
            WHERE staff_id = ${staffId}
          `;

          if (!rows[0]) return undefined;

          const row = rows[0] as any;
          return {
            staffId: row.staff_id,
            username: row.username,
            email: row.email,
            firstName: row.first_name,
            lastName: row.last_name,
            storeId: row.store_id,
            isActive: row.active,
          } as StaffProfile;
        }),

      // Update password
      updatePassword: (staffId: number, currentPassword: string, newPassword: string) =>
        Effect.gen(function* () {
          const rows = yield* sql`
            SELECT password_hash FROM staff WHERE staff_id = ${staffId}
          `;

          if (!rows[0]) {
            return yield* Effect.fail(new StaffNotFoundError({ username: "" }));
          }

          const isValid = yield* Effect.promise(() =>
            bcrypt.compare(currentPassword, (rows[0] as any).password_hash ?? "")
          );

          if (!isValid) {
            return yield* Effect.fail(new StaffInvalidPasswordError({}));
          }

          const newHash = yield* Effect.promise(() => bcrypt.hash(newPassword, 10));

          yield* sql`
            UPDATE staff SET password_hash = ${newHash}
            WHERE staff_id = ${staffId}
          `;

          yield* Effect.logInfo(`Staff password updated: ${staffId}`);
          return true;
        }),

      // Verify JWT token
      verifyToken: (token: string) =>
        Effect.gen(function* () {
          const result = yield* Effect.tryPromise({
            try: () => jose.jwtVerify(token, JWT_SECRET),
            catch: () => new Error("Invalid token"),
          });

          return {
            staffId: Number(result.payload.sub),
            username: result.payload["username"] as string,
            storeId: result.payload["storeId"] as number,
            type: result.payload["type"] as string,
          };
        }),

      // List all staff members
      listStaff: () =>
        Effect.gen(function* () {
          const rows = yield* sql`
            SELECT staff_id, username, email, first_name, last_name, store_id, active
            FROM staff
            ORDER BY staff_id
          `;

          return rows.map((row: any) => ({
            staffId: row.staff_id,
            username: row.username,
            email: row.email,
            firstName: row.first_name,
            lastName: row.last_name,
            storeId: row.store_id,
            isActive: row.active,
          } as StaffProfile));
        }),
    };
  }),
  dependencies: [],
}) {}
