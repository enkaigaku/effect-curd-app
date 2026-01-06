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
      repository.findAll()

    const getUserById = (id: number): Effect.Effect<User, UserNotFoundError | DatabaseError> =>
      repository.findById(id)

    const createUser = (input: CreateUserInput): Effect.Effect<User, DatabaseError> =>
      repository.create(input)

    const updateUser = (id: number, input: UpdateUserInput): Effect.Effect<User, UserNotFoundError | DatabaseError> =>
      repository.update(id, input)

    const deleteUser = (id: number): Effect.Effect<void, UserNotFoundError | DatabaseError> =>
      repository.delete(id)

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
