import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { apiClient, createApiClient } from "../client";
import { ApiErrorClass } from "../errors";

function mockFetchResolve(status: number, body: unknown) {
  return vi.mocked(fetch).mockResolvedValueOnce({
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 404 ? "Not Found" : status === 401 ? "Unauthorized" : "OK",
    json: () => Promise.resolve(body),
  } as Response);
}

describe("apiClient", () => {
  beforeEach(() => {
    const mock = vi.fn();
    vi.stubGlobal("fetch", mock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("performs GET request and returns parsed JSON", async () => {
    const data = { assets: [{ symbol: "XLM" }] };
    mockFetchResolve(200, data);
    const result = await apiClient.get("/assets");
    expect(result).toEqual(data);
  });

  it("performs POST with JSON body", async () => {
    const body = { name: "test" };
    const response = { id: "1", ...body };
    mockFetchResolve(201, response);
    const result = await apiClient.post("/items", { body });
    expect(result).toEqual(response);
    expect(fetch).toHaveBeenCalledWith(
      "/api/v1/items",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ "Content-Type": "application/json" }),
        body: JSON.stringify(body),
      }),
    );
  });

  it("throws ApiErrorClass on non-ok response", async () => {
    mockFetchResolve(404, { error: "Not found" });
    const promise = apiClient.get("/nonexistent");
    await expect(promise).rejects.toThrow(ApiErrorClass);
    await expect(promise).rejects.toMatchObject({
      status: 404,
      message: "Not found",
    });
  });

  it("retries on network error then succeeds", async () => {
    const data = { ok: true };
    vi.mocked(fetch)
      .mockRejectedValueOnce(new TypeError("Network error"))
      .mockRejectedValueOnce(new TypeError("Network error"))
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: "OK",
        json: () => Promise.resolve(data),
      } as Response);

    const result = await apiClient.get("/retry-test");
    expect(result).toEqual(data);
    expect(fetch).toHaveBeenCalledTimes(3);
  });

  it("handles 204 no content", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 204,
      statusText: "No Content",
      json: () => Promise.reject(new Error("no body")),
    } as Response);
    const result = await apiClient.delete("/items/1");
    expect(result).toEqual({});
  });

  it("sends auth header when token available", async () => {
    const authedClient = createApiClient({
      getAccessToken: () => "tok_test",
    });
    mockFetchResolve(200, {});
    await authedClient.get("/protected");
    expect(fetch).toHaveBeenCalledWith(
      "/api/v1/protected",
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: "Bearer tok_test" }),
      }),
    );
  });
});
