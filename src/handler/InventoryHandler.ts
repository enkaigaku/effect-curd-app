import { HttpApiBuilder } from "@effect/platform";
import { Effect } from "effect";
import { Api, StoreNotFoundError, InventoryError } from "../api/index.js";
import { InventoryService } from "../service/InventoryService.js";
import { FilmAvailability } from "../schema/Inventory.js";
import { FilmId, StoreId } from "../schema/Ids.js";

// ============================================================
// Inventory Handler Implementation
// ============================================================

export const InventoryHandler = HttpApiBuilder.group(Api, "inventory", (handlers) =>
  handlers
    .handle("stores", () =>
      Effect.gen(function* () {
        const inventoryService = yield* InventoryService;
        return yield* inventoryService.getStores();
      }).pipe(
        Effect.mapError(() => new InventoryError({ message: "Failed to fetch stores" }))
      )
    )
    .handle("storeById", ({ path }) =>
      Effect.gen(function* () {
        const inventoryService = yield* InventoryService;
        const store = yield* inventoryService.getStoreById(path.storeId as StoreId);

        if (!store) {
          return yield* Effect.fail(
            new StoreNotFoundError({ message: "Store not found", storeId: path.storeId })
          );
        }

        return store;
      }).pipe(
        Effect.catchTag("SqlError", () =>
          Effect.fail(new InventoryError({ message: "Database error" }))
        )
      )
    )
    .handle("filmAvailability", ({ path }) =>
      Effect.gen(function* () {
        const inventoryService = yield* InventoryService;
        return yield* inventoryService.checkAvailabilityAllStores(path.filmId as FilmId);
      }).pipe(
        Effect.mapError(() => new InventoryError({ message: "Failed to check availability" }))
      )
    )
    .handle("filmAvailabilityAtStore", ({ path }) =>
      Effect.gen(function* () {
        const inventoryService = yield* InventoryService;
        const availability = yield* inventoryService.checkAvailability(path.filmId as FilmId, path.storeId as StoreId);

        if (!availability) {
          // Return empty availability if film doesn't exist at store
          return new FilmAvailability({
            filmId: path.filmId as FilmId,
            filmTitle: "Unknown",
            storeId: path.storeId as StoreId,
            totalCopies: 0,
            availableCopies: 0,
          });
        }

        return availability;
      }).pipe(
        Effect.mapError(() => new InventoryError({ message: "Failed to check availability" }))
      )
    )
);
