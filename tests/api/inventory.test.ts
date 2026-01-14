import { describe, it, expect } from "bun:test";
import { get } from "../utils/api.js";

// ============================================================
// Inventory/Stores API Endpoint Tests
// ============================================================

describe("Inventory API", () => {
  describe("GET /stores", () => {
    it("should return all stores", async () => {
      const { status, data } = await get<{ storeId: number; address: string }[]>("/stores");

      expect(status).toBe(200);
      expect(data.length).toBeGreaterThanOrEqual(2);
      expect(data[0]?.address).toBeDefined();
    });
  });

  describe("GET /stores/:storeId", () => {
    it("should return store details", async () => {
      const { status, data } = await get<{ storeId: number }>("/stores/1");

      expect(status).toBe(200);
      expect(data.storeId).toBe(1);
    });

    it("should return 404 for non-existent store", async () => {
      const { status } = await get<unknown>("/stores/99999");

      expect(status).toBe(404);
    });
  });

  describe("GET /films/:filmId/availability", () => {
    it("should return availability across all stores", async () => {
      const { status, data } = await get<{ filmId: number; storeId: number }[]>(
        "/films/1/availability"
      );

      expect(status).toBe(200);
      expect(data.length).toBeGreaterThan(0);
      data.forEach(item => {
        expect(item.filmId).toBe(1);
      });
    });
  });

  describe("GET /stores/:storeId/films/:filmId/availability", () => {
    it("should return availability at specific store", async () => {
      const { status, data } = await get<{ filmId: number; storeId: number }>(
        "/stores/1/films/1/availability"
      );

      expect(status).toBe(200);
      expect(data.filmId).toBe(1);
      expect(data.storeId).toBe(1);
    });
  });
});
