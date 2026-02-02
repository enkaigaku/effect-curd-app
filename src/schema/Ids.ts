import { Schema } from "effect";

// ============================================================
// Branded ID Types
// ============================================================
// These provide compile-time safety to prevent mixing up IDs

export const CustomerId = Schema.Number.pipe(Schema.brand("CustomerId"));
export type CustomerId = Schema.Schema.Type<typeof CustomerId>;

export const StaffId = Schema.Number.pipe(Schema.brand("StaffId"));
export type StaffId = Schema.Schema.Type<typeof StaffId>;

export const FilmId = Schema.Number.pipe(Schema.brand("FilmId"));
export type FilmId = Schema.Schema.Type<typeof FilmId>;

export const CategoryId = Schema.Number.pipe(Schema.brand("CategoryId"));
export type CategoryId = Schema.Schema.Type<typeof CategoryId>;

export const ActorId = Schema.Number.pipe(Schema.brand("ActorId"));
export type ActorId = Schema.Schema.Type<typeof ActorId>;

export const StoreId = Schema.Number.pipe(Schema.brand("StoreId"));
export type StoreId = Schema.Schema.Type<typeof StoreId>;

export const InventoryId = Schema.Number.pipe(Schema.brand("InventoryId"));
export type InventoryId = Schema.Schema.Type<typeof InventoryId>;

export const RentalId = Schema.Number.pipe(Schema.brand("RentalId"));
export type RentalId = Schema.Schema.Type<typeof RentalId>;

export const PaymentId = Schema.Number.pipe(Schema.brand("PaymentId"));
export type PaymentId = Schema.Schema.Type<typeof PaymentId>;

export const AddressId = Schema.Number.pipe(Schema.brand("AddressId"));
export type AddressId = Schema.Schema.Type<typeof AddressId>;
