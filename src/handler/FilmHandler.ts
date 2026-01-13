import { HttpApiBuilder } from "@effect/platform";
import { Effect } from "effect";
import { Api, FilmNotFoundError, DatabaseQueryError } from "../api/index.js";
import { FilmService } from "../service/FilmService.js";
import { FilmDetail, FilmSearchParams } from "../schema/Film.js";

// ============================================================
// Film Handler Implementation
// ============================================================

export const FilmHandler = HttpApiBuilder.group(Api, "films", (handlers) =>
  handlers
    .handle("list", ({ urlParams }) =>
      Effect.gen(function* () {
        const filmService = yield* FilmService;

        // Parse URL params (strings) to proper types
        const params = new FilmSearchParams({
          search: urlParams.search,
          categoryId: urlParams.categoryId ? Number(urlParams.categoryId) : undefined,
          rating: urlParams.rating as any,
          page: urlParams.page ? Number(urlParams.page) : 1,
          limit: urlParams.limit ? Number(urlParams.limit) : 20,
        });

        return yield* filmService.searchFilms(params);
      }).pipe(
        Effect.mapError(() => new DatabaseQueryError({ message: "Failed to fetch films" }))
      )
    )
    .handle("getById", ({ path }) =>
      Effect.gen(function* () {
        const filmService = yield* FilmService;
        const film = yield* filmService.getFilmById(path.filmId);

        if (!film) {
          return yield* Effect.fail(
            new FilmNotFoundError({ message: "Film not found", filmId: path.filmId })
          );
        }

        return new FilmDetail({
          filmId: film.filmId,
          title: film.title,
          description: film.description,
          releaseYear: film.releaseYear,
          languageId: film.languageId,
          originalLanguageId: film.originalLanguageId,
          rentalDuration: film.rentalDuration,
          rentalRate: film.rentalRate,
          length: film.length,
          replacementCost: film.replacementCost,
          rating: film.rating,
          specialFeatures: film.specialFeatures,
          lastUpdate: film.lastUpdate,
          languageName: film.languageName,
          categoryName: film.categoryName,
        });
      }).pipe(
        Effect.catchTag("SqlError", () =>
          Effect.fail(new DatabaseQueryError({ message: "Database error" }))
        )
      )
    )
    .handle("getActors", ({ path }) =>
      Effect.gen(function* () {
        const filmService = yield* FilmService;
        return yield* filmService.getFilmActors(path.filmId);
      }).pipe(
        Effect.mapError(() => new DatabaseQueryError({ message: "Failed to fetch actors" }))
      )
    )
    .handle("categories", () =>
      Effect.gen(function* () {
        const filmService = yield* FilmService;
        return yield* filmService.getCategories();
      }).pipe(
        Effect.mapError(() => new DatabaseQueryError({ message: "Failed to fetch categories" }))
      )
    )
);
