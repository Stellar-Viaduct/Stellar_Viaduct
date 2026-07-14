import type { ReactNode } from "react";

export interface SparklineTooltipPayload {
  value: number;
  timestamp?: string;
  label?: string;
}

interface SparklineTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: SparklineTooltipPayload }>;
  label?: string;
  formatter?: (value: number) => string;
  header?: ReactNode;
}

export default function SparklineTooltip({
  active,
  payload,
  formatter,
  header,
}: SparklineTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  const p = payload[0]?.payload;
  if (!p) return null;

  const valueText = formatter ? formatter(p.value) : String(p.value);

  return (
    <div
      className="bg-viaduct-card border border-viaduct-border rounded-lg px-3 py-2 shadow-lg"
      style={{ pointerEvents: "none" }}
      role="tooltip"
    >
      {header ? <div className="text-xs text-viaduct-text-primary mb-1">{header}</div> : null}
      {p.timestamp ? (
        <div className="text-xs text-viaduct-text-secondary tabular-nums">
          {new Date(p.timestamp).toLocaleString()}
        </div>
      ) : null}
      <div className="text-sm text-viaduct-text-primary font-medium tabular-nums">{valueText}</div>
    </div>
  );
}
