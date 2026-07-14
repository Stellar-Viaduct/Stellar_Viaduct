import type { Role } from "./types";
import { useAuth } from "./useAuth";

interface RoleGuardProps {
  children: React.ReactNode;
  roles: Role[];
  fallback?: React.ReactNode;
}

export function RoleGuard({ children, roles, fallback = null }: RoleGuardProps) {
  const { hasAnyRole, isAuthenticated } = useAuth();

  if (!isAuthenticated) return <>{fallback}</>;
  if (!hasAnyRole(roles)) return <>{fallback}</>;

  return <>{children}</>;
}
