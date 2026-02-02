import { Effect } from "effect";
import { InventoryRepository } from "../repository/InventoryRepository.js";
import { FilmId, StoreId } from "../schema/Ids.js";

// ============================================================
// Inventory Service
// ============================================================

export class InventoryService extends Effect.Service<InventoryService>()("InventoryService", {
  effect: Effect.gen(function* () {
    const repo = yield* InventoryRepository;

    return {
      // Check film availability at a store
      checkAvailability: (filmId: FilmId, storeId: StoreId) =>
        Effect.gen(function* () {
          yield* Effect.logDebug(`Checking availability: film=${filmId}, store=${storeId}`);
          return yield* repo.getFilmAvailability(filmId, storeId);
        }),

      // Get availability across all stores
      checkAvailabilityAllStores: (filmId: FilmId) =>
        Effect.gen(function* () {
          yield* Effect.logDebug(`Checking availability for film=${filmId} at all stores`);
          return yield* repo.getFilmAvailabilityAllStores(filmId);
        }),

      // Find available inventory for rental
      findAvailableInventory: (filmId: FilmId, storeId: StoreId) =>
        Effect.gen(function* () {
          yield* Effect.logDebug(`Finding available inventory: film=${filmId}, store=${storeId}`);
          return yield* repo.findAvailableInventory(filmId, storeId);
        }),

      // Get all stores
      getStores: () =>
        Effect.gen(function* () {
          yield* Effect.logDebug("Getting all stores");
          return yield* repo.getStores();
        }),

      // Get store by ID
      getStoreById: (storeId: StoreId) =>
        Effect.gen(function* () {
          yield* Effect.logDebug(`Getting store: ${storeId}`);
          return yield* repo.getStoreById(storeId);
        }),
    };
  }),
  dependencies: [InventoryRepository.Default],
}) {}

