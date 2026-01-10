import { Effect } from "effect";
import { User, UserWithPassword, CreateUserInput, UpdateUserInput } from "../schema/User.js";
import { UserRepository, UserNotFoundError, DatabaseError } from "../repository/UserRepository.js";

// ============================================================
// User Service (using Effect.Service pattern)
// ============================================================

export class UserService extends Effect.Service<UserService>()("UserService", {
  effect: Effect.gen(function* () {
    const repository = yield* UserRepository;

    const getAllUsers = (page: number, limit: number) =>
      Effect.gen(function* () {
        yield* Effect.logDebug(`Fetching users page=${page} limit=${limit}`);
        const offset = (page - 1) * limit;
        const { items, total } = yield* repository.findAll(limit, offset);

        yield* Effect.logDebug(`Found ${items.length} users (Total: ${total})`);

        return {
          items,
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        };
      }).pipe(Effect.withSpan("UserService.getAllUsers", { attributes: { page, limit } }));

    const getUserById = (id: number): Effect.Effect<User, UserNotFoundError | DatabaseError> =>
      Effect.gen(function* () {
        yield* Effect.logDebug(`Fetching user by id: ${id}`);
        const user = yield* repository.findById(id);
        yield* Effect.logDebug(`Found user: ${user.email}`);
        return user;
      }).pipe(Effect.withSpan("UserService.getUserById", { attributes: { userId: id } }));

    const getUserByEmail = (
      email: string,
    ): Effect.Effect<UserWithPassword, UserNotFoundError | DatabaseError> =>
      Effect.gen(function* () {
        yield* Effect.logDebug(`Fetching user by email: ${email}`);
        const user = yield* repository.findByEmail(email);
        yield* Effect.logDebug(`Found user: ${user.id}`);
        return user;
      }).pipe(Effect.withSpan("UserService.getUserByEmail", { attributes: { email } }));

    const createUser = (input: CreateUserInput): Effect.Effect<User, DatabaseError> =>
      Effect.gen(function* () {
        yield* Effect.logInfo(`Creating user with email: ${input.email}`);
        const user = yield* repository.create(input);
        yield* Effect.logInfo(`User created with id: ${user.id}`);
        return user;
      }).pipe(Effect.withSpan("UserService.createUser", { attributes: { email: input.email } }));

    const updateUser = (
      id: number,
      input: UpdateUserInput,
    ): Effect.Effect<User, UserNotFoundError | DatabaseError> =>
      Effect.gen(function* () {
        yield* Effect.logInfo(`Updating user id: ${id}`);
        const user = yield* repository.update(id, input);
        yield* Effect.logInfo(`User updated: ${user.email}`);
        return user;
      }).pipe(Effect.withSpan("UserService.updateUser", { attributes: { userId: id } }));

    const deleteUser = (id: number): Effect.Effect<void, UserNotFoundError | DatabaseError> =>
      Effect.gen(function* () {
        yield* Effect.logInfo(`Deleting user id: ${id}`);
        yield* repository.delete(id);
        yield* Effect.logInfo(`User deleted: ${id}`);
      }).pipe(Effect.withSpan("UserService.deleteUser", { attributes: { userId: id } }));

    return {
      getAllUsers,
      getUserById,
      getUserByEmail,
      createUser,
      updateUser,
      deleteUser,
    };
  }),
  dependencies: [],
}) {}
