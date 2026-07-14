import { describe, it, expect, vi } from "vitest";
import { render, screen } from "../../../test/utils";
import { RoleGuard } from "../RoleGuard";
import { AuthContext } from "../AuthProvider";

function renderWithRoles(hasAnyRole: boolean) {
  return render(
    <AuthContext.Provider
      value={{
        user: { id: "1", name: "T", email: "t@t.com", roles: ["Operator"] },
        accessToken: "tok",
        isAuthenticated: true,
        isInitialized: true,
        login: vi.fn(),
        logout: vi.fn(),
        hasRole: () => false,
        hasAnyRole: () => hasAnyRole,
        refreshSession: vi.fn(),
      }}
    >
      <RoleGuard roles={["Admin"]} fallback={<div>No Access</div>}>
        <div>Admin Content</div>
      </RoleGuard>
    </AuthContext.Provider>,
  );
}

describe("RoleGuard", () => {
  it("renders children when user has required role", () => {
    renderWithRoles(true);
    expect(screen.getByText("Admin Content")).toBeDefined();
  });

  it("renders fallback when user lacks required role", () => {
    renderWithRoles(false);
    expect(screen.getByText("No Access")).toBeDefined();
  });
});
