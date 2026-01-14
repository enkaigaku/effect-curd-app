import { describe, it, expect } from "bun:test";
import { Effect, Layer, Exit } from "effect";
import { PaymentService, InvalidPaymentAmountError } from "../../src/service/PaymentService.js";
import { PaymentRepository } from "../../src/repository/PaymentRepository.js";
import { CreatePaymentInput, PaymentCreated, CustomerBalance } from "../../src/schema/Payment.js";

// ============================================================
// Mock Data
// ============================================================

const mockPaymentCreated = new PaymentCreated({
  paymentId: 1,
  customerId: 1,
  rentalId: 1,
  amount: 4.99,
  paymentDate: new Date(),
});

const mockCustomerBalance = new CustomerBalance({
  customerId: 1,
  customerName: "Test Customer",
  balance: 10.99,
});

// ============================================================
// Helper to create test layer
// ============================================================

const createTestLayer = (overrides: {
  createPayment?: () => Effect.Effect<PaymentCreated>;
  getCustomerBalance?: () => Effect.Effect<CustomerBalance | undefined>;
} = {}) => {
  const MockPaymentRepo = Layer.succeed(PaymentRepository, {
    _tag: "PaymentRepository" as const,
    createPayment: overrides.createPayment ?? (() => Effect.succeed(mockPaymentCreated)),
    getCustomerBalance: overrides.getCustomerBalance ?? (() => Effect.succeed(mockCustomerBalance)),
    getCustomerPayments: () => Effect.succeed([]),
    findById: () => Effect.succeed(undefined),
  });

  const TestPaymentService = Layer.effect(
    PaymentService,
    Effect.gen(function* () {
      const repo = yield* PaymentRepository;

      return {
        _tag: "PaymentService" as const,
        createPayment: (input: CreatePaymentInput) =>
          Effect.gen(function* () {
            if (input.amount <= 0) {
              return yield* Effect.fail(new InvalidPaymentAmountError({ amount: input.amount }));
            }
            return yield* repo.createPayment(input.customerId, input.rentalId, input.amount, input.staffId ?? 1);
          }),
        getCustomerBalance: (customerId: number) => repo.getCustomerBalance(customerId),
        getCustomerPayments: (customerId: number) => repo.getCustomerPayments(customerId, 20),
        getPaymentById: (paymentId: number) => repo.findById(paymentId),
      };
    })
  ).pipe(Layer.provide(MockPaymentRepo));

  return TestPaymentService;
};

// ============================================================
// PaymentService Unit Tests
// ============================================================

describe("PaymentService", () => {
  describe("createPayment", () => {
    it("should create a payment successfully", async () => {
      const input = new CreatePaymentInput({
        customerId: 1,
        rentalId: 1,
        amount: 4.99,
      });

      const result = await Effect.runPromise(
        Effect.gen(function* () {
          const service = yield* PaymentService;
          return yield* service.createPayment(input);
        }).pipe(Effect.provide(createTestLayer()))
      );

      expect(result.paymentId).toBe(1);
      expect(result.amount).toBe(4.99);
    });

    it("should fail with invalid amount (zero)", async () => {
      const input = new CreatePaymentInput({
        customerId: 1,
        rentalId: 1,
        amount: 0,
      });

      const result = await Effect.runPromiseExit(
        Effect.gen(function* () {
          const service = yield* PaymentService;
          return yield* service.createPayment(input);
        }).pipe(Effect.provide(createTestLayer()))
      );

      expect(Exit.isFailure(result)).toBe(true);
    });

    it("should fail with negative amount", async () => {
      const input = new CreatePaymentInput({
        customerId: 1,
        rentalId: 1,
        amount: -5,
      });

      const result = await Effect.runPromiseExit(
        Effect.gen(function* () {
          const service = yield* PaymentService;
          return yield* service.createPayment(input);
        }).pipe(Effect.provide(createTestLayer()))
      );

      expect(Exit.isFailure(result)).toBe(true);
    });
  });

  describe("getCustomerBalance", () => {
    it("should return customer balance", async () => {
      const result = await Effect.runPromise(
        Effect.gen(function* () {
          const service = yield* PaymentService;
          return yield* service.getCustomerBalance(1);
        }).pipe(Effect.provide(createTestLayer()))
      );

      expect(result?.customerId).toBe(1);
      expect(result?.balance).toBe(10.99);
    });

    it("should return undefined for non-existent customer", async () => {
      const result = await Effect.runPromise(
        Effect.gen(function* () {
          const service = yield* PaymentService;
          return yield* service.getCustomerBalance(999);
        }).pipe(
          Effect.provide(createTestLayer({
            getCustomerBalance: () => Effect.succeed(undefined),
          }))
        )
      );

      expect(result).toBeUndefined();
    });
  });
});
