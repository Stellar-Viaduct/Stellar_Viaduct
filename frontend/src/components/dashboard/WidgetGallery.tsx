import type { DashboardWidgetConfig, DashboardWidgetDefinition } from "../../hooks/useDashboardLayout";

interface WidgetGalleryProps {
  definitions: DashboardWidgetDefinition[];
  layout: DashboardWidgetConfig[];
  onToggle: (id: DashboardWidgetDefinition["id"], enabled: boolean) => void;
  onResize: (id: DashboardWidgetDefinition["id"], size: DashboardWidgetConfig["size"]) => void;
}

export default function WidgetGallery({ definitions, layout, onToggle, onResize }: WidgetGalleryProps) {
  return (
    <section className="rounded-lg border border-viaduct-border bg-viaduct-card p-4">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-viaduct-text-secondary">Widget gallery</h3>
      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {definitions.map((definition) => {
          const config = layout.find((item) => item.id === definition.id);
          const enabled = config?.enabled ?? false;
          const size = config?.size ?? "medium";

          return (
            <article key={definition.id} className="rounded-md border border-viaduct-border bg-viaduct-background p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-sm font-medium text-viaduct-text-primary">{definition.title}</h4>
                  <p className="mt-1 text-xs text-viaduct-text-secondary">{definition.description}</p>
                </div>
                <label className="inline-flex items-center gap-2 text-xs text-viaduct-text-secondary">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(event) => onToggle(definition.id, event.target.checked)}
                    className="h-4 w-4 rounded border-viaduct-border bg-viaduct-background text-viaduct-accent focus:ring-viaduct-accent"
                  />
                  Show
                </label>
              </div>

              <div className="mt-3">
                <label className="text-xs text-viaduct-text-secondary" htmlFor={`size-${definition.id}`}>
                  Size
                </label>
                <select
                  id={`size-${definition.id}`}
                  value={size}
                  onChange={(event) => onResize(definition.id, event.target.value as DashboardWidgetConfig["size"])}
                  className="mt-1 w-full rounded-md border border-viaduct-border bg-viaduct-card px-2 py-1 text-xs text-viaduct-text-primary focus:outline-none focus:ring-2 focus:ring-viaduct-accent"
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>

              <div className="mt-3 rounded border border-dashed border-viaduct-border px-2 py-3 text-xs text-viaduct-text-secondary">
                Preview: {enabled ? `${definition.title} is visible` : `${definition.title} is hidden`}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
