import { Schema } from "effect";

// ============================================================
// Customer Schemas
// ============================================================

export class Customer extends Schema.Class<Customer>("Customer")({
  customerId: Schema.Number,
  storeId: Schema.Number,
  firstName: Schema.String,
  lastName: Schema.String,
  email: Schema.NullOr(Schema.String),
  addressId: Schema.Number,
  activebool: Schema.Boolean,
  createDate: Schema.Date,
  lastUpdate: Schema.NullOr(Schema.Date),
  active: Schema.NullOr(Schema.Number),
}) {}

// Customer with full name for display
export class CustomerInfo extends Schema.Class<CustomerInfo>("CustomerInfo")({
  customerId: Schema.Number,
  fullName: Schema.String,
  email: Schema.NullOr(Schema.String),
  storeId: Schema.Number,
  isActive: Schema.Boolean,
}) {}
