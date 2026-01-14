/**
 * Base URL for API tests.
 * Assumes server is running on localhost:8080.
 */
export const API_BASE_URL = "http://localhost:8080";

/**
 * Helper to make API requests.
 */
export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<{ status: number; data: T }> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await response.json() as T;
  return { status: response.status, data };
}

/**
 * GET request helper.
 */
export function get<T>(path: string) {
  return apiRequest<T>(path, { method: "GET" });
}

/**
 * POST request helper.
 */
export function post<T>(path: string, body: unknown) {
  return apiRequest<T>(path, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/**
 * PUT request helper.
 */
export function put<T>(path: string, body?: unknown) {
  return apiRequest<T>(path, {
    method: "PUT",
    body: body ? JSON.stringify(body) : undefined,
  });
}
