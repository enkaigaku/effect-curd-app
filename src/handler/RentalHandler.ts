import { HttpApiBuilder } from "@effect/platform";
import { Effect } from "effect";
import { Api, RentalNotFoundError as ApiRentalNotFoundError, CustomerNotFoundError as ApiCustomerNotFoundError, NoInventoryError, RentalError } from "../api/index.js";
import { RentalService } from "../service/RentalService.js";
import { CreateRentalInput } from "../schema/Rental.js";

// ============================================================
// Rental Handler Implementation
// ============================================================

export const RentalHandler = HttpApiBuilder.group(Api, "rentals", (handlers) =>
  handlers
    .handle("create", ({ payload }) =>
      Effect.gen(function* () {
        const rentalService = yield* RentalService;
        
        const input = new CreateRentalInput({
          filmId: payload.filmId,
          customerId: payload.customerId,
          storeId: payload.storeId,
          staffId: payload.staffId,
        });

        return yield* rentalService.createRental(input);
      }).pipe(
        Effect.mapError((err) => {
          const msg = err instanceof Error ? err.message : String(err);
          if (msg.includes("Customer") && msg.includes("not found")) {
            return new ApiCustomerNotFoundError({ message: msg, customerId: payload.customerId });
          }
          if (msg.includes("inactive")) {
            return new ApiCustomerNotFoundError({ message: msg, customerId: payload.customerId });
          }
          if (msg.includes("No available inventory")) {
            return new NoInventoryError({ message: msg, filmId: payload.filmId, storeId: payload.storeId });
          }
          return new RentalError({ message: "Failed to create rental" });
        })
      )
    )
    .handle("return", ({ path }) =>
      Effect.gen(function* () {
        const rentalService = yield* RentalService;
        return yield* rentalService.returnRental(path.rentalId);
      }).pipe(
        Effect.mapError((err) => {
          const msg = err instanceof Error ? err.message : String(err);
          if (msg.includes("not found")) {
            return new ApiRentalNotFoundError({ message: msg, rentalId: path.rentalId });
          }
          if (msg.includes("already returned")) {
            return new RentalError({ message: msg });
          }
          return new RentalError({ message: "Failed to return rental" });
        })
      )
    )
    .handle("getById", ({ path }) =>
      Effect.gen(function* () {
        const rentalService = yield* RentalService;
        const rental = yield* rentalService.getRentalById(path.rentalId);

        if (!rental) {
          return yield* Effect.fail(
            new ApiRentalNotFoundError({ message: "Rental not found", rentalId: path.rentalId })
          );
        }

        return rental;
      }).pipe(
        Effect.mapError(() =>
          new ApiRentalNotFoundError({ message: "Rental not found", rentalId: path.rentalId })
        )
      )
    )
    .handle("customerRentals", ({ path }) =>
      Effect.gen(function* () {
        const rentalService = yield* RentalService;
        return yield* rentalService.getCustomerRentals(path.customerId);
      }).pipe(
        Effect.mapError(() =>
          new ApiCustomerNotFoundError({ message: "Customer not found", customerId: path.customerId })
        )
      )
    )
    .handle("customerInfo", ({ path }) =>
      Effect.gen(function* () {
        const rentalService = yield* RentalService;
        const customer = yield* rentalService.getCustomer(path.customerId);

        if (!customer) {
          return yield* Effect.fail(
            new ApiCustomerNotFoundError({ message: "Customer not found", customerId: path.customerId })
          );
        }

        return customer;
      }).pipe(
        Effect.mapError(() =>
          new ApiCustomerNotFoundError({ message: "Customer not found", customerId: path.customerId })
        )
      )
    )
);
