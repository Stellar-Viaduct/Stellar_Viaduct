import { useState, type ReactNode } from "react";

interface HelpTooltipProps {
  label: string;
  children?: ReactNode;
}

export default function HelpTooltip({ label, children }: HelpTooltipProps) {
  const [open, setOpen] = useState(false);

  return (
    <span className="relative inline-flex items-center">
      <button
        type="button"
        className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-viaduct-border text-xs text-viaduct-text-secondary hover:text-viaduct-text-primary focus:outline-none focus:ring-2 focus:ring-viaduct-accent"
        aria-label="Show contextual help"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        ?
      </button>
      {open && (
        <span
          role="tooltip"
          className="absolute left-1/2 top-full z-20 mt-2 w-56 -translate-x-1/2 rounded-md border border-viaduct-border bg-viaduct-card p-2 text-xs text-viaduct-text-secondary shadow-lg"
        >
          {children ?? label}
        </span>
      )}
    </span>
  );
}
