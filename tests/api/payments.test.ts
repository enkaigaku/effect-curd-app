import { describe, it, expect } from "bun:test";
import { get } from "../utils/api.js";

// ============================================================
// Payments API Endpoint Tests
// ============================================================

describe("Payments API", () => {
  describe("GET /customers/:customerId/balance", () => {
    it("should return customer balance", async () => {
      const { status, data } = await get<{ customerId: number; customerName: string; balance: number }>(
        "/customers/1/balance"
      );

      expect(status).toBe(200);
      expect(data.customerId).toBe(1);
      expect(data.customerName).toBeDefined();
      expect(typeof data.balance).toBe("number");
    });
  });

  describe("GET /customers/:customerId/payments", () => {
    it("should return customer payment history", async () => {
      const { status, data } = await get<{ paymentId: number; amount: number }[]>(
        "/customers/1/payments"
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
