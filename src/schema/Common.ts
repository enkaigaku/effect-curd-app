import { Schema } from "effect";

// ============================================================
// Pagination Query Parameters
// ============================================================

export class PaginationQuery extends Schema.Class<PaginationQuery>("PaginationQuery")({
  page: Schema.optional(Schema.NumberFromString.pipe(Schema.int(), Schema.positive())),
  limit: Schema.optional(
    Schema.NumberFromString.pipe(Schema.int(), Schema.positive(), Schema.lessThanOrEqualTo(100)),
  ),
}) {}

// ============================================================
// Generic Paginated Response (Helper to create schemas)
// ============================================================

export const PaginatedResponse = <A, I>(itemSchema: Schema.Schema<A, I>) =>
  Schema.Struct({
    items: Schema.Array(itemSchema),
    total: Schema.Number,
    page: Schema.Number,
    limit: Schema.Number,
    totalPages: Schema.Number,
  });
