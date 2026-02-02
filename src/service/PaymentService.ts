import { Effect, Data } from "effect";
import { PaymentRepository } from "../repository/PaymentRepository.js";
import { CreatePaymentInput } from "../schema/Payment.js";
import { RentalId, CustomerId, PaymentId, StaffId } from "../schema/Ids.js";

// ============================================================
// Payment Service Errors
// ============================================================

export class RentalNotFoundError extends Data.TaggedError("RentalNotFoundError")<{
  readonly rentalId: RentalId;
}> {}

export class InvalidPaymentAmountError extends Data.TaggedError("InvalidPaymentAmountError")<{
  readonly amount: number;
}> {}

// ============================================================
// Payment Service
// ============================================================

export class PaymentService extends Effect.Service<PaymentService>()("PaymentService", {
  effect: Effect.gen(function* () {
    const repo = yield* PaymentRepository;

    return {
      // Create a payment
      createPayment: (input: CreatePaymentInput) =>
        Effect.gen(function* () {
          yield* Effect.logInfo(`Creating payment: rental=${input.rentalId}, amount=${input.amount}`);

          if (input.amount <= 0) {
            return yield* Effect.fail(new InvalidPaymentAmountError({ amount: input.amount }));
          }

          const payment = yield* repo.createPayment(
            input.customerId,
            input.rentalId,
            input.amount,
            input.staffId ?? (1 as StaffId)
          );

          yield* Effect.logInfo(`Payment created: id=${payment.paymentId}`);
          return payment;
        }),

      // Get customer balance
      getCustomerBalance: (customerId: CustomerId) =>
        Effect.gen(function* () {
          yield* Effect.logDebug(`Getting balance for customer: ${customerId}`);
          return yield* repo.getCustomerBalance(customerId);
        }),

      // Get customer payment history
      getCustomerPayments: (customerId: CustomerId, limit: number = 20) =>
        Effect.gen(function* () {
          yield* Effect.logDebug(`Getting payments for customer: ${customerId}`);
          return yield* repo.getCustomerPayments(customerId, limit);
        }),

      // Get payment by ID
      getPaymentById: (paymentId: PaymentId) =>
        Effect.gen(function* () {
          yield* Effect.logDebug(`Getting payment: ${paymentId}`);
          return yield* repo.findById(paymentId);
        }),
    };
  }),
  dependencies: [PaymentRepository.Default],
}) {}

