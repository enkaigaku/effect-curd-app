import { describe, it, expect } from "bun:test";
import { Effect, Layer } from "effect";
import { UserService } from "./UserService.js";
import { UserRepository } from "../repository/UserRepository.js";
import { User } from "../schema/User.js";

describe("UserService", () => {
  it("should return paginated users", async () => {
    const mockUsers = [
      new User({
        id: 1,
        name: "Alice",
        email: "alice@example.com",
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      new User({
        id: 2,
        name: "Bob",
        email: "bob@example.com",
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    ];
    const total = 10;

    const MockRepo = Layer.succeed(
      UserRepository,
      UserRepository.of({
        _tag: "UserRepository",
        findAll: (_limit, _offset) => Effect.succeed({ items: mockUsers, total }),
        findById: () => Effect.die("Unused"),
        findByEmail: () => Effect.die("Unused"),
        create: () => Effect.die("Unused"),
        update: () => Effect.die("Unused"),
        delete: () => Effect.die("Unused"),
      }),
    );

    const program = Effect.gen(function* () {
      const service = yield* UserService;
      const result = yield* service.getAllUsers(1, 10);

      expect(result.items.length).toBe(2);
      expect(result.total).toBe(10);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.totalPages).toBe(1);
    });

    const runnable = program.pipe(Effect.provide(UserService.Default), Effect.provide(MockRepo));

    await Effect.runPromise(runnable);
  });

  it("should calculate pages correctly", async () => {
    const MockRepo = Layer.succeed(
      UserRepository,
      UserRepository.of({
        _tag: "UserRepository",
        findAll: () => Effect.succeed({ items: [], total: 25 }),
        findById: () => Effect.die("Unused"),
        findByEmail: () => Effect.die("Unused"),
        create: () => Effect.die("Unused"),
        update: () => Effect.die("Unused"),
        delete: () => Effect.die("Unused"),
      }),
    );

    const program = Effect.gen(function* () {
      const service = yield* UserService;
      const result = yield* service.getAllUsers(2, 10);

      expect(result.total).toBe(25);
      expect(result.totalPages).toBe(3); // ceil(25/10) = 3
    });

    await Effect.runPromise(program.pipe(Effect.provide(UserService.Default), Effect.provide(MockRepo)));
  });
});
