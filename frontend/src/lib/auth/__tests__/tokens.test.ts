import { describe, it, expect, beforeEach, vi } from "vitest";
import { clearTokens, getAccessToken, getRefreshToken, getStoredUser, setTokens, storeUser } from "../tokens";
import type { Role } from "../types";

beforeEach(() => {
  vi.stubGlobal("sessionStorage", { getItem: vi.fn(), setItem: vi.fn(), removeItem: vi.fn() });
  vi.stubGlobal("localStorage", { getItem: vi.fn(), setItem: vi.fn(), removeItem: vi.fn() });
});

describe("tokens", () => {
  it("stores and retrieves access token from sessionStorage", () => {
    setTokens("access123", "refresh123");
    expect(sessionStorage.setItem).toHaveBeenCalledWith("sv:access_token", "access123");
    expect(localStorage.setItem).toHaveBeenCalledWith("sv:refresh_token", "refresh123");
  });

  it("getAccessToken returns null when no token", () => {
    vi.mocked(sessionStorage.getItem).mockReturnValue(null);
    expect(getAccessToken()).toBeNull();
  });

  it("getAccessToken returns stored token", () => {
    vi.mocked(sessionStorage.getItem).mockReturnValue("tok_abc");
    expect(getAccessToken()).toBe("tok_abc");
  });

  it("getRefreshToken returns null when not present", () => {
    vi.mocked(localStorage.getItem).mockReturnValue(null);
    expect(getRefreshToken()).toBeNull();
  });

  it("clearTokens removes all stored auth data", () => {
    clearTokens();
    expect(sessionStorage.removeItem).toHaveBeenCalledWith("sv:access_token");
    expect(localStorage.removeItem).toHaveBeenCalledWith("sv:refresh_token");
    expect(localStorage.removeItem).toHaveBeenCalledWith("sv:user");
  });

  it("storeUser and getStoredUser roundtrip", () => {
    const user = { id: "u1", name: "Test", email: "test@example.com", roles: ["Operator"] as Role[] };
    vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify(user));
    storeUser(user);
    expect(localStorage.setItem).toHaveBeenCalledWith("sv:user", JSON.stringify(user));
    const retrieved = getStoredUser();
    expect(retrieved).toEqual(user);
  });
});
