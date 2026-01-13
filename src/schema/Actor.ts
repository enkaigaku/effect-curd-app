import { Schema } from "effect";

// ============================================================
// Actor Schema
// ============================================================

export class Actor extends Schema.Class<Actor>("Actor")({
  actorId: Schema.Number,
  firstName: Schema.String,
  lastName: Schema.String,
  lastUpdate: Schema.Date,
}) {}

// Actor with full name computed
export class ActorWithName extends Schema.Class<ActorWithName>("ActorWithName")({
  actorId: Schema.Number,
  firstName: Schema.String,
  lastName: Schema.String,
  fullName: Schema.String,
}) {}
