import { Layer } from "effect"
import { FilmService } from "../service/FilmService.js"
import { InventoryService } from "../service/InventoryService.js"
import { RentalService } from "../service/RentalService.js"
import { PaymentService } from "../service/PaymentService.js"
import { CustomerAuthService } from "../service/CustomerAuthService.js"
import { StaffAuthService } from "../service/StaffAuthService.js"
import { FilmRepository } from "../repository/FilmRepository.js"
import { InventoryRepository } from "../repository/InventoryRepository.js"
import { RentalRepository } from "../repository/RentalRepository.js"
import { PaymentRepository } from "../repository/PaymentRepository.js"
import { DatabaseLive } from "./Database.js"

// ============================================================
// Application Services Layer
// ============================================================

// Layer dependency graph:
//   FilmService.Default → FilmRepository.Default → DatabaseLive
//   InventoryService.Default → InventoryRepository.Default → DatabaseLive
//   RentalService.Default → RentalRepository.Default + InventoryRepository.Default → DatabaseLive
//   PaymentService.Default → PaymentRepository.Default → DatabaseLive
//   CustomerAuthService.Default → DatabaseLive
//   StaffAuthService.Default → DatabaseLive

export const ServicesLive = Layer.mergeAll(
  FilmService.Default.pipe(Layer.provide(FilmRepository.Default)),
  InventoryService.Default.pipe(Layer.provide(InventoryRepository.Default)),
  RentalService.Default.pipe(
    Layer.provide(RentalRepository.Default),
    Layer.provide(InventoryRepository.Default)
  ),
  PaymentService.Default.pipe(Layer.provide(PaymentRepository.Default)),
  CustomerAuthService.Default,
  StaffAuthService.Default
).pipe(
  Layer.provide(FilmRepository.Default),
  Layer.provide(InventoryRepository.Default),
  Layer.provide(RentalRepository.Default),
  Layer.provide(PaymentRepository.Default),
  Layer.provide(DatabaseLive)
)
