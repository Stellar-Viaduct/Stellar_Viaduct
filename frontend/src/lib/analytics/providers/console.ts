import type { AnalyticsEvent, AnalyticsProvider } from "../types";

export function createConsoleAnalytics(): AnalyticsProvider {
  return {
    track(event: AnalyticsEvent) {
      if (import.meta.env.DEV) {
        console.log("[Analytics]", event.name, event.properties ?? "");
      }
    },
    pageView(path: string) {
      if (import.meta.env.DEV) {
        console.log("[Analytics] Page view:", path);
      }
    },
    identify(userId: string, traits?: Record<string, unknown>) {
      if (import.meta.env.DEV) {
        console.log("[Analytics] Identify:", userId, traits ?? "");
      }
    },
  };
}
