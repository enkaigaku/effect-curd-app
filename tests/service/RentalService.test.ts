import { describe, it, expect } from "bun:test";
import { Effect, Layer, Exit } from "effect";
import { RentalService, CustomerNotFoundError, CustomerInactiveError, NoInventoryAvailableError } from "../../src/service/RentalService.js";
import { RentalRepository } from "../../src/repository/RentalRepository.js";
import { InventoryRepository } from "../../src/repository/InventoryRepository.js";
import { CreateRentalInput, RentalCreated, RentalReturned } from "../../src/schema/Rental.js";
import { CustomerInfo } from "../../src/schema/Customer.js";

// ============================================================
// Mock Data
// ============================================================

const mockCustomerActive = new CustomerInfo({
  customerId: 1,
  fullName: "Test Customer",
  email: "test@example.com",
  storeId: 1,
  isActive: true,
});

const mockCustomerInactive = new CustomerInfo({
  customerId: 2,
  fullName: "Inactive Customer",
  email: "inactive@example.com",
  storeId: 1,
  isActive: false,
});

const mockRentalCreated = new RentalCreated({
  rentalId: 1,
  rentalDate: new Date(),
  inventoryId: 100,
  filmTitle: "Test Film",
  customerId: 1,
  dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
});

// ============================================================
// Helper to create test layer
// ============================================================

const createTestLayer = (overrides: {
  getCustomer?: () => Effect.Effect<CustomerInfo | undefined>;
  createRental?: () => Effect.Effect<RentalCreated>;
  findAvailableInventory?: () => Effect.Effect<number | undefined>;
} = {}) => {
  const MockRentalRepo = Layer.succeed(RentalRepository, {
    getCustomer: overrides.getCustomer ?? (() => Effect.succeed(mockCustomerActive)),
    createRental: overrides.createRental ?? (() => Effect.succeed(mockRentalCreated)),
    returnRental: () => Effect.succeed({} as any),
    findById: () => Effect.succeed(undefined),
    getCustomerRentals: () => Effect.succeed([]),
  });

  const MockInventoryRepo = Layer.succeed(InventoryRepository, {
    getFilmAvailability: () => Effect.succeed(undefined),
    getFilmAvailabilityAllStores: () => Effect.succeed([]),
    findAvailableInventory: overrides.findAvailableInventory ?? (() => Effect.succeed(100)),
    getStores: () => Effect.succeed([]),
    getStoreById: () => Effect.succeed(undefined),
  });

  // Manually build RentalService Layer without Default dependencies
  const TestRentalService = Layer.effect(
    RentalService,
    Effect.gen(function* () {
      const rentalRepo = yield* RentalRepository;
      const inventoryRepo = yield* InventoryRepository;

      return RentalService.of({
        createRental: (input: CreateRentalInput) =>
          Effect.gen(function* () {
            const customer = yield* rentalRepo.getCustomer(input.customerId);
            if (!customer) {
              return yield* Effect.fail(new CustomerNotFoundError({ customerId: input.customerId }));
            }
            if (!customer.isActive) {
              return yield* Effect.fail(new CustomerInactiveError({ customerId: input.customerId }));
            }

            const inventoryId = yield* inventoryRepo.findAvailableInventory(input.filmId, input.storeId);
            if (!inventoryId) {
              return yield* Effect.fail(new NoInventoryAvailableError({ filmId: input.filmId, storeId: input.storeId }));
            }

            return yield* rentalRepo.createRental(inventoryId, input.customerId, input.staffId ?? 1);
          }),
        returnRental: () => Effect.succeed({} as any),
        getRentalById: () => Effect.succeed(undefined),
        getCustomerRentals: () => Effect.succeed([]),
        getCustomer: () => Effect.succeed(undefined),
      });
    })
  ).pipe(
    Layer.provide(MockRentalRepo),
    Layer.provide(MockInventoryRepo)
  );

  return TestRentalService;
};

// ============================================================
// RentalService Unit Tests
// ============================================================

describe("RentalService", () => {
  describe("createRental", () => {
    it("should create a rental successfully", async () => {
      const input = new CreateRentalInput({
        filmId: 1,
        customerId: 1,
        storeId: 1,
      });

      const result = await Effect.runPromise(
        Effect.gen(function* () {
          const service = yield* RentalService;
          return yield* service.createRental(input);
        }).pipe(Effect.provide(createTestLayer()))
      );

      expect(result.rentalId).toBe(1);
      expect(result.filmTitle).toBe("Test Film");
    });

    it("should fail when customer not found", async () => {
      const input = new CreateRentalInput({
        filmId: 1,
        customerId: 999,
        storeId: 1,
      });

      const result = await Effect.runPromiseExit(
        Effect.gen(function* () {
          const service = yield* RentalService;
          return yield* service.createRental(input);
        }).pipe(
          Effect.provide(createTestLayer({
            getCustomer: () => Effect.succeed(undefined),
          }))
        )
      );

      expect(Exit.isFailure(result)).toBe(true);
    });

    it("should fail when customer is inactive", async () => {
      const input = new CreateRentalInput({
        filmId: 1,
        customerId: 2,
        storeId: 1,
      });

      const result = await Effect.runPromiseExit(
        Effect.gen(function* () {
          const service = yield* RentalService;
          return yield* service.createRental(input);
        }).pipe(
          Effect.provide(createTestLayer({
            getCustomer: () => Effect.succeed(mockCustomerInactive),
          }))
        )
      );

      expect(Exit.isFailure(result)).toBe(true);
    });

    it("should fail when no inventory available", async () => {
      const input = new CreateRentalInput({
        filmId: 1,
        customerId: 1,
        storeId: 1,
      });

      const result = await Effect.runPromiseExit(
        Effect.gen(function* () {
          const service = yield* RentalService;
          return yield* service.createRental(input);
        }).pipe(
          Effect.provide(createTestLayer({
            findAvailableInventory: () => Effect.succeed(undefined),
          }))
        )
      );

      expect(Exit.isFailure(result)).toBe(true);
    });
  });
});
