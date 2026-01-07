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
      Effect.gen(function* () {
        yield* Effect.logDebug("Fetching all users")
        const users = yield* repository.findAll()
        yield* Effect.logDebug(`Found ${users.length} users`)
        return users
      }).pipe(
        Effect.withSpan("UserService.getAllUsers")
      )

    const getUserById = (id: number): Effect.Effect<User, UserNotFoundError | DatabaseError> =>
      Effect.gen(function* () {
        yield* Effect.logDebug(`Fetching user by id: ${id}`)
        const user = yield* repository.findById(id)
        yield* Effect.logDebug(`Found user: ${user.email}`)
        return user
      }).pipe(
        Effect.withSpan("UserService.getUserById", { attributes: { userId: id } })
      )

    const createUser = (input: CreateUserInput): Effect.Effect<User, DatabaseError> =>
      Effect.gen(function* () {
        yield* Effect.logInfo(`Creating user with email: ${input.email}`)
        const user = yield* repository.create(input)
        yield* Effect.logInfo(`User created with id: ${user.id}`)
        return user
      }).pipe(
        Effect.withSpan("UserService.createUser", { attributes: { email: input.email } })
      )

    const updateUser = (id: number, input: UpdateUserInput): Effect.Effect<User, UserNotFoundError | DatabaseError> =>
      Effect.gen(function* () {
        yield* Effect.logInfo(`Updating user id: ${id}`)
        const user = yield* repository.update(id, input)
        yield* Effect.logInfo(`User updated: ${user.email}`)
        return user
      }).pipe(
        Effect.withSpan("UserService.updateUser", { attributes: { userId: id } })
      )

    const deleteUser = (id: number): Effect.Effect<void, UserNotFoundError | DatabaseError> =>
      Effect.gen(function* () {
        yield* Effect.logInfo(`Deleting user id: ${id}`)
        yield* repository.delete(id)
        yield* Effect.logInfo(`User deleted: ${id}`)
      }).pipe(
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
