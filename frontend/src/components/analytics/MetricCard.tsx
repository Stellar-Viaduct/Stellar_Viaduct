interface MetricCardProps {
  label: string;
  value: string;
  subtitle?: string;
  /** Percentage or point change vs previous period. */
  change?: number;
  /** Unit shown after change number (default %). */
  changeUnit?: string;
  isLoading?: boolean;
}

function TrendBadge({ change, unit = "%" }: { change: number; unit?: string }) {
  const isPositive = change > 0;
  const isNeutral = change === 0;
  const color = isNeutral
    ? "text-viaduct-text-secondary"
    : isPositive
    ? "text-green-400"
    : "text-red-400";
  const arrow = isNeutral ? "→" : isPositive ? "↑" : "↓";

  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${color}`}>
      <span>{arrow}</span>
      <span>
        {isPositive ? "+" : ""}
        {change.toFixed(1)}
        {unit}
      </span>
    </span>
  );
}

export default function MetricCard({
  label,
  value,
  subtitle,
  change,
  changeUnit = "%",
  isLoading = false,
}: MetricCardProps) {
  if (isLoading) {
    return (
      <div className="bg-viaduct-card border border-viaduct-border rounded-lg p-5">
        <div className="h-4 w-32 bg-stellar-border rounded animate-pulse mb-3" />
        <div className="h-7 w-24 bg-stellar-border rounded animate-pulse mb-2" />
        <div className="h-3 w-16 bg-stellar-border rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="bg-viaduct-card border border-viaduct-border rounded-lg p-5 hover:border-viaduct-accent/40 transition-colors">
      <p className="text-sm text-viaduct-text-secondary truncate">{label}</p>
      <p className="mt-2 text-2xl font-bold text-white tracking-tight">{value}</p>
      <div className="mt-1.5 flex items-center gap-2 flex-wrap">
        {subtitle && (
          <span className="text-xs text-viaduct-text-secondary">{subtitle}</span>
        )}
        {change !== undefined && (
          <TrendBadge change={change} unit={changeUnit} />
        )}
      </div>
    </div>
  );
}
