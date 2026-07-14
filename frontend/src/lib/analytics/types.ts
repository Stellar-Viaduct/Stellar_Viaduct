export type AnalyticsEventName =
  | "page_view"
  | "login"
  | "logout"
  | "search"
  | "asset_view"
  | "bridge_view"
  | "alert_triggered"
  | "report_exported"
  | "watchlist_added"
  | "watchlist_removed"
  | "error_occurred";

export interface AnalyticsEvent {
  name: AnalyticsEventName;
  properties?: Record<string, unknown>;
  timestamp?: number;
}

export interface AnalyticsProvider {
  track(event: AnalyticsEvent): void;
  pageView(path: string): void;
  identify(userId: string, traits?: Record<string, unknown>): void;
}
