import { HttpApiBuilder } from "@effect/platform";
import { Effect } from "effect";
import { Api, StaffAuthError } from "../api/index.js";
import { StaffAuthService } from "../service/StaffAuthService.js";
import { StaffAuthResponse, StaffProfileResponse } from "../api/StaffAuthApi.js";

// ============================================================
// Staff Auth Handler Implementation
// ============================================================

export const StaffAuthHandler = HttpApiBuilder.group(Api, "staff-auth", (handlers) =>
  handlers
    .handle("login", ({ payload }) =>
      Effect.gen(function* () {
        const authService = yield* StaffAuthService;
        const result = yield* authService.login(payload.username, payload.password);

        return new StaffAuthResponse({
          staffId: result.staffId,
          username: result.username,
          firstName: result.firstName,
          lastName: result.lastName,
          storeId: result.storeId,
          token: result.token,
        });
      }).pipe(
        Effect.mapError((err: any) => {
          if (err._tag === "StaffNotFoundError") {
            return new StaffAuthError({ message: "Invalid username or password" });
          }
          if (err._tag === "StaffInvalidPasswordError") {
            return new StaffAuthError({ message: "Invalid username or password" });
          }
          if (err._tag === "StaffInactiveError") {
            return new StaffAuthError({ message: "Account is inactive" });
          }
          return new StaffAuthError({ message: "Authentication failed" });
        })
      )
    )
    .handle("profile", ({ path }) =>
      Effect.gen(function* () {
        const authService = yield* StaffAuthService;
        const profile = yield* authService.getProfile(path.staffId);

        if (!profile) {
          return yield* Effect.fail(new StaffAuthError({ message: "Staff not found" }));
        }

        return new StaffProfileResponse({
          staffId: profile.staffId,
          username: profile.username,
          email: profile.email,
          firstName: profile.firstName,
          lastName: profile.lastName,
          storeId: profile.storeId,
          isActive: profile.isActive,
        });
      }).pipe(
        Effect.mapError((err: any) => {
          if (err._tag === "StaffAuthError") return err;
          return new StaffAuthError({ message: "Failed to get profile" });
        })
      )
    )
    .handle("updatePassword", ({ path, payload }) =>
      Effect.gen(function* () {
        const authService = yield* StaffAuthService;
        yield* authService.updatePassword(
          path.staffId,
          payload.currentPassword,
          payload.newPassword
        );
        return { success: true };
      }).pipe(
        Effect.mapError((err: any) => {
          if (err._tag === "StaffInvalidPasswordError") {
            return new StaffAuthError({ message: "Current password is incorrect" });
          }
          if (err._tag === "StaffNotFoundError") {
            return new StaffAuthError({ message: "Staff not found" });
          }
          return new StaffAuthError({ message: "Failed to update password" });
        })
      )
    )
    .handle("list", () =>
      Effect.gen(function* () {
        const authService = yield* StaffAuthService;
        const staffList = yield* authService.listStaff();

        return staffList.map(staff => new StaffProfileResponse({
          staffId: staff.staffId,
          username: staff.username,
          email: staff.email,
          firstName: staff.firstName,
          lastName: staff.lastName,
          storeId: staff.storeId,
          isActive: staff.isActive,
        }));
      }).pipe(
        Effect.mapError(() => {
          return new StaffAuthError({ message: "Failed to list staff" });
        })
      )
    )
);
