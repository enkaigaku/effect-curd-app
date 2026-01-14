import { Effect } from "effect";
import { SqlClient } from "@effect/sql";
import { PaymentDetail, PaymentCreated, CustomerBalance } from "../schema/Payment.js";

// ============================================================
// Payment Repository
// ============================================================

export class PaymentRepository extends Effect.Service<PaymentRepository>()("PaymentRepository", {
  effect: Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient;

    return {
      // Create a payment
      createPayment: (customerId: number, rentalId: number, amount: number, staffId: number) =>
        Effect.gen(function* () {
          const paymentDate = new Date();

          const rows = yield* sql`
            INSERT INTO payment (customer_id, staff_id, rental_id, amount, payment_date)
            VALUES (${customerId}, ${staffId}, ${rentalId}, ${amount}, ${paymentDate})
            RETURNING payment_id
          `;

          const paymentId = rows[0]?.["payment_id"] as number;

          return new PaymentCreated({
            paymentId,
            customerId,
            rentalId,
            amount,
            paymentDate,
          });
        }),

      // Get customer balance (total rentals - total payments)
      getCustomerBalance: (customerId: number) =>
        Effect.gen(function* () {
          // Get customer name
          const customerRows = yield* sql`
            SELECT CONCAT(first_name, ' ', last_name) as name
            FROM customer
            WHERE customer_id = ${customerId}
          `;

          if (!customerRows[0]) return undefined;

          const customerName = customerRows[0]["name"] as string;

          // Calculate balance: sum of rental fees - sum of payments
          const balanceRows = yield* sql`
            WITH rental_fees AS (
              SELECT 
                COALESCE(SUM(f.rental_rate), 0) as total_fees
              FROM rental r
              JOIN inventory i ON r.inventory_id = i.inventory_id
              JOIN film f ON i.film_id = f.film_id
              WHERE r.customer_id = ${customerId}
            ),
            payments AS (
              SELECT COALESCE(SUM(amount), 0) as total_payments
              FROM payment
              WHERE customer_id = ${customerId}
            )
            SELECT 
              (rental_fees.total_fees - payments.total_payments) as balance
            FROM rental_fees, payments
          `;

          const balance = Number(balanceRows[0]?.["balance"] ?? 0);

          return new CustomerBalance({
            customerId,
            customerName,
            balance,
          });
        }),

      // Get customer payment history
      getCustomerPayments: (customerId: number, limit: number = 20) =>
        Effect.gen(function* () {
          const rows = yield* sql`
            SELECT 
              p.payment_id,
              p.customer_id,
              CONCAT(c.first_name, ' ', c.last_name) as customer_name,
              p.rental_id,
              f.title as film_title,
              p.amount,
              p.payment_date
            FROM payment p
            JOIN customer c ON p.customer_id = c.customer_id
            JOIN rental r ON p.rental_id = r.rental_id
            JOIN inventory i ON r.inventory_id = i.inventory_id
            JOIN film f ON i.film_id = f.film_id
            WHERE p.customer_id = ${customerId}
            ORDER BY p.payment_date DESC
            LIMIT ${limit}
          `;

          return rows.map((row: any) => new PaymentDetail({
            paymentId: row.payment_id,
            customerId: row.customer_id,
            customerName: row.customer_name,
            rentalId: row.rental_id,
            filmTitle: row.film_title,
            amount: Number(row.amount),
            paymentDate: row.payment_date,
          }));
        }),

      // Get payment by ID
      findById: (paymentId: number) =>
        Effect.gen(function* () {
          const rows = yield* sql`
            SELECT 
              p.payment_id,
              p.customer_id,
              CONCAT(c.first_name, ' ', c.last_name) as customer_name,
              p.rental_id,
              f.title as film_title,
              p.amount,
              p.payment_date
            FROM payment p
            JOIN customer c ON p.customer_id = c.customer_id
            JOIN rental r ON p.rental_id = r.rental_id
            JOIN inventory i ON r.inventory_id = i.inventory_id
            JOIN film f ON i.film_id = f.film_id
            WHERE p.payment_id = ${paymentId}
          `;

          if (!rows[0]) return undefined;

          const row = rows[0] as any;
          return new PaymentDetail({
            paymentId: row.payment_id,
            customerId: row.customer_id,
            customerName: row.customer_name,
            rentalId: row.rental_id,
            filmTitle: row.film_title,
            amount: Number(row.amount),
            paymentDate: row.payment_date,
          });
        }),
    };
  }),
  dependencies: [],
}) {}
