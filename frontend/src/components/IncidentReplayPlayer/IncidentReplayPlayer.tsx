import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { IncidentReplayEvent, IncidentReplayTimeline } from "../../services/api";

const SPEED_OPTIONS = [0.5, 1, 2, 4] as const;

interface IncidentReplayPlayerProps {
  timeline: IncidentReplayTimeline;
  isLoading?: boolean;
  error?: string | null;
}

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString();
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.floor(ms / 60_000)}m ${Math.round((ms % 60_000) / 1000)}s`;
}

export default function IncidentReplayPlayer({
  timeline,
  isLoading,
  error,
}: IncidentReplayPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<(typeof SPEED_OPTIONS)[number]>(1);
  const [selectedEvent, setSelectedEvent] = useState<IncidentReplayEvent | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const events = timeline.events;
  const currentEvent = events[currentIndex] ?? null;
  const progress = events.length > 1 ? (currentIndex / (events.length - 1)) * 100 : 100;

  const stopPlayback = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const advance = useCallback(() => {
    setCurrentIndex((prev) => {
      if (prev >= events.length - 1) {
        stopPlayback();
        return prev;
      }
      return prev + 1;
    });
  }, [events.length, stopPlayback]);

  useEffect(() => {
    if (!isPlaying) return undefined;

    const intervalMs = Math.max(250, 1500 / speed);
    timerRef.current = setInterval(advance, intervalMs);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, speed, advance]);

  useEffect(() => {
    if (currentEvent) setSelectedEvent(currentEvent);
  }, [currentEvent]);

  const exportReplay = useCallback(() => {
    const payload = {
      exportedAt: new Date().toISOString(),
      incidentId: timeline.incidentId,
      incident: timeline.incident,
      events: timeline.events,
      durationMs: timeline.durationMs,
      playbackPosition: currentIndex,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `incident-replay-${timeline.incidentId}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }, [timeline, currentIndex]);

  const severityColor = useMemo(() => {
    const map: Record<string, string> = {
      critical: "text-red-400",
      high: "text-orange-400",
      medium: "text-yellow-400",
      low: "text-blue-400",
    };
    return map[timeline.incident.severity] ?? "text-viaduct-text-secondary";
  }, [timeline.incident.severity]);

  if (isLoading) {
    return (
      <div className="rounded-xl border border-viaduct-border bg-viaduct-card p-8 text-center text-viaduct-text-secondary">
        Loading replay timeline...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-8 text-center text-red-300">
        {error}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="rounded-xl border border-viaduct-border bg-viaduct-card p-8 text-center text-viaduct-text-secondary">
        No replay events available for this incident.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="rounded-xl border border-viaduct-border bg-viaduct-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className={`text-sm font-medium uppercase tracking-wide ${severityColor}`}>
              {timeline.incident.severity} · {timeline.incident.status}
            </p>
            <h2 className="mt-1 text-xl font-semibold text-viaduct-text-primary">
              {timeline.incident.title}
            </h2>
            <p className="mt-2 text-sm text-viaduct-text-secondary">
              {timeline.incident.description}
            </p>
          </div>
          <div className="text-right text-sm text-viaduct-text-secondary">
            <p>Bridge: {timeline.incident.bridgeId}</p>
            {timeline.incident.assetCode && <p>Asset: {timeline.incident.assetCode}</p>}
            <p>Duration: {formatDuration(timeline.durationMs)}</p>
            <p>{events.length} events</p>
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <section
          className="rounded-xl border border-viaduct-border bg-viaduct-card p-6"
          aria-label="Incident replay timeline"
        >
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              className="rounded-md bg-viaduct-accent px-4 py-2 text-sm font-medium text-white hover:bg-viaduct-accent/90"
              onClick={() => (isPlaying ? stopPlayback() : setIsPlaying(true))}
              aria-label={isPlaying ? "Pause replay" : "Play replay"}
            >
              {isPlaying ? "Pause" : "Play"}
            </button>
            <button
              type="button"
              className="rounded-md border border-viaduct-border px-3 py-2 text-sm text-viaduct-text-secondary hover:text-white"
              onClick={() => {
                stopPlayback();
                setCurrentIndex(0);
              }}
            >
              Restart
            </button>
            <label className="flex items-center gap-2 text-sm text-viaduct-text-secondary">
              Speed
              <select
                className="rounded-md border border-viaduct-border bg-viaduct-background px-2 py-1 text-white"
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value) as (typeof SPEED_OPTIONS)[number])}
                aria-label="Playback speed"
              >
                {SPEED_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}x
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              className="ml-auto rounded-md border border-viaduct-border px-3 py-2 text-sm text-viaduct-text-secondary hover:text-white"
              onClick={exportReplay}
            >
              Export JSON
            </button>
          </div>

          <div className="mb-6">
            <input
              type="range"
              min={0}
              max={Math.max(0, events.length - 1)}
              value={currentIndex}
              onChange={(e) => {
                stopPlayback();
                setCurrentIndex(Number(e.target.value));
              }}
              className="w-full accent-stellar-blue"
              aria-label="Timeline scrubber"
            />
            <div className="mt-1 flex justify-between text-xs text-viaduct-text-secondary">
              <span>{currentEvent ? formatTimestamp(currentEvent.timestamp) : "—"}</span>
              <span>{Math.round(progress)}%</span>
            </div>
          </div>

          <ol className="space-y-2">
            {events.map((event, index) => {
              const isActive = index === currentIndex;
              const isPast = index < currentIndex;
              return (
                <li key={event.id}>
                  <button
                    type="button"
                    className={`w-full rounded-lg border px-4 py-3 text-left transition ${
                      isActive
                        ? "border-viaduct-accent bg-viaduct-accent/10"
                        : isPast
                          ? "border-viaduct-border/50 bg-viaduct-background/40 opacity-80"
                          : "border-viaduct-border bg-viaduct-background hover:border-viaduct-accent/50"
                    }`}
                    onClick={() => {
                      stopPlayback();
                      setCurrentIndex(index);
                      setSelectedEvent(event);
                    }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-viaduct-text-primary">
                        {event.title}
                      </span>
                      <span className="text-xs text-viaduct-text-secondary">
                        {formatTimestamp(event.timestamp)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-viaduct-text-secondary">{event.eventType}</p>
                  </button>
                </li>
              );
            })}
          </ol>
        </section>

        <aside
          className="rounded-xl border border-viaduct-border bg-viaduct-card p-6"
          aria-label="Event details drawer"
        >
          <h3 className="text-sm font-semibold uppercase tracking-wide text-viaduct-text-secondary">
            Event Details
          </h3>
          {selectedEvent ? (
            <div className="mt-4 space-y-3">
              <p className="text-lg font-medium text-viaduct-text-primary">{selectedEvent.title}</p>
              <p className="text-sm text-viaduct-text-secondary">{selectedEvent.description}</p>
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="text-viaduct-text-secondary">Type</dt>
                  <dd className="text-white">{selectedEvent.eventType}</dd>
                </div>
                <div>
                  <dt className="text-viaduct-text-secondary">Timestamp</dt>
                  <dd className="text-white">{formatTimestamp(selectedEvent.timestamp)}</dd>
                </div>
                {selectedEvent.severity && (
                  <div>
                    <dt className="text-viaduct-text-secondary">Severity</dt>
                    <dd className="text-white">{selectedEvent.severity}</dd>
                  </div>
                )}
              </dl>
              <pre className="max-h-64 overflow-auto rounded-md bg-viaduct-background p-3 text-xs text-viaduct-text-secondary">
                {JSON.stringify(selectedEvent.metadata, null, 2)}
              </pre>
            </div>
          ) : (
            <p className="mt-4 text-sm text-viaduct-text-secondary">
              Select an event to inspect details.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}
