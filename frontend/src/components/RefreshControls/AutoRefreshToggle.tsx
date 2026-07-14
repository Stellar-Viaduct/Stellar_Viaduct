type AutoRefreshToggleProps = {
  checked: boolean;
  onChange: (value: boolean) => void;
};

export default function AutoRefreshToggle({ checked, onChange }: AutoRefreshToggleProps) {
  return (
    <label className="inline-flex items-center gap-2 text-sm text-viaduct-text-secondary">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 rounded border-viaduct-border bg-viaduct-background text-viaduct-accent focus:ring-viaduct-accent"
      />
      Auto refresh
    </label>
  );
}
