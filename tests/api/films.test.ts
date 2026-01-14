import { describe, it, expect } from "bun:test";
import { get } from "../utils/api.js";

// ============================================================
// Films API Endpoint Tests
// ============================================================

describe("Films API", () => {
  describe("GET /films", () => {
    it("should return paginated films", async () => {
      const { status, data } = await get<{ data: unknown[]; total: number }>("/films");

      expect(status).toBe(200);
      expect(data.data.length).toBeGreaterThan(0);
      expect(data.total).toBeGreaterThan(0);
    });

    it("should support pagination", async () => {
      const { status, data } = await get<{ data: unknown[]; page: number; limit: number }>(
        "/films?page=2&limit=5"
      );

      expect(status).toBe(200);
      expect(data.page).toBe(2);
      expect(data.limit).toBe(5);
      expect(data.data.length).toBeLessThanOrEqual(5);
    });

    it("should filter by search term", async () => {
      const { status, data } = await get<{ data: { title: string }[] }>(
        "/films?search=ACADEMY"
      );

      expect(status).toBe(200);
      expect(data.data.length).toBeGreaterThan(0);
      data.data.forEach(film => {
        expect(film.title.toUpperCase()).toContain("ACADEMY");
      });
    });
  });

  describe("GET /films/:filmId", () => {
    it("should return film details", async () => {
      const { status, data } = await get<{ filmId: number; title: string }>("/films/1");

      expect(status).toBe(200);
      expect(data.filmId).toBe(1);
      expect(data.title).toBeDefined();
    });

    it("should return 404 for non-existent film", async () => {
      const { status } = await get<unknown>("/films/99999");

      expect(status).toBe(404);
    });
  });

  describe("GET /films/:filmId/actors", () => {
    it("should return actors for a film", async () => {
      const { status, data } = await get<{ actorId: number; firstName: string }[]>(
        "/films/1/actors"
      );

      expect(status).toBe(200);
      expect(data.length).toBeGreaterThan(0);
      expect(data[0]?.firstName).toBeDefined();
    });
  });

  describe("GET /categories", () => {
    it("should return all categories", async () => {
      const { status, data } = await get<{ categoryId: number; name: string }[]>(
        "/categories"
      );

      expect(status).toBe(200);
      expect(data.length).toBeGreaterThan(0);
      expect(data[0]?.name).toBeDefined();
    });
  });
});
