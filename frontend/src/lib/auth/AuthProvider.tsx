import { createContext, useCallback, useEffect, useMemo, useReducer } from "react";
import type { AuthContextValue, AuthState, LoginRequest, LoginResponse, Role, UserProfile } from "./types";
import { clearTokens, getAccessToken, getRefreshToken, getStoredUser, setTokens, storeUser } from "./tokens";
import { apiClient } from "../api-client";

const AUTH_REFRESH_ENDPOINT = "/auth/refresh";
const AUTH_LOGIN_ENDPOINT = "/auth/login";

type Action =
  | { type: "INITIALIZED"; user: UserProfile | null; accessToken: string | null }
  | { type: "LOGIN_SUCCESS"; user: UserProfile; accessToken: string }
  | { type: "LOGOUT" }
  | { type: "REFRESHED"; user: UserProfile; accessToken: string };

function authReducer(state: AuthState, action: Action): AuthState {
  switch (action.type) {
    case "INITIALIZED":
      return {
        ...state,
        user: action.user,
        accessToken: action.accessToken,
        isAuthenticated: action.user !== null,
        isInitialized: true,
      };
    case "LOGIN_SUCCESS":
      return {
        ...state,
        user: action.user,
        accessToken: action.accessToken,
        isAuthenticated: true,
        isInitialized: true,
      };
    case "LOGOUT":
      return {
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isInitialized: true,
      };
    case "REFRESHED":
      return {
        ...state,
        user: action.user,
        accessToken: action.accessToken,
        isAuthenticated: true,
      };
    default:
      return state;
  }
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isInitialized: false,
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function decodeTokenPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    return JSON.parse(atob(parts[1]));
  } catch {
    return null;
  }
}

function isTokenExpired(token: string): boolean {
  const payload = decodeTokenPayload(token);
  if (!payload || typeof payload.exp !== "number") return true;
  return Date.now() >= payload.exp * 1000;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const initialize = useCallback(async () => {
    const storedUser = getStoredUser();
    const accessToken = getAccessToken();

    if (storedUser && accessToken && !isTokenExpired(accessToken)) {
      dispatch({ type: "INITIALIZED", user: storedUser, accessToken });
      return;
    }

    const refreshToken = getRefreshToken();
    if (refreshToken) {
      try {
        const res = await apiClient.post<LoginResponse>(AUTH_REFRESH_ENDPOINT, {
          body: { refreshToken },
        });
        setTokens(res.accessToken, res.refreshToken);
        storeUser(res.user);
        dispatch({ type: "INITIALIZED", user: res.user, accessToken: res.accessToken });
        return;
      } catch {
        clearTokens();
      }
    }

    dispatch({ type: "INITIALIZED", user: null, accessToken: null });
  }, []);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const login = useCallback(async (credentials: LoginRequest) => {
    const res = await apiClient.post<LoginResponse>(AUTH_LOGIN_ENDPOINT, {
      body: credentials,
    });
    setTokens(res.accessToken, res.refreshToken);
    storeUser(res.user);
    dispatch({ type: "LOGIN_SUCCESS", user: res.user, accessToken: res.accessToken });
  }, []);

  const logout = useCallback(() => {
    clearTokens();
    dispatch({ type: "LOGOUT" });
  }, []);

  const hasRole = useCallback(
    (role: Role) => state.user?.roles.includes(role) ?? false,
    [state.user],
  );

  const hasAnyRole = useCallback(
    (roles: Role[]) => roles.some((r) => state.user?.roles.includes(r)),
    [state.user],
  );

  const refreshSession = useCallback(async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) throw new Error("No refresh token available");
    const res = await apiClient.post<LoginResponse>(AUTH_REFRESH_ENDPOINT, {
      body: { refreshToken },
    });
    setTokens(res.accessToken, res.refreshToken);
    storeUser(res.user);
    dispatch({ type: "REFRESHED", user: res.user, accessToken: res.accessToken });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      login,
      logout,
      hasRole,
      hasAnyRole,
      refreshSession,
    }),
    [state, login, logout, hasRole, hasAnyRole, refreshSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
