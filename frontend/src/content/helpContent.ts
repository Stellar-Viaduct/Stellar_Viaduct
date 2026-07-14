export type HelpCategory =
  | "getting-started"
  | "monitoring"
  | "alerts"
  | "integrations"
  | "troubleshooting";

export interface HelpArticle {
  id: string;
  slug: string;
  title: string;
  category: HelpCategory;
  summary: string;
  content: string;
  related: string[];
  videoUrl?: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: HelpCategory;
}

export const helpCategories: Array<{ id: HelpCategory; label: string; description: string }> = [
  {
    id: "getting-started",
    label: "Getting Started",
    description: "Set up your first monitored assets and preferred refresh cadence.",
  },
  {
    id: "monitoring",
    label: "Monitoring",
    description: "Understand dashboards, bridge signals, and transaction timelines.",
  },
  {
    id: "alerts",
    label: "Alerts",
    description: "Configure thresholds, channels, and response playbooks.",
  },
  {
    id: "integrations",
    label: "Integrations",
    description: "Connect with API keys, webhooks, and external automation.",
  },
  {
    id: "troubleshooting",
    label: "Troubleshooting",
    description: "Resolve stale data, auth issues, and service degradation.",
  },
];

export const helpArticles: HelpArticle[] = [
  {
    id: "article-first-dashboard",
    slug: "first-dashboard",
    title: "Build your first monitoring dashboard",
    category: "getting-started",
    summary: "From onboarding to your first healthy/unhealthy signal in under 10 minutes.",
    content:
      "Start on the Dashboard page and choose monitored assets. Confirm bridge status cards load successfully. Configure auto-refresh and watchlist entries, then save your display and notification preferences.",
    related: ["article-refresh-controls", "article-alert-thresholds"],
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  },
  {
    id: "article-refresh-controls",
    slug: "refresh-controls",
    title: "Tune refresh controls for your team",
    category: "monitoring",
    summary: "Balance API cost and operational visibility with practical interval settings.",
    content:
      "Use Refresh Controls on Dashboard and Transactions pages to set interval and focus refetch behavior. For NOC usage, 30s to 60s is typical. For executive dashboards, 2m is usually sufficient.",
    related: ["article-first-dashboard", "article-api-alerting"],
  },
  {
    id: "article-alert-thresholds",
    slug: "alert-thresholds",
    title: "Set alert thresholds without noise",
    category: "alerts",
    summary: "Configure health score and reserve conditions that trigger actionable alerts.",
    content:
      "In Settings, define thresholds for warning vs critical bands. Start conservative and tighten after one week of observed volatility. Route high-severity alerts to on-call channels only.",
    related: ["article-first-dashboard", "article-api-alerting"],
  },
  {
    id: "article-api-alerting",
    slug: "api-alerting",
    title: "Connect webhooks and API consumers",
    category: "integrations",
    summary: "Use API keys and webhooks to connect SIEM, pager, and custom bots.",
    content:
      "Generate an API key from Admin -> API Keys. Use /api/v1/alerts and /api/v1/transactions endpoints for polling workflows, or configure webhooks for push-based alert processing.",
    related: ["article-alert-thresholds", "article-refresh-controls"],
  },
  {
    id: "article-stale-data",
    slug: "stale-data",
    title: "Troubleshoot stale or missing data",
    category: "troubleshooting",
    summary: "Diagnose websocket, API, and backend dependency issues quickly.",
    content:
      "Check the connection indicator in the navbar. If disconnected, verify backend /health and Redis availability. Review API key limits, then inspect request tracing and metrics endpoints for bottlenecks.",
    related: ["article-refresh-controls", "article-api-alerting"],
  },
];

export const faqItems: FaqItem[] = [
  {
    id: "faq-1",
    question: "How often should I refresh bridge health data?",
    answer: "30 to 60 seconds is a common baseline. Increase to 120 seconds for less volatile operational views.",
    category: "monitoring",
  },
  {
    id: "faq-2",
    question: "Why am I not receiving notifications?",
    answer: "Verify notification preferences in Settings and confirm the browser tab has notification permissions enabled.",
    category: "alerts",
  },
  {
    id: "faq-3",
    question: "Can I search docs by keyword?",
    answer: "Yes. The Help Center search matches article titles, summaries, and body content.",
    category: "getting-started",
  },
  {
    id: "faq-4",
    question: "Where do I manage integration credentials?",
    answer: "Open Admin -> API Keys to issue, rotate, revoke, and extend credentials.",
    category: "integrations",
  },
  {
    id: "faq-5",
    question: "How do I report incorrect documentation?",
    answer: "Use the feedback form on the Help Center page and include the article title and expected behavior.",
    category: "troubleshooting",
  },
];
