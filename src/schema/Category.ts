import { Schema } from "effect";

// ============================================================
// Category Schema
// ============================================================

export class Category extends Schema.Class<Category>("Category")({
  categoryId: Schema.Number,
  name: Schema.String,
  lastUpdate: Schema.Date,
}) {}
