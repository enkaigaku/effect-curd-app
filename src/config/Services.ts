import { Layer } from "effect"
import { AuthService } from "../service/AuthService.js"
import { UserService } from "../service/UserService.js"
import { FilmService } from "../service/FilmService.js"
import { UserRepository } from "../repository/UserRepository.js"
import { FilmRepository } from "../repository/FilmRepository.js"
import { DatabaseLive } from "./Database.js"

// ============================================================
// Application Services Layer
// ============================================================

// Layer dependency graph:
//   AuthService.Default
//   UserService.Default
//     └── UserRepository.Default
//           └── DatabaseLive
//   FilmService.Default
//     └── FilmRepository.Default
//           └── DatabaseLive

export const ServicesLive = Layer.mergeAll(
  AuthService.Default,
  UserService.Default.pipe(Layer.provide(UserRepository.Default)),
  FilmService.Default.pipe(Layer.provide(FilmRepository.Default))
).pipe(
  Layer.provide(UserRepository.Default),
  Layer.provide(FilmRepository.Default),
  Layer.provide(DatabaseLive)
)
