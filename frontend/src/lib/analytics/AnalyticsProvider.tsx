import { createContext, useCallback, useContext, useEffect, useMemo, useRef } from "react";
import { useLocation } from "react-router-dom";
import type { AnalyticsEvent, AnalyticsEventName, AnalyticsProvider as IAnalyticsProvider } from "./types";
import { createConsoleAnalytics } from "./providers/console";

interface AnalyticsContextValue {
  track: (name: AnalyticsEventName, properties?: Record<string, unknown>) => void;
  pageView: (path?: string) => void;
}

const AnalyticsContext = createContext<AnalyticsContextValue | undefined>(undefined);

let _provider: IAnalyticsProvider = createConsoleAnalytics();

export function setAnalyticsProvider(provider: IAnalyticsProvider) {
  _provider = provider;
}

export function AnalyticsContextProvider({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const prevPath = useRef(location.pathname);

  const track = useCallback((name: AnalyticsEventName, properties?: Record<string, unknown>) => {
    const event: AnalyticsEvent = { name, properties, timestamp: Date.now() };
    _provider.track(event);
  }, []);

  const pageView = useCallback((path?: string) => {
    _provider.pageView(path ?? location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    if (prevPath.current !== location.pathname) {
      prevPath.current = location.pathname;
      pageView(location.pathname);
    }
  }, [location.pathname, pageView]);

  const value = useMemo<AnalyticsContextValue>(() => ({ track, pageView }), [track, pageView]);

  return <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>;
}

export function useAnalytics(): AnalyticsContextValue {
  const ctx = useContext(AnalyticsContext);
  if (!ctx) {
    throw new Error("useAnalytics must be used within an AnalyticsContextProvider");
  }
  return ctx;
}
