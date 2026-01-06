import { Context, Effect, Layer } from "effect"
import { User, CreateUserInput, UpdateUserInput } from "../schema/User.js"
import { UserRepositoryTag, UserNotFoundError, DatabaseError } from "../repository/UserRepository.js"

// ============================================================
// Service Interface
// ============================================================

export interface UserService {
  readonly getAllUsers: () => Effect.Effect<readonly User[], DatabaseError>
  readonly getUserById: (id: number) => Effect.Effect<User, UserNotFoundError | DatabaseError>
  readonly createUser: (input: CreateUserInput) => Effect.Effect<User, DatabaseError>
  readonly updateUser: (id: number, input: UpdateUserInput) => Effect.Effect<User, UserNotFoundError | DatabaseError>
  readonly deleteUser: (id: number) => Effect.Effect<void, UserNotFoundError | DatabaseError>
}

// ============================================================
// Service Tag (for dependency injection)
// ============================================================

export class UserServiceTag extends Context.Tag("UserService")<
  UserServiceTag,
  UserService
>() {}

// ============================================================
// Service Implementation
// ============================================================

export const UserServiceLive = Layer.effect(
  UserServiceTag,
  Effect.gen(function* () {
    const repository = yield* UserRepositoryTag

    const getAllUsers: UserService["getAllUsers"] = () =>
      repository.findAll()

    const getUserById: UserService["getUserById"] = (id) =>
      repository.findById(id)

    const createUser: UserService["createUser"] = (input) =>
      repository.create(input)

    const updateUser: UserService["updateUser"] = (id, input) =>
      repository.update(id, input)

    const deleteUser: UserService["deleteUser"] = (id) =>
      repository.delete(id)

    return {
      getAllUsers,
      getUserById,
      createUser,
      updateUser,
      deleteUser,
    } satisfies UserService
  })
)
