import { Schema } from "effect";

// ============================================================
// Rental Schemas
// ============================================================

export class Rental extends Schema.Class<Rental>("Rental")({
  rentalId: Schema.Number,
  rentalDate: Schema.Date,
  inventoryId: Schema.Number,
  customerId: Schema.Number,
  returnDate: Schema.NullOr(Schema.Date),
  staffId: Schema.Number,
  lastUpdate: Schema.Date,
}) {}

// Rental with film and customer info for display
export class RentalDetail extends Schema.Class<RentalDetail>("RentalDetail")({
  rentalId: Schema.Number,
  rentalDate: Schema.Date,
  returnDate: Schema.NullOr(Schema.Date),
  filmTitle: Schema.String,
  customerName: Schema.String,
  customerEmail: Schema.NullOr(Schema.String),
  storeName: Schema.String,
  isReturned: Schema.Boolean,
}) {}

// Input for creating a rental
export class CreateRentalInput extends Schema.Class<CreateRentalInput>("CreateRentalInput")({
  filmId: Schema.Number,
  customerId: Schema.Number,
  storeId: Schema.Number,
  staffId: Schema.optionalWith(Schema.Number, { default: () => 1 }),
}) {}

// Rental response after creation
export class RentalCreated extends Schema.Class<RentalCreated>("RentalCreated")({
  rentalId: Schema.Number,
  rentalDate: Schema.Date,
  inventoryId: Schema.Number,
  filmTitle: Schema.String,
  customerId: Schema.Number,
  dueDate: Schema.Date,
}) {}

// Return rental response
export class RentalReturned extends Schema.Class<RentalReturned>("RentalReturned")({
  rentalId: Schema.Number,
  returnDate: Schema.Date,
  rentalDays: Schema.Number,
  lateFee: Schema.Number,
}) {}
