import { Schema } from "effect";

// ============================================================
// Store Schema
// ============================================================

export class Store extends Schema.Class<Store>("Store")({
  storeId: Schema.Number,
  managerStaffId: Schema.Number,
  addressId: Schema.Number,
  lastUpdate: Schema.Date,
}) {}

// Store with address info for display
export class StoreWithAddress extends Schema.Class<StoreWithAddress>("StoreWithAddress")({
  storeId: Schema.Number,
  address: Schema.String,
  city: Schema.String,
  country: Schema.String,
  managerName: Schema.NullOr(Schema.String),
}) {}
