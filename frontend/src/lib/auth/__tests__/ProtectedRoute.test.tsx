import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "../ProtectedRoute";
import { AuthContext } from "../AuthProvider";
import type { AuthContextValue } from "../types";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const testQueryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

interface RenderOpts extends Partial<AuthContextValue> {
  requiredRoles?: string[];
}

function renderWithAuth(value: RenderOpts, initialRoute = "/protected") {
  const { requiredRoles, ...authValue } = value;
  const defaultAuth: AuthContextValue = {
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isInitialized: true,
    login: vi.fn(),
    logout: vi.fn(),
    hasRole: () => false,
    hasAnyRole: () => false,
    refreshSession: vi.fn(),
    ...authValue,
  };

  return render(
    <QueryClientProvider client={testQueryClient}>
      <MemoryRouter initialEntries={[initialRoute]}>
        <Routes>
          <Route
            path="/protected"
            element={
              <AuthContext.Provider value={defaultAuth}>
                <ProtectedRoute requiredRoles={requiredRoles as any}>
                  <div>Protected Content</div>
                </ProtectedRoute>
              </AuthContext.Provider>
            }
          />
          <Route path="/login" element={<div>Login Page</div>} />
          <Route path="/" element={<div>Home Page</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("ProtectedRoute", () => {
  it("shows loading when not initialized", () => {
    renderWithAuth({ isInitialized: false });
    expect(screen.getByText("app.loadingPage")).toBeDefined();
  });

  it("redirects to login when not authenticated", () => {
    renderWithAuth({ isAuthenticated: false });
    expect(screen.getByText("Login Page")).toBeDefined();
  });

  it("renders children when authenticated", () => {
    renderWithAuth({
      isAuthenticated: true,
      user: { id: "1", name: "Test", email: "test@test.com", roles: ["Operator"] },
    });
    expect(screen.getByText("Protected Content")).toBeDefined();
  });

  it("redirects when user lacks required roles", () => {
    renderWithAuth({
      isAuthenticated: true,
      user: { id: "1", name: "Test", email: "test@test.com", roles: ["Viewer"] },
      hasAnyRole: () => false,
      requiredRoles: ["Admin"],
    }, "/protected");
    expect(screen.getByText("Home Page")).toBeDefined();
  });
});
