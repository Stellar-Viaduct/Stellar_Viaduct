import { describe, it, expect } from "vitest";
import { ApiErrorClass } from "../errors";

describe("ApiErrorClass", () => {
  it("creates an error with status and message", () => {
    const err = new ApiErrorClass(404, "Not found", "NOT_FOUND", { id: "123" });
    expect(err.status).toBe(404);
    expect(err.message).toBe("Not found");
    expect(err.code).toBe("NOT_FOUND");
    expect(err.details).toEqual({ id: "123" });
    expect(err.name).toBe("ApiError");
  });

  it("isUnauthorized returns true for 401", () => {
    expect(new ApiErrorClass(401, "Unauthorized").isUnauthorized).toBe(true);
    expect(new ApiErrorClass(403, "Forbidden").isUnauthorized).toBe(false);
  });

  it("isForbidden returns true for 403", () => {
    expect(new ApiErrorClass(403, "Forbidden").isForbidden).toBe(true);
  });

  it("isNotFound returns true for 404", () => {
    expect(new ApiErrorClass(404, "Not found").isNotFound).toBe(true);
  });

  it("isRateLimited returns true for 429", () => {
    expect(new ApiErrorClass(429, "Too many").isRateLimited).toBe(true);
  });

  it("isServerError returns true for 5xx", () => {
    expect(new ApiErrorClass(500, "Server error").isServerError).toBe(true);
    expect(new ApiErrorClass(502, "Bad gateway").isServerError).toBe(true);
    expect(new ApiErrorClass(404, "Not found").isServerError).toBe(false);
  });
});
