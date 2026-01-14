import { Schema } from "effect";

// ============================================================
// Inventory Schema
// ============================================================

export class Inventory extends Schema.Class<Inventory>("Inventory")({
  inventoryId: Schema.Number,
  filmId: Schema.Number,
  storeId: Schema.Number,
  lastUpdate: Schema.Date,
}) {}

// Inventory with film title for display
export class InventoryWithFilm extends Schema.Class<InventoryWithFilm>("InventoryWithFilm")({
  inventoryId: Schema.Number,
  filmId: Schema.Number,
  filmTitle: Schema.String,
  storeId: Schema.Number,
  inStock: Schema.Boolean,
}) {}

// Film availability at a store
export class FilmAvailability extends Schema.Class<FilmAvailability>("FilmAvailability")({
  filmId: Schema.Number,
  filmTitle: Schema.String,
  storeId: Schema.Number,
  totalCopies: Schema.Number,
  availableCopies: Schema.Number,
}) {}
