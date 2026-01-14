import { HttpApiBuilder } from "@effect/platform";
import { Effect } from "effect";
import { Api, CustomerAuthError, CustomerEmailExistsError } from "../api/index.js";
import { CustomerAuthService } from "../service/CustomerAuthService.js";
import { CustomerAuthResponse, CustomerProfileResponse } from "../api/CustomerAuthApi.js";

// ============================================================
// Customer Auth Handler Implementation
// ============================================================

export const CustomerAuthHandler = HttpApiBuilder.group(Api, "customer-auth", (handlers) =>
  handlers
    .handle("login", ({ payload }) =>
      Effect.gen(function* () {
        const authService = yield* CustomerAuthService;
        const result = yield* authService.login(payload.email, payload.password);

        return new CustomerAuthResponse({
          customerId: result.customerId,
          email: result.email,
          firstName: result.firstName,
          lastName: result.lastName,
          token: result.token,
        });
      }).pipe(
        Effect.mapError((err: any) => {
          if (err._tag === "CustomerNotFoundError") {
            return new CustomerAuthError({ message: "Invalid email or password" });
          }
          if (err._tag === "InvalidPasswordError") {
            return new CustomerAuthError({ message: "Invalid email or password" });
          }
          return new CustomerAuthError({ message: "Authentication failed" });
        })
      )
    )
    .handle("register", ({ payload }) =>
      Effect.gen(function* () {
        const authService = yield* CustomerAuthService;
        const result = yield* authService.register(
          payload.email,
          payload.password,
          payload.firstName,
          payload.lastName,
          payload.storeId
        );

        return new CustomerAuthResponse({
          customerId: result.customerId,
          email: result.email,
          firstName: result.firstName,
          lastName: result.lastName,
          token: result.token,
        });
      }).pipe(
        Effect.mapError((err: any) => {
          if (err._tag === "EmailAlreadyExistsError") {
            return new CustomerEmailExistsError({ 
              message: "Email already registered", 
              email: payload.email 
            });
          }
          const msg = err instanceof Error ? err.message : String(err);
          return new CustomerAuthError({ message: msg || "Registration failed" });
        })
      )
    )
    .handle("profile", ({ path }) =>
      Effect.gen(function* () {
        const authService = yield* CustomerAuthService;
        const profile = yield* authService.getProfile(path.customerId);

        if (!profile) {
          return yield* Effect.fail(new CustomerAuthError({ message: "Customer not found" }));
        }

        return new CustomerProfileResponse({
          customerId: profile.customerId,
          email: profile.email,
          firstName: profile.firstName,
          lastName: profile.lastName,
          storeId: profile.storeId,
          isActive: profile.isActive,
        });
      }).pipe(
        Effect.mapError((err: any) => {
          if (err._tag === "CustomerAuthError") return err;
          return new CustomerAuthError({ message: "Failed to get profile" });
        })
      )
    )
    .handle("updatePassword", ({ path, payload }) =>
      Effect.gen(function* () {
        const authService = yield* CustomerAuthService;
        yield* authService.updatePassword(
          path.customerId,
          payload.currentPassword,
          payload.newPassword
        );
        return { success: true };
      }).pipe(
        Effect.mapError((err: any) => {
          if (err._tag === "InvalidPasswordError") {
            return new CustomerAuthError({ message: "Current password is incorrect" });
          }
          if (err._tag === "CustomerNotFoundError") {
            return new CustomerAuthError({ message: "Customer not found" });
          }
          return new CustomerAuthError({ message: "Failed to update password" });
        })
      )
    )
);
