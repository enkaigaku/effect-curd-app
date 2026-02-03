import { describe, it, expect, beforeAll } from "bun:test";
import { authGet } from "../utils/api.js";
import { generateCustomerToken } from "../utils/auth.js";

// ============================================================
// Payments API Endpoint Tests
// ============================================================

describe("Payments API", () => {
  let customerToken: string;

  beforeAll(async () => {
    // Generate a test token for customer ID 1
    customerToken = await generateCustomerToken(1, "mary.smith@sakilacustomer.org");
  });

  describe("GET /customers/:customerId/balance", () => {
    it("should return customer balance", async () => {
      const { status, data } = await authGet<{ customerId: number; customerName: string; balance: number }>(
        "/customers/1/balance",
        customerToken
      );

      expect(status).toBe(200);
      expect(data.customerId).toBe(1);
      expect(data.customerName).toBeDefined();
      expect(typeof data.balance).toBe("number");
    });
  });

  describe("GET /customers/:customerId/payments", () => {
    it("should return customer payment history", async () => {
      const { status, data } = await authGet<{ paymentId: number; amount: number }[]>(
        "/customers/1/payments",
        customerToken
      );

      expect(status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      // Customer 1 should have some payments in Pagila
      if (data.length > 0) {
        expect(data[0]?.paymentId).toBeDefined();
        expect(typeof data[0]?.amount).toBe("number");
      }
    });
  });
});
