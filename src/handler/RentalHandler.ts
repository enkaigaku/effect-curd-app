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
        Effect.mapError((err: any) => {
          // Check for Data.TaggedError by _tag
          if (err._tag === "CustomerNotFoundError") {
            return new ApiCustomerNotFoundError({ 
              message: `Customer ${payload.customerId} not found`, 
              customerId: payload.customerId 
            });
          }
          if (err._tag === "CustomerInactiveError") {
            return new ApiCustomerNotFoundError({ 
              message: `Customer ${payload.customerId} is inactive`, 
              customerId: payload.customerId 
            });
          }
          if (err._tag === "NoInventoryAvailableError") {
            return new NoInventoryError({ 
              message: `No available inventory for film ${payload.filmId} at store ${payload.storeId}`, 
              filmId: payload.filmId, 
              storeId: payload.storeId 
            });
          }
          // Fallback for other errors
          const msg = err instanceof Error ? err.message : String(err);
          return new RentalError({ message: msg || "Failed to create rental" });
        })
      )
    )
    .handle("return", ({ path }) =>
      Effect.gen(function* () {
        const rentalService = yield* RentalService;
        return yield* rentalService.returnRental(path.rentalId);
      }).pipe(
        Effect.mapError((err: any) => {
          // Check for Data.TaggedError by _tag
          if (err._tag === "RentalNotFoundError") {
            return new ApiRentalNotFoundError({ message: `Rental ${path.rentalId} not found`, rentalId: path.rentalId });
          }
          if (err._tag === "RentalAlreadyReturnedError") {
            return new RentalError({ message: `Rental ${path.rentalId} already returned` });
          }
          // Fallback for other errors
          const msg = err instanceof Error ? err.message : String(err);
          return new RentalError({ message: msg || "Failed to return rental" });
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
