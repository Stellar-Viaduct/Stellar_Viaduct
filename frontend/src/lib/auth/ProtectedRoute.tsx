import { Navigate, useLocation } from "react-router-dom";
import { LoadingFallback } from "../../components/LoadingFallback";
import { useAuth } from "./useAuth";
import type { Role } from "./types";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: Role[];
}

export function ProtectedRoute({ children, requiredRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isInitialized, hasAnyRole } = useAuth();
  const location = useLocation();

  if (!isInitialized) {
    return <LoadingFallback />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRoles && requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
