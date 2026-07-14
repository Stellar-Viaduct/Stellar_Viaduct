import type { SnoozeDurationMinutes } from "../../hooks/useAlertSnoozes";

const DURATIONS: Array<{ label: string; value: SnoozeDurationMinutes }> = [
  { label: "15m", value: 15 },
  { label: "30m", value: 30 },
  { label: "1h", value: 60 },
  { label: "4h", value: 240 },
];

interface AlertSnoozeControlsProps {
  label: string;
  onSnooze: (durationMinutes: SnoozeDurationMinutes) => void;
  onUnsnooze?: () => void;
  snoozedUntil?: number | null;
  compact?: boolean;
}

export default function AlertSnoozeControls({
  label,
  onSnooze,
  onUnsnooze,
  snoozedUntil,
  compact = false,
}: AlertSnoozeControlsProps) {
  const isSnoozed = typeof snoozedUntil === "number" && snoozedUntil > Date.now();

  return (
    <div className={compact ? "flex flex-wrap items-center gap-2" : "space-y-2"}>
      <div className="flex flex-wrap gap-2">
        {DURATIONS.map((duration) => (
          <button
            key={duration.value}
            type="button"
            onClick={() => onSnooze(duration.value)}
            className="rounded-md border border-viaduct-border bg-viaduct-background px-2 py-1 text-xs font-medium text-viaduct-text-secondary transition-colors hover:text-white hover:border-viaduct-accent focus:outline-none focus:ring-2 focus:ring-viaduct-accent"
            aria-label={`Snooze ${label} for ${duration.label}`}
          >
            Snooze {duration.label}
          </button>
        ))}
      </div>

      {isSnoozed && snoozedUntil ? (
        <div className="flex flex-wrap items-center gap-2 text-xs text-viaduct-text-secondary">
          <span>
            Snoozed until {new Date(snoozedUntil).toLocaleString()}
          </span>
          {onUnsnooze ? (
            <button
              type="button"
              onClick={onUnsnooze}
              className="rounded-md border border-viaduct-accent/40 bg-viaduct-accent/10 px-2 py-1 font-medium text-viaduct-accent hover:bg-viaduct-accent/20 focus:outline-none focus:ring-2 focus:ring-viaduct-accent"
            >
              Resume now
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}