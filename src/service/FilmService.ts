import { Effect } from "effect";
import { FilmRepository } from "../repository/FilmRepository.js";
import { FilmSearchParams }from "../schema/Film.js";

// ============================================================
// Film Service
// ============================================================

export class FilmService extends Effect.Service<FilmService>()("FilmService", {
  effect: Effect.gen(function* () {
    const repo = yield* FilmRepository;

    return {
      // Get film by ID
      getFilmById: (filmId: number) =>
        Effect.gen(function* () {
          yield* Effect.logDebug(`Getting film by ID: ${filmId}`);
          const film = yield* repo.findById(filmId);
          if (!film) {
            yield* Effect.logWarning(`Film not found: ${filmId}`);
          }
          return film;
        }),

      // Search films with pagination
      searchFilms: (params: FilmSearchParams) =>
        Effect.gen(function* () {
          yield* Effect.logDebug(`Searching films with params: ${JSON.stringify(params)}`);
          return yield* repo.search(params);
        }),

      // Get actors for a film
      getFilmActors: (filmId: number) =>
        Effect.gen(function* () {
          yield* Effect.logDebug(`Getting actors for film: ${filmId}`);
          return yield* repo.getActorsByFilmId(filmId);
        }),

      // Get all categories
      getCategories: () =>
        Effect.gen(function* () {
          yield* Effect.logDebug("Getting all categories");
          return yield* repo.getCategories();
        }),
    };
  }),
  dependencies: [FilmRepository.Default],
}) {}
