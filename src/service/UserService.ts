import { Effect } from "effect"
import { User, CreateUserInput, UpdateUserInput } from "../schema/User.js"
import { UserRepository, UserNotFoundError, DatabaseError } from "../repository/UserRepository.js"

// ============================================================
// User Service (using Effect.Service pattern)
// ============================================================

export class UserService extends Effect.Service<UserService>()("UserService", {
  effect: Effect.gen(function* () {
    const repository = yield* UserRepository

    const getAllUsers = (): Effect.Effect<readonly User[], DatabaseError> =>
      repository.findAll().pipe(
        Effect.withSpan("UserService.getAllUsers")
      )

    const getUserById = (id: number): Effect.Effect<User, UserNotFoundError | DatabaseError> =>
      repository.findById(id).pipe(
        Effect.withSpan("UserService.getUserById", { attributes: { userId: id } })
      )

    const createUser = (input: CreateUserInput): Effect.Effect<User, DatabaseError> =>
      repository.create(input).pipe(
        Effect.withSpan("UserService.createUser", { attributes: { email: input.email } })
      )

    const updateUser = (id: number, input: UpdateUserInput): Effect.Effect<User, UserNotFoundError | DatabaseError> =>
      repository.update(id, input).pipe(
        Effect.withSpan("UserService.updateUser", { attributes: { userId: id } })
      )

    const deleteUser = (id: number): Effect.Effect<void, UserNotFoundError | DatabaseError> =>
      repository.delete(id).pipe(
        Effect.withSpan("UserService.deleteUser", { attributes: { userId: id } })
      )

    return {
      getAllUsers,
      getUserById,
      createUser,
      updateUser,
      deleteUser,
    }
  }),
  dependencies: [UserRepository.Default],
}) {}
