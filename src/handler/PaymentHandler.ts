import { HttpApiBuilder } from "@effect/platform";
import { Effect } from "effect";
import { Api, PaymentNotFoundError, InvalidPaymentError, PaymentError } from "../api/index.js";
import { PaymentService } from "../service/PaymentService.js";
import { CustomerBalance, CreatePaymentInput } from "../schema/Payment.js";
import { CustomerId } from "../schema/Ids.js";
import { requireStaff, requireAuth } from "../middleware/auth.js";

// ============================================================
// Payment Handler Implementation
// ============================================================

export const PaymentHandler = HttpApiBuilder.group(Api, "payments", (handlers) =>
  handlers
    // Protected: Staff only - create payment
    .handle("create", ({ payload }) =>
      Effect.gen(function* () {
        yield* requireStaff;
        
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
          if (err instanceof Error && err.message.includes("Authorization")) {
            return new PaymentError({ message: "Staff authentication required" });
          }
          if (err._tag === "InvalidPaymentAmountError") {
            return new InvalidPaymentError({ message: `Invalid payment amount: ${err.amount}` });
          }
          const msg = err instanceof Error ? err.message : String(err);
          return new PaymentError({ message: msg || "Failed to create payment" });
        })
      )
    )
    // Protected: requires authentication
    .handle("getById", ({ path }) =>
      Effect.gen(function* () {
        yield* requireAuth;
        
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
          if (err instanceof Error && err.message.includes("Authorization")) {
            return new PaymentError({ message: "Authentication required" });
          }
          if (err._tag === "PaymentNotFoundError") return err;
          return new PaymentNotFoundError({ message: "Payment not found", paymentId: path.paymentId });
        })
      )
    )
    // Protected: Customer can view own payments, Staff can view any
    .handle("customerPayments", ({ path }) =>
      Effect.gen(function* () {
        const user = yield* requireAuth;
        
        // Customer can only view their own payments
        if (user.type === "customer" && user.id !== path.customerId) {
          return yield* Effect.fail(new PaymentError({ message: "Access denied" }));
        }
        
        const paymentService = yield* PaymentService;
        return yield* paymentService.getCustomerPayments(path.customerId);
      }).pipe(
        Effect.mapError((err: any) => {
          if (err instanceof Error && err.message.includes("Authorization")) {
            return new PaymentError({ message: "Authentication required" });
          }
          if (err._tag === "PaymentError") return err;
          const msg = err instanceof Error ? err.message : String(err);
          return new PaymentError({ message: msg || "Failed to fetch payments" });
        })
      )
    )
    // Protected: Customer can view own balance, Staff can view any
    .handle("customerBalance", ({ path }) =>
      Effect.gen(function* () {
        const user = yield* requireAuth;
        
        // Customer can only view their own balance
        if (user.type === "customer" && user.id !== path.customerId) {
          return yield* Effect.fail(new PaymentError({ message: "Access denied" }));
        }
        
        const paymentService = yield* PaymentService;
        const balance = yield* paymentService.getCustomerBalance(path.customerId);

        if (!balance) {
          return new CustomerBalance({
            customerId: path.customerId as CustomerId,
            customerName: "Unknown",
            balance: 0,
          });
        }

        return balance;
      }).pipe(
        Effect.mapError((err: any) => {
          if (err instanceof Error && err.message.includes("Authorization")) {
            return new PaymentError({ message: "Authentication required" });
          }
          if (err._tag === "PaymentError") return err;
          const msg = err instanceof Error ? err.message : String(err);
          return new PaymentError({ message: msg || "Failed to fetch balance" });
        })
      )
    )
);
