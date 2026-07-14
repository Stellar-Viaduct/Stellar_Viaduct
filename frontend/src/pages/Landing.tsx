import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAssetsWithHealth } from "../hooks/useAssets";
import { useBridges } from "../hooks/useBridges";

interface StatItem {
  label: string;
  value: string | number;
  suffix?: string;
}

function useIntersection(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, visible };
}

function AnimatedSection({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const { ref, visible } = useIntersection();
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={[
        "transition-all duration-700 ease-out",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  delay,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}) {
  return (
    <AnimatedSection delay={delay}>
      <div className="card-premium group relative overflow-hidden p-6 h-full cursor-default">
        <div className="absolute inset-0 bg-gradient-to-br from-viaduct-accent/0 via-transparent to-viaduct-accent/0 opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
        <div className="relative z-10">
          <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-viaduct-accent/10 text-viaduct-accent group-hover:bg-viaduct-accent group-hover:text-white transition-all duration-300">
            {icon}
          </div>
          <h3 className="text-base font-semibold text-viaduct-text-primary font-display">{title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-viaduct-text-secondary">
            {description}
          </p>
        </div>
      </div>
    </AnimatedSection>
  );
}

function StatCard({ label, value, suffix = "" }: StatItem) {
  return (
    <div className="card-premium p-6 text-center">
      <p className="text-3xl font-bold text-viaduct-text-primary font-display tracking-tight">
        {value}
        <span className="text-viaduct-accent">{suffix}</span>
      </p>
      <p className="mt-1.5 text-sm text-viaduct-text-secondary font-medium tracking-wide uppercase text-[0.7rem]">
        {label}
      </p>
    </div>
  );
}

function StepCard({
  step,
  title,
  description,
  delay,
}: {
  step: number;
  title: string;
  description: string;
  delay: number;
}) {
  return (
    <AnimatedSection delay={delay}>
      <div className="flex gap-5 group cursor-default">
        <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-full bg-viaduct-accent text-white font-bold text-sm font-display group-hover:shadow-glow-sm transition-shadow duration-300">
          {step}
        </div>
        <div>
          <h3 className="font-semibold text-viaduct-text-primary font-display">{title}</h3>
          <p className="mt-1 text-sm text-viaduct-text-secondary leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </AnimatedSection>
  );
}

const Icon = {
  Shield: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  Activity: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
  BarChart: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  Globe: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
  Bell: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  Lock: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  Code: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  ),
  Zap: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  ArrowRight: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  ),
  Star: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  Layers: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  ),
  Hexagon: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    </svg>
  ),
};

const API_SNIPPET = `// Stellar Viaduct REST API
const response = await fetch(
  "https://api.stellarviaduct.io/v1/assets/USDC/health"
);
const { overallScore, factors, trend } = await response.json();
// overallScore: 94
// factors: { liquidityDepth: 96, priceStability: 91, ... }
// trend: "improving"`;

