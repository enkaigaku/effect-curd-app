import * as jose from "jose";

/**
 * Test JWT secret - same default as AppConfig.ts
 */
const TEST_JWT_SECRET = new TextEncoder().encode(
  process.env["JWT_SECRET"] ?? "default-jwt-secret-change-in-production"
);

/**
 * Generate a test JWT token for customer authentication.
 */
export async function generateCustomerToken(customerId: number, email: string = "test@test.com"): Promise<string> {
  return await new jose.SignJWT({
    sub: String(customerId),
    email,
    type: "customer",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(TEST_JWT_SECRET);
}

/**
 * Generate a test JWT token for staff authentication.
 */
export async function generateStaffToken(
  staffId: number,
  username: string = "teststaff",
  storeId: number = 1
): Promise<string> {
  return await new jose.SignJWT({
    sub: String(staffId),
    username,
    storeId,
    type: "staff",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(TEST_JWT_SECRET);
}
