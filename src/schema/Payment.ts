import { Schema } from "effect";

// ============================================================
// Payment Schemas
// ============================================================

export class Payment extends Schema.Class<Payment>("Payment")({
  paymentId: Schema.Number,
  customerId: Schema.Number,
  staffId: Schema.Number,
  rentalId: Schema.Number,
  amount: Schema.Number,
  paymentDate: Schema.Date,
}) {}

// Payment with rental info for display
export class PaymentDetail extends Schema.Class<PaymentDetail>("PaymentDetail")({
  paymentId: Schema.Number,
  customerId: Schema.Number,
  customerName: Schema.String,
  rentalId: Schema.Number,
  filmTitle: Schema.String,
  amount: Schema.Number,
  paymentDate: Schema.Date,
}) {}

// Input for creating a payment
export class CreatePaymentInput extends Schema.Class<CreatePaymentInput>("CreatePaymentInput")({
  customerId: Schema.Number,
  rentalId: Schema.Number,
  amount: Schema.Number,
  staffId: Schema.optionalWith(Schema.Number, { default: () => 1 }),
}) {}

// Payment response after creation
export class PaymentCreated extends Schema.Class<PaymentCreated>("PaymentCreated")({
  paymentId: Schema.Number,
  customerId: Schema.Number,
  rentalId: Schema.Number,
  amount: Schema.Number,
  paymentDate: Schema.Date,
}) {}

// Customer balance response
export class CustomerBalance extends Schema.Class<CustomerBalance>("CustomerBalance")({
  customerId: Schema.Number,
  customerName: Schema.String,
  balance: Schema.Number,
}) {}
