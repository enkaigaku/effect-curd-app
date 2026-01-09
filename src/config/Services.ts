import { Layer } from "effect"
import { AuthService } from "../service/AuthService.js"
import { UserService } from "../service/UserService.js"
import { UserRepository } from "../repository/UserRepository.js"
import { DatabaseLive } from "./Database.js"

// ============================================================
// Application Services Layer
// ============================================================

// Layer dependency graph:
//   AuthService.Default
//   UserService.Default
//     └── UserRepository.Default
//           └── DatabaseLive

export const ServicesLive = Layer.mergeAll(
  AuthService.Default,
  UserService.Default.pipe(Layer.provide(UserRepository.Default))
).pipe(
  Layer.provide(UserRepository.Default),
  Layer.provide(DatabaseLive)
)
