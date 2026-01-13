import { HttpApiEndpoint, HttpApiGroup, HttpApiSchema, OpenApi } from "@effect/platform";
import { Schema } from "effect";
import { FilmDetail, PaginatedFilms } from "../schema/Film.js";
import { ActorWithName } from "../schema/Actor.js";
import { Category } from "../schema/Category.js";

// ============================================================
// Film API Error Schemas
// ============================================================

export class FilmNotFoundError extends Schema.TaggedError<FilmNotFoundError>()(
  "FilmNotFoundError",
  { message: Schema.String, filmId: Schema.Number },
  HttpApiSchema.annotations({ status: 404 })
) {}

export class DatabaseQueryError extends Schema.TaggedError<DatabaseQueryError>()(
  "DatabaseQueryError",
  { message: Schema.String },
  HttpApiSchema.annotations({ status: 500 })
) {}

// URL params must be string-encodeable
const FilmListParams = Schema.Struct({
  search: Schema.optional(Schema.String),
  categoryId: Schema.optional(Schema.String),
  rating: Schema.optional(Schema.String),
  page: Schema.optional(Schema.String),
  limit: Schema.optional(Schema.String),
});

// ============================================================
// Film API Definition
// ============================================================

export class FilmApi extends HttpApiGroup.make("films")
  .add(
    HttpApiEndpoint.get("list", "/films")
      .addSuccess(PaginatedFilms)
      .addError(DatabaseQueryError)
      .setUrlParams(FilmListParams)
      .annotate(OpenApi.Summary, "List all films")
      .annotate(OpenApi.Description, "Get a paginated list of films. Supports filtering by category, rating, and search term.")
  )
  .add(
    HttpApiEndpoint.get("getById", "/films/:filmId")
      .addSuccess(FilmDetail)
      .addError(FilmNotFoundError)
      .addError(DatabaseQueryError)
      .setPath(Schema.Struct({ filmId: Schema.NumberFromString }))
      .annotate(OpenApi.Summary, "Get film details")
      .annotate(OpenApi.Description, "Get detailed information about a specific film including language and category.")
  )
  .add(
    HttpApiEndpoint.get("getActors", "/films/:filmId/actors")
      .addSuccess(Schema.Array(ActorWithName))
      .addError(FilmNotFoundError)
      .addError(DatabaseQueryError)
      .setPath(Schema.Struct({ filmId: Schema.NumberFromString }))
      .annotate(OpenApi.Summary, "Get film actors")
      .annotate(OpenApi.Description, "Get the list of actors appearing in a specific film.")
  )
  .add(
    HttpApiEndpoint.get("categories", "/categories")
      .addSuccess(Schema.Array(Category))
      .addError(DatabaseQueryError)
      .annotate(OpenApi.Summary, "List all categories")
      .annotate(OpenApi.Description, "Get a list of all film categories.")
  ) {}
