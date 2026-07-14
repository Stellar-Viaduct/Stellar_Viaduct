import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useNotificationLiveUpdates } from "../hooks/useNotificationLiveUpdates";
import { useWatchlist } from "../hooks/useWatchlist";
import { selectUnreadCount, useNotificationStore } from "../stores/notificationStore";
import EntitySwitcher from "./EntitySwitcher";
import HamburgerButton from "./MobileNav/HamburgerButton";
import MobileMenu from "./MobileNav/MobileMenu";
import { isNavItemActive } from "./MobileNav/navigation";
import { useTranslatedDesktopNavItems } from "../hooks/useTranslatedNav";
import NotificationsDrawer from "./NotificationsDrawer";
import GlobalSearch from "./search/GlobalSearch";
import UnreadCountBadge from "./UnreadCountBadge";

export default function Navbar() {
  const location = useLocation();
  const desktopNavItems = useTranslatedDesktopNavItems();
  const { activeSymbols } = useWatchlist();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const notificationTriggerRef = useRef<HTMLButtonElement | null>(null);
  const previousDrawerOpen = useRef(false);
  const unreadCount = useNotificationStore(selectUnreadCount);

  useNotificationLiveUpdates();

  useEffect(() => {
    if (previousDrawerOpen.current && !isNotificationsOpen) {
      notificationTriggerRef.current?.focus();
    }
    previousDrawerOpen.current = isNotificationsOpen;
  }, [isNotificationsOpen]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <>
      <nav className="border-b border-viaduct-border glass-panel sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-6">
              <Link to="/dashboard" className="shrink-0 flex items-center gap-2.5 text-lg font-bold text-viaduct-text-primary font-display tracking-tight">
                <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-viaduct-accent/10 text-viaduct-accent">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  </svg>
                </span>
                <span className="hidden sm:inline">Stellar <span className="text-viaduct-accent">Viaduct</span></span>
              </Link>

              <div className="hidden items-center gap-1 xl:flex" aria-label="Primary navigation">
                {desktopNavItems.slice(0, 8).map((item) => {
                  const active = isNavItemActive(location.pathname, item.to);
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={`rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                        active
                          ? "bg-viaduct-accent/15 text-viaduct-accent"
                          : "text-viaduct-text-secondary hover:bg-viaduct-surface hover:text-viaduct-text-primary"
                      }`}
                      aria-current={active ? "page" : undefined}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden lg:block">
                <GlobalSearch />
              </div>
              <div className="hidden md:block">
                <EntitySwitcher />
              </div>
              <button
                type="button"
                className="hidden rounded-lg px-2.5 py-1.5 text-sm text-viaduct-text-secondary hover:bg-viaduct-surface hover:text-viaduct-text-primary lg:inline-flex transition-all font-mono"
                onClick={() =>
                  window.dispatchEvent(new CustomEvent("viaduct:open-shortcuts"))
                }
                aria-label="Keyboard shortcuts"
              >
                ?
              </button>
              <div className="hidden items-center gap-2 text-xs text-viaduct-text-secondary lg:flex">
                <span className="text-[0.65rem] uppercase tracking-wider font-semibold">Quick:</span>
                {activeSymbols.length === 0 ? (
                  <span className="text-[0.65rem]">No watchlist assets</span>
                ) : (
                  activeSymbols.slice(0, 3).map((symbol) => (
                    <Link
                      key={symbol}
                      to={`/assets/${symbol}`}
                      className="rounded-lg border border-viaduct-border px-2.5 py-1 hover:text-viaduct-text-primary hover:border-viaduct-accent/30 transition-all font-medium"
                    >
                      {symbol}
                    </Link>
                  ))
                )}
              </div>

              <button
                ref={notificationTriggerRef}
                type="button"
                onClick={() => setIsNotificationsOpen((open) => !open)}
                className={`relative rounded-lg p-2.5 transition-all focus:outline-none focus:ring-2 focus:ring-viaduct-accent ${
                  isNotificationsOpen
                    ? "bg-viaduct-accent/15 text-viaduct-accent"
                    : "text-viaduct-text-secondary hover:bg-viaduct-surface hover:text-viaduct-text-primary"
                }`}
                aria-label={
                  isNotificationsOpen
                    ? "Close notifications"
                    : `Open notifications (${unreadCount} unread)`
                }
                aria-expanded={isNotificationsOpen}
                aria-controls="notifications-drawer"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                <UnreadCountBadge unreadCount={unreadCount} />
              </button>

              <HamburgerButton
                open={isMobileMenuOpen}
                onClick={() => setIsMobileMenuOpen((open) => !open)}
              />
            </div>
          </div>
        </div>
      </nav>

      <NotificationsDrawer
        open={isNotificationsOpen}
        drawerId="notifications-drawer"
        onClose={() => setIsNotificationsOpen(false)}
      />
      <MobileMenu
        open={isMobileMenuOpen}
        pathname={location.pathname}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </>
  );
}
