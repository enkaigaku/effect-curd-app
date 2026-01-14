import { HttpApiBuilder } from "@effect/platform";
import { Effect } from "effect";
import { Api, PaymentNotFoundError, InvalidPaymentError, PaymentError } from "../api/index.js";
import { PaymentService } from "../service/PaymentService.js";
import { CreatePaymentInput } from "../schema/Payment.js";
import { CustomerBalance } from "../schema/Payment.js";

// ============================================================
// Payment Handler Implementation
// ============================================================

export const PaymentHandler = HttpApiBuilder.group(Api, "payments", (handlers) =>
  handlers
    .handle("create", ({ payload }) =>
      Effect.gen(function* () {
        const paymentService = yield* PaymentService;
        
        const input = new CreatePaymentInput({
          customerId: payload.customerId,
          rentalId: payload.rentalId,
          amount: payload.amount,
          staffId: payload.staffId,
        });

        return yield* paymentService.createPayment(input);
      }).pipe(
        Effect.mapError((err: any) => {
          if (err._tag === "InvalidPaymentAmountError") {
            return new InvalidPaymentError({ message: `Invalid payment amount: ${err.amount}` });
          }
          const msg = err instanceof Error ? err.message : String(err);
          return new PaymentError({ message: msg || "Failed to create payment" });
        })
      )
    )
    .handle("getById", ({ path }) =>
      Effect.gen(function* () {
        const paymentService = yield* PaymentService;
        const payment = yield* paymentService.getPaymentById(path.paymentId);

        if (!payment) {
          return yield* Effect.fail(
            new PaymentNotFoundError({ message: "Payment not found", paymentId: path.paymentId })
          );
        }

        return payment;
      }).pipe(
        Effect.mapError((err: any) => {
          if (err._tag === "PaymentNotFoundError") return err;
          return new PaymentNotFoundError({ message: "Payment not found", paymentId: path.paymentId });
        })
      )
    )
    .handle("customerPayments", ({ path }) =>
      Effect.gen(function* () {
        const paymentService = yield* PaymentService;
        return yield* paymentService.getCustomerPayments(path.customerId);
      }).pipe(
        Effect.mapError((err: any) => {
          const msg = err instanceof Error ? err.message : String(err);
          return new PaymentError({ message: msg || "Failed to fetch payments" });
        })
      )
    )
    .handle("customerBalance", ({ path }) =>
      Effect.gen(function* () {
        const paymentService = yield* PaymentService;
        const balance = yield* paymentService.getCustomerBalance(path.customerId);

        if (!balance) {
          // Return zero balance if customer not found
          return new CustomerBalance({
            customerId: path.customerId,
            customerName: "Unknown",
            balance: 0,
          });
        }

        return balance;
      }).pipe(
        Effect.mapError((err: any) => {
          const msg = err instanceof Error ? err.message : String(err);
          return new PaymentError({ message: msg || "Failed to fetch balance" });
        })
      )
    )
);