export default function Landing() {
  const { data: assetsData } = useAssetsWithHealth();
  const { data: bridgesData } = useBridges();

  const totalAssets = assetsData?.length ?? 0;
  const totalBridges = bridgesData?.bridges?.length ?? 0;
  const avgScore = useMemo<string>(() => {
    if (!assetsData || assetsData.length === 0) return "—";
    const withScores = assetsData
      .map((a) => a.health?.overallScore)
      .filter((s): s is number => typeof s === "number");
    if (withScores.length === 0) return "—";
    return (withScores.reduce((a, b) => a + b, 0) / withScores.length).toFixed(0);
  }, [assetsData]);

  const stats: StatItem[] = [
    { label: "Assets Monitored", value: totalAssets || "—" },
    { label: "Bridges Tracked", value: totalBridges || "—" },
    { label: "Avg Health Score", value: avgScore, suffix: avgScore !== "—" ? "/100" : "" },
    { label: "Network", value: "Stellar" },
  ];

  const features = [
    {
      icon: <Icon.Hexagon />,
      title: "Real-Time Health Scores",
      description: "Composite 0–100 health score per asset, updated live via WebSocket. Track liquidity depth, price stability, and bridge uptime in one unified view.",
    },
    {
      icon: <Icon.Shield />,
      title: "Supply Mismatch Detection",
      description: "Automatically flag discrepancies between Stellar-issued supply and source-chain collateral, down to 0.1 bp resolution.",
    },
    {
      icon: <Icon.Bell />,
      title: "Price Deviation Alerts",
      description: "Configurable low / medium / high severity alerts fire instantly when any asset deviates from its reference price.",
    },
    {
      icon: <Icon.Layers />,
      title: "Multi-DEX Liquidity Depth",
      description: "Aggregate liquidity from all Stellar DEX venues at multiple price-impact tiers — StellarX, Phoenix, LumenSwap, SDEX, Soroswap.",
    },
    {
      icon: <Icon.Globe />,
      title: "Cross-Bridge Analytics",
      description: "Side-by-side comparison across all monitored bridges. Historical trend charts, volume analytics, and bridge performance tables.",
    },
    {
      icon: <Icon.Lock />,
      title: "On-Chain Security Controls",
      description: "Emergency pause, two-step admin transfer, and per-role permissions enforced directly by the Soroban smart contract.",
    },
    {
      icon: <Icon.Code />,
      title: "Open REST & WebSocket API",
      description: "Every data point is available via a versioned REST API and a real-time WebSocket feed. Integrate into your own dashboards in minutes.",
    },
    {
      icon: <Icon.Zap />,
      title: "Automated Health Calculation",
      description: "Submit raw component scores and let the contract compute the weighted composite automatically with full transparency.",
    },
  ];

  const steps = [
    {
      title: "Connect to Stellar",
      description: "Viaduct indexes Stellar mainnet (and testnet) events in real time. No wallet connection needed to view public monitoring data.",
    },
    {
      title: "Monitor Your Assets",
      description: "Registered assets appear on the dashboard with live health scores. Set deviation thresholds and mismatch alerts tailored to each token.",
    },
    {
      title: "Act on Insights",
      description: "Use the dashboard, REST API, or Soroban contract query functions to integrate Viaduct data into your trading, compliance, or ops tooling.",
    },
    {
      title: "Generate Reports",
      description: "Export print-ready PDF reports of network overviews, per-asset breakdowns, and bridge status summaries with a single click.",
    },
  ];

  return (
    <div className="min-h-screen bg-viaduct-background">

      {/* ── Navbar ── */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-viaduct-border glass-panel">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              to="/"
              className="flex items-center gap-2.5 text-xl font-bold text-viaduct-text-primary focus:outline-none focus:ring-2 focus:ring-viaduct-accent rounded-sm font-display tracking-tight"
            >
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-viaduct-accent/10 text-viaduct-accent">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                </svg>
              </span>
              Stellar <span className="text-viaduct-accent">Viaduct</span>
            </Link>
            <div className="flex items-center gap-3">
              <Link
                to="/dashboard"
                className="hidden sm:block text-sm text-viaduct-text-secondary hover:text-viaduct-text-primary transition-colors font-medium"
              >
                Dashboard
              </Link>
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 rounded-xl bg-viaduct-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-viaduct-accent/90 transition-all shadow-glow-sm hover:shadow-glow focus:outline-none focus:ring-2 focus:ring-viaduct-accent"
              >
                Launch App
                <Icon.ArrowRight />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden pt-32 pb-28 sm:pt-40 sm:pb-36">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="h-[600px] w-[600px] rounded-full bg-viaduct-accent/8 blur-3xl" />
          <div className="h-[400px] w-[400px] rounded-full bg-viaduct-accent/5 blur-3xl -translate-x-48 translate-y-24" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-viaduct-accent/20 bg-viaduct-accent/8 px-4 py-1.5 text-xs font-semibold text-viaduct-accent mb-8 tracking-wide uppercase">
            <Icon.Star />
            Open-source · Stellar Network
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-viaduct-text-primary leading-[1.05] tracking-tight font-display">
            Bridge Intelligence
            <br />
            <span className="text-gradient">for Stellar</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-viaduct-text-secondary max-w-2xl mx-auto leading-relaxed font-light">
            Viaduct gives you instant visibility into cross-chain asset health,
            supply consistency, and liquidity depth — all powered by an auditable
            Soroban smart contract on the Stellar network.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-viaduct-accent px-8 py-4 text-base font-semibold text-white shadow-lg shadow-viaduct-accent/25 hover:bg-viaduct-accent/90 transition-all hover:shadow-glow-lg focus:outline-none focus:ring-2 focus:ring-viaduct-accent"
            >
              Open Dashboard
              <Icon.ArrowRight />
            </Link>
            <a
              href="https://github.com/Stellar_Viaduct/Stellar_Viaduct"
              target="_blank"
              rel="noopener noreferrer"
              className="glass-panel-strong inline-flex items-center gap-2 rounded-xl px-8 py-4 text-base font-semibold text-viaduct-text-primary hover:border-viaduct-accent/30 transition-all focus:outline-none focus:ring-2 focus:ring-viaduct-accent"
            >
              View on GitHub
            </a>
          </div>
        </div>
      </section>

      {/* ── Live Stats ── */}
      <section className="border-y border-viaduct-border bg-viaduct-surface/50 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <p className="text-center text-xs font-semibold uppercase tracking-[0.15em] text-viaduct-text-secondary mb-8">
              Live Network Statistics
            </p>
          </AnimatedSection>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <AnimatedSection key={stat.label} delay={i * 80}>
                <StatCard {...stat} />
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-16">
            <span className="inline-block text-xs font-semibold uppercase tracking-[0.15em] text-viaduct-accent mb-4">Platform Capabilities</span>
            <h2 className="text-4xl sm:text-5xl font-bold text-viaduct-text-primary font-display tracking-tight">
              Everything you need to<br />monitor bridges
            </h2>
            <p className="mt-4 text-viaduct-text-secondary max-w-2xl mx-auto text-lg font-light">
              From raw on-chain data to actionable health scores, Viaduct covers
              the full observability stack for bridged assets on Stellar.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((feature, i) => (
              <FeatureCard key={feature.title} {...feature} delay={i * 60} />
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-28 border-y border-viaduct-border bg-viaduct-surface/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="mb-16">
            <span className="inline-block text-xs font-semibold uppercase tracking-[0.15em] text-viaduct-accent mb-4">Getting Started</span>
            <h2 className="text-4xl sm:text-5xl font-bold text-viaduct-text-primary font-display tracking-tight">How it works</h2>
            <p className="mt-4 text-viaduct-text-secondary max-w-xl text-lg font-light">
              Get from zero to full bridge visibility in four simple steps.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-3xl">
            {steps.map((step, i) => (
              <StepCard key={step.title} step={i + 1} {...step} delay={i * 100} />
            ))}
          </div>
        </div>
      </section>

      {/* ── API Preview ── */}
      <section className="py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <AnimatedSection>
              <span className="inline-block rounded-full border border-viaduct-accent/20 bg-viaduct-accent/8 px-3.5 py-1 text-xs font-semibold text-viaduct-accent uppercase tracking-widest mb-4">
                Developer API
              </span>
              <h2 className="text-4xl sm:text-5xl font-bold text-viaduct-text-primary font-display tracking-tight">
                Integrate in minutes
              </h2>
              <p className="mt-4 text-viaduct-text-secondary leading-relaxed text-lg font-light">
                A clean, versioned REST API and real-time WebSocket feed let you embed
                Viaduct data into your own applications, bots, and dashboards
                without any blockchain SDK.
              </p>
              <ul className="mt-6 space-y-3 text-sm text-viaduct-text-secondary">
                {[
                  "REST endpoints for assets, bridges, prices, and health scores",
                  "WebSocket channel for live health score updates",
                  "Pagination, filtering, and date-range queries",
                  "OpenAPI spec available for code generation",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-0.5 flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-viaduct-accent/10 text-viaduct-accent text-xs font-bold">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 rounded-xl bg-viaduct-accent px-6 py-3 text-sm font-semibold text-white hover:bg-viaduct-accent/90 transition-all shadow-glow-sm hover:shadow-glow focus:outline-none focus:ring-2 focus:ring-viaduct-accent"
                >
                  Explore the dashboard
                  <Icon.ArrowRight />
                </Link>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={150}>
              <div className="rounded-2xl border border-viaduct-border bg-viaduct-card overflow-hidden shadow-premium">
                <div className="flex items-center gap-1.5 px-4 py-3 border-b border-viaduct-border bg-viaduct-surface/80">
                  {["#FF5F57", "#FFBD2E", "#27C93F"].map((color) => (
                    <div key={color} className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
                  ))}
                  <span className="ml-2 text-xs text-viaduct-text-secondary font-mono">
                    stellar-viaduct-api.mjs
                  </span>
                </div>
                <pre className="overflow-x-auto p-5 text-xs leading-relaxed text-viaduct-accent/90 font-mono">
                  <code>{API_SNIPPET}</code>
                </pre>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ── Call to Action ── */}
      <section className="py-28 border-t border-viaduct-border bg-viaduct-surface/40">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimatedSection>
            <h2 className="text-4xl sm:text-5xl font-bold text-viaduct-text-primary font-display tracking-tight">
              Start monitoring your bridges today
            </h2>
            <p className="mt-4 text-viaduct-text-secondary max-w-xl mx-auto text-lg font-light">
              Viaduct is fully open-source. Contributions, forks, and integrations
              are welcome.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 rounded-xl bg-viaduct-accent px-8 py-4 text-base font-semibold text-white shadow-lg shadow-viaduct-accent/25 hover:bg-viaduct-accent/90 transition-all hover:shadow-glow-lg focus:outline-none focus:ring-2 focus:ring-viaduct-accent"
              >
                Open the Dashboard
                <Icon.ArrowRight />
              </Link>
              <a
                href="https://github.com/Stellar_Viaduct/Stellar_Viaduct"
                target="_blank"
                rel="noopener noreferrer"
                className="glass-panel-strong inline-flex items-center gap-2 rounded-xl px-8 py-4 text-base font-semibold text-viaduct-text-primary hover:border-viaduct-accent/30 transition-all focus:outline-none focus:ring-2 focus:ring-viaduct-accent"
              >
                Contribute on GitHub
              </a>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-viaduct-border py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-viaduct-text-secondary">
          <p className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-md bg-viaduct-accent/10 text-viaduct-accent">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              </svg>
            </span>
            © {new Date().getFullYear()}{" "}
            <span className="text-viaduct-text-primary font-semibold">Stellar Viaduct</span>
          </p>
          <div className="flex items-center gap-8">
            <Link to="/dashboard" className="hover:text-viaduct-text-primary transition-colors font-medium">Dashboard</Link>
            <Link to="/bridges" className="hover:text-viaduct-text-primary transition-colors font-medium">Bridges</Link>
            <Link to="/analytics" className="hover:text-viaduct-text-primary transition-colors font-medium">Analytics</Link>
            <a href="https://github.com/Stellar_Viaduct/Stellar_Viaduct" target="_blank" rel="noopener noreferrer" className="hover:text-viaduct-text-primary transition-colors font-medium">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
