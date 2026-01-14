import { DatabaseLive } from "../../src/config/Database.js";

/**
 * Test database layer for integration tests.
 * Reuses the same database configuration as the application.
 */
export const TestDatabaseLayer = DatabaseLive;
