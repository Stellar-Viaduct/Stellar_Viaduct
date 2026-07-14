interface Props {
  value: string;
  onChange: (v: string) => void;
}

export default function ApiSearch({ value, onChange }: Props) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-viaduct-text-secondary text-sm">⌕</span>
      <input
        type="search"
        placeholder="Search endpoints…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-viaduct-card border border-viaduct-border rounded-lg pl-8 pr-4 py-2 text-sm text-white placeholder-stellar-text-secondary focus:outline-none focus:border-viaduct-accent"
        aria-label="Search API endpoints"
      />
    </div>
  );
}
