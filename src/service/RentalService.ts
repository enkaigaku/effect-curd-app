import { Effect, Data } from "effect";
import { RentalRepository } from "../repository/RentalRepository.js";
import { InventoryRepository } from "../repository/InventoryRepository.js";
import { CreateRentalInput } from "../schema/Rental.js";

// ============================================================
// Rental Service Errors (Data.TaggedError)
// ============================================================

export class CustomerNotFoundError extends Data.TaggedError("CustomerNotFoundError")<{
  readonly customerId: number;
}> {}

export class CustomerInactiveError extends Data.TaggedError("CustomerInactiveError")<{
  readonly customerId: number;
}> {}

export class NoInventoryAvailableError extends Data.TaggedError("NoInventoryAvailableError")<{
  readonly filmId: number;
  readonly storeId: number;
}> {}

export class RentalNotFoundError extends Data.TaggedError("RentalNotFoundError")<{
  readonly rentalId: number;
}> {}

export class RentalAlreadyReturnedError extends Data.TaggedError("RentalAlreadyReturnedError")<{
  readonly rentalId: number;
}> {}

// ============================================================
// Rental Service
// ============================================================

export class RentalService extends Effect.Service<RentalService>()("RentalService", {
  effect: Effect.gen(function* () {
    const rentalRepo = yield* RentalRepository;
    const inventoryRepo = yield* InventoryRepository;

    return {
      // Create a new rental with validation
      createRental: (input: CreateRentalInput) =>
        Effect.gen(function* () {
          yield* Effect.logInfo(`Creating rental: film=${input.filmId}, customer=${input.customerId}, store=${input.storeId}`);

          // 1. Validate customer exists and is active
          const customer = yield* rentalRepo.getCustomer(input.customerId);
          if (!customer) {
            return yield* Effect.fail(new CustomerNotFoundError({ customerId: input.customerId }));
          }
          if (!customer.isActive) {
            return yield* Effect.fail(new CustomerInactiveError({ customerId: input.customerId }));
          }

          // 2. Find available inventory
          const inventoryId = yield* inventoryRepo.findAvailableInventory(input.filmId, input.storeId);
          if (!inventoryId) {
            return yield* Effect.fail(new NoInventoryAvailableError({ filmId: input.filmId, storeId: input.storeId }));
          }

          // 3. Create rental
          const rental = yield* rentalRepo.createRental(
            inventoryId,
            input.customerId,
            input.staffId ?? 1
          );

          yield* Effect.logInfo(`Rental created: id=${rental.rentalId}`);
          return rental;
        }),

      // Return a rental
      returnRental: (rentalId: number) =>
        Effect.gen(function* () {
          yield* Effect.logInfo(`Processing return: rentalId=${rentalId}`);

          const result = yield* rentalRepo.returnRental(rentalId).pipe(
            Effect.mapError((err) => {
              const msg = err instanceof Error ? err.message : String(err);
              if (msg.includes("not found")) {
                return new RentalNotFoundError({ rentalId });
              }
              if (msg.includes("already returned")) {
                return new RentalAlreadyReturnedError({ rentalId });
              }
              return err;
            })
          );

          yield* Effect.logInfo(`Rental returned: id=${rentalId}, lateFee=${result.lateFee}`);
          return result;
        }),

      // Get rental details
      getRentalById: (rentalId: number) =>
        Effect.gen(function* () {
          yield* Effect.logDebug(`Getting rental: ${rentalId}`);
          return yield* rentalRepo.findById(rentalId);
        }),

      // Get customer rental history
      getCustomerRentals: (customerId: number, limit: number = 20) =>
        Effect.gen(function* () {
          yield* Effect.logDebug(`Getting rentals for customer: ${customerId}`);
          return yield* rentalRepo.getCustomerRentals(customerId, limit);
        }),

      // Get customer info
      getCustomer: (customerId: number) =>
        Effect.gen(function* () {
          yield* Effect.logDebug(`Getting customer: ${customerId}`);
          return yield* rentalRepo.getCustomer(customerId);
        }),
    };
  }),
  dependencies: [RentalRepository.Default, InventoryRepository.Default],
}) {}
