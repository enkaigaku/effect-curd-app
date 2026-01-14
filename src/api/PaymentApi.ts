import { HttpApiEndpoint, HttpApiGroup, HttpApiSchema, OpenApi } from "@effect/platform";
import { Schema } from "effect";
import { PaymentDetail, CreatePaymentInput, PaymentCreated, CustomerBalance } from "../schema/Payment.js";

// ============================================================
// Payment API Error Schemas
// ============================================================

export class PaymentNotFoundError extends Schema.TaggedError<PaymentNotFoundError>()(
  "PaymentNotFoundError",
  { message: Schema.String, paymentId: Schema.Number },
  HttpApiSchema.annotations({ status: 404 })
) {}

export class InvalidPaymentError extends Schema.TaggedError<InvalidPaymentError>()(
  "InvalidPaymentError",
  { message: Schema.String },
  HttpApiSchema.annotations({ status: 400 })
) {}

export class PaymentError extends Schema.TaggedError<PaymentError>()(
  "PaymentError",
  { message: Schema.String },
  HttpApiSchema.annotations({ status: 500 })
) {}

// ============================================================
// Payment API Definition
// ============================================================

export class PaymentApi extends HttpApiGroup.make("payments")
  .add(
    HttpApiEndpoint.post("create", "/payments")
      .addSuccess(PaymentCreated)
      .addError(InvalidPaymentError)
      .addError(PaymentError)
      .setPayload(CreatePaymentInput)
      .annotate(OpenApi.Summary, "Create a payment")
      .annotate(OpenApi.Description, "Record a payment for a rental.")
  )
  .add(
    HttpApiEndpoint.get("getById", "/payments/:paymentId")
      .addSuccess(PaymentDetail)
      .addError(PaymentNotFoundError)
      .setPath(Schema.Struct({ paymentId: Schema.NumberFromString }))
      .annotate(OpenApi.Summary, "Get payment details")
      .annotate(OpenApi.Description, "Get detailed information about a specific payment.")
  )
  .add(
    HttpApiEndpoint.get("customerPayments", "/customers/:customerId/payments")
      .addSuccess(Schema.Array(PaymentDetail))
      .addError(PaymentError)
      .setPath(Schema.Struct({ customerId: Schema.NumberFromString }))
      .annotate(OpenApi.Summary, "Get customer payment history")
      .annotate(OpenApi.Description, "Get payment history for a specific customer.")
  )
  .add(
    HttpApiEndpoint.get("customerBalance", "/customers/:customerId/balance")
      .addSuccess(CustomerBalance)
      .addError(PaymentError)
      .setPath(Schema.Struct({ customerId: Schema.NumberFromString }))
      .annotate(OpenApi.Summary, "Get customer balance")
      .annotate(OpenApi.Description, "Get outstanding balance for a customer.")
  ) {}
