import { useState } from "react";
import { THEME_PRESETS } from "../../theme/themePresets";
import { useThemeStore } from "../../stores/themeStore";

export default function ThemePresetsSection() {
  const activePresetId = useThemeStore((s) => s.activePresetId);
  const customPresets = useThemeStore((s) => s.customPresets);
  const resolvedMode = useThemeStore((s) => s.resolvedMode);
  const applyLibraryPreset = useThemeStore((s) => s.applyLibraryPreset);
  const applySavedCustomPreset = useThemeStore((s) => s.applySavedCustomPreset);
  const saveCurrentAsCustomPreset = useThemeStore((s) => s.saveCurrentAsCustomPreset);
  const removeCustomPreset = useThemeStore((s) => s.removeCustomPreset);

  const [saveLabel, setSaveLabel] = useState("");

  return (
    <section
      className="rounded-xl border border-viaduct-border bg-viaduct-card p-6 space-y-6"
      aria-labelledby="theme-presets-heading"
    >
      <div>
        <h2 id="theme-presets-heading" className="text-lg font-semibold text-viaduct-text-primary">
          Theme presets
        </h2>
        <p className="mt-1 text-sm text-viaduct-text-secondary">
          Curated palettes with light and dark pairs. Saved presets stay in this browser only.
        </p>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {THEME_PRESETS.map((preset) => {
          const preview = resolvedMode === "dark" ? preset.dark : preset.light;
          const selected = activePresetId === preset.id;
          return (
            <li key={preset.id}>
              <article
                className={`flex h-full flex-col rounded-lg border p-4 transition-colors ${
                  selected
                    ? "border-viaduct-accent bg-viaduct-accent/10"
                    : "border-viaduct-border bg-viaduct-background/30 hover:border-viaduct-accent/40"
                }`}
              >
                <div className="mb-3 flex gap-1.5" aria-hidden>
                  <span
                    className="h-8 flex-1 rounded-md border border-white/10"
                    style={{ backgroundColor: preview.primary }}
                  />
                  <span
                    className="h-8 flex-1 rounded-md border border-white/10"
                    style={{ backgroundColor: preview.accent }}
                  />
                  <span
                    className="h-8 flex-1 rounded-md border border-white/10"
                    style={{ backgroundColor: preview.surface }}
                  />
                </div>
                <h3 className="font-medium text-viaduct-text-primary">{preset.label}</h3>
                <p className="mt-1 flex-1 text-xs text-viaduct-text-secondary">{preset.description}</p>
                <button
                  type="button"
                  className={`mt-3 w-full rounded-md px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-viaduct-accent focus:ring-offset-2 focus:ring-offset-stellar-card ${
                    selected
                      ? "bg-viaduct-accent text-white"
                      : "border border-viaduct-border bg-viaduct-background text-viaduct-text-primary hover:bg-stellar-border"
                  }`}
                  aria-pressed={selected}
                  onClick={() => applyLibraryPreset(preset.id)}
                >
                  {selected ? "Active" : "Apply"}
                </button>
              </article>
            </li>
          );
        })}
      </ul>

      <div className="rounded-lg border border-viaduct-border border-dashed p-4 space-y-3">
        <p className="text-sm font-medium text-viaduct-text-primary">Save current theme</p>
        <p className="text-xs text-viaduct-text-secondary">
          Captures colors for the active appearance ({resolvedMode}) plus defaults for the other mode,
          typography, and density.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <label className="sr-only" htmlFor="custom-preset-label">
            Preset name
          </label>
          <input
            id="custom-preset-label"
            type="text"
            value={saveLabel}
            onChange={(e) => setSaveLabel(e.target.value)}
            placeholder="My workspace"
            className="min-w-0 flex-1 rounded-md border border-viaduct-border bg-viaduct-background px-3 py-2 text-sm text-white placeholder:text-stellar-text-muted focus:outline-none focus:ring-2 focus:ring-viaduct-accent"
          />
          <button
            type="button"
            className="rounded-md bg-viaduct-accent px-4 py-2 text-sm font-medium text-white hover:bg-viaduct-accent/90 focus:outline-none focus:ring-2 focus:ring-viaduct-accent focus:ring-offset-2 focus:ring-offset-stellar-card"
            onClick={() => {
              saveCurrentAsCustomPreset(saveLabel);
              setSaveLabel("");
            }}
          >
            Save preset
          </button>
        </div>
      </div>

      {customPresets.length > 0 ? (
        <div>
          <h3 className="mb-2 text-sm font-medium text-viaduct-text-primary">Your saved presets</h3>
          <ul className="space-y-2">
            {customPresets.map((p) => (
              <li
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-viaduct-border bg-viaduct-background/40 px-3 py-2"
              >
                <span className="text-sm text-viaduct-text-primary">{p.label}</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="rounded border border-viaduct-border px-2 py-1 text-xs text-viaduct-text-secondary hover:text-white"
                    onClick={() => applySavedCustomPreset(p.id)}
                  >
                    Apply
                  </button>
                  <button
                    type="button"
                    className="rounded border border-red-500/40 px-2 py-1 text-xs text-red-400 hover:bg-red-500/10"
                    onClick={() => removeCustomPreset(p.id)}
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
