import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-viaduct-background flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <p className="text-7xl font-bold text-viaduct-accent font-display tracking-tight">404</p>
        <h1 className="mt-4 text-xl font-semibold text-viaduct-text-primary">Page not found</h1>
        <p className="mt-2 text-sm text-viaduct-text-secondary">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link
            to="/dashboard"
            className="rounded-xl bg-viaduct-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-viaduct-accent/90 transition-all focus:outline-none focus:ring-2 focus:ring-viaduct-accent"
          >
            Go to Dashboard
          </Link>
          <Link
            to="/"
            className="rounded-xl border border-viaduct-border px-5 py-2.5 text-sm font-medium text-viaduct-text-secondary hover:text-viaduct-text-primary transition-all focus:outline-none focus:ring-2 focus:ring-viaduct-accent"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
