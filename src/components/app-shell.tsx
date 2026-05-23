import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  BookOpen,
  CalendarDays,
  Dumbbell,
  StickyNote,
  Settings,
  Search,
  Bell,
  GraduationCap,
  Sparkles,
  LogOut,
  Check,
  X as XIcon,
  Menu,
  UserCircle2,
  Briefcase,
  ClipboardCheck,
} from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useReminders } from "@/lib/reminders";
import { useSession } from "@/lib/session";

const baseNav = [
  { to: "/", label: "Tableau de bord", icon: LayoutDashboard, exact: true },
  { to: "/courses", label: "Cours", icon: BookOpen },
  { to: "/schedule", label: "Emploi du temps", icon: CalendarDays },
  { to: "/exercises", label: "Ateliers", icon: Dumbbell },
  { to: "/exams", label: "Examens", icon: ClipboardCheck },
  { to: "/notes", label: "Notes", icon: StickyNote },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useSession();
  const navigate = useNavigate();

  const nav = [
    ...baseNav,
    ...(user.role === "teacher"
      ? [{ to: "/teacher", label: "Espace enseignant", icon: Briefcase }]
      : []),
  ];

  const isActive = (to: string, exact?: boolean) =>
    exact ? pathname === to : pathname === to || pathname.startsWith(to + "/");

  // Close mobile drawer on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  function handleLogout() {
    logout();
    navigate({ to: "/login" });
  }

  return (
    <div className="min-h-dvh bg-surface">
      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85%] bg-surface-elevated shadow-elegant">
            <SidebarContent
              nav={nav}
              isActive={isActive}
              onNavigate={() => setMobileOpen(false)}
            />
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border bg-surface-elevated lg:flex">
        <SidebarContent nav={nav} isActive={isActive} />
      </aside>

      {/* Main */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-2 border-b border-border bg-background/80 px-3 backdrop-blur-md md:gap-3 md:px-8">
          <button
            type="button"
            aria-label="Ouvrir le menu"
            onClick={() => setMobileOpen(true)}
            className="grid h-10 w-10 place-items-center rounded-lg border border-border bg-surface-elevated text-foreground/70 lg:hidden"
          >
            <Menu className="h-4 w-4" />
          </button>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const q = new FormData(e.currentTarget).get("q")?.toString().trim();
              navigate({ to: "/courses", search: q ? { q } : undefined });
            }}
            className="flex flex-1 items-center gap-3"
          >
            <div className="relative w-full max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                name="q"
                placeholder="Rechercher un cours, un prof, un sujet…"
                className="h-10 w-full rounded-lg border border-border bg-surface pl-9 pr-3 text-sm outline-none transition focus:border-primary focus:bg-surface-elevated focus:ring-4 focus:ring-primary/10"
              />
            </div>
          </form>

          <NotificationsBell />

          <Link
            to="/settings"
            aria-label="Paramètres"
            className="hidden h-10 w-10 place-items-center rounded-lg border border-border bg-surface-elevated text-foreground/70 transition hover:text-foreground sm:grid"
          >
            <Settings className="h-4 w-4" />
          </Link>
          <Link
            to="/profile"
            className="hidden items-center gap-3 rounded-lg border border-border bg-surface-elevated py-1 pl-1 pr-3 transition hover:bg-muted sm:flex"
            aria-label="Mon profil"
          >
            <div className="grid h-8 w-8 place-items-center rounded-md bg-primary text-xs font-semibold text-primary-foreground">
              {user.initials}
            </div>
            <div className="hidden text-left md:block">
              <p className="text-xs font-semibold leading-tight">{user.name}</p>
              <p className="text-[11px] leading-tight text-muted-foreground">{user.subtitle}</p>
            </div>
          </Link>
          <Link
            to="/profile"
            aria-label="Mon profil"
            className="grid h-10 w-10 place-items-center rounded-lg border border-border bg-surface-elevated text-foreground/70 sm:hidden"
          >
            <UserCircle2 className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            aria-label="Se déconnecter"
            className="grid h-10 w-10 place-items-center rounded-lg border border-border bg-surface-elevated text-foreground/70 transition hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </header>

        <main>{children}</main>
      </div>
    </div>
  );
}

function SidebarContent({
  nav,
  isActive,
  onNavigate,
}: {
  nav: { to: string; label: string; icon: React.ComponentType<{ className?: string }>; exact?: boolean }[];
  isActive: (to: string, exact?: boolean) => boolean;
  onNavigate?: () => void;
}) {
  return (
    <>
      <div className="flex h-16 items-center gap-2 px-6">
        <div className="grid h-9 w-9 place-items-center rounded-xl gradient-primary text-primary-foreground shadow-soft">
          <GraduationCap className="h-5 w-5" />
        </div>
        <div className="leading-tight">
          <p className="font-display text-base font-semibold">Lumen</p>
          <p className="text-[11px] text-muted-foreground">École en ligne</p>
        </div>
      </div>

      <nav className="flex-1 space-y-6 px-3 py-4">
        <div>
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Apprendre
          </p>
          <ul className="space-y-1">
            {nav.map((item) => {
              const active = isActive(item.to, item.exact);
              return (
                <li key={item.label}>
                  <Link
                    to={item.to}
                    onClick={onNavigate}
                    className={[
                      "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                      active
                        ? "bg-primary-soft text-primary"
                        : "text-foreground/70 hover:bg-muted hover:text-foreground",
                    ].join(" ")}
                  >
                    <item.icon className="h-4 w-4" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <div>
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Mon compte
          </p>
          <ul className="space-y-1">
            <li>
              <Link
                to="/profile"
                onClick={onNavigate}
                className={[
                  "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  isActive("/profile")
                    ? "bg-primary-soft text-primary"
                    : "text-foreground/70 hover:bg-muted hover:text-foreground",
                ].join(" ")}
              >
                <UserCircle2 className="h-4 w-4" />
                <span className="font-medium">Profil</span>
              </Link>
            </li>
            <li>
              <Link
                to="/settings"
                onClick={onNavigate}
                className={[
                  "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  isActive("/settings")
                    ? "bg-primary-soft text-primary"
                    : "text-foreground/70 hover:bg-muted hover:text-foreground",
                ].join(" ")}
              >
                <Settings className="h-4 w-4" />
                <span className="font-medium">Paramètres</span>
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      <div className="m-3 rounded-xl border border-border bg-gradient-to-br from-primary-soft to-transparent p-4">
        <div className="mb-2 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <p className="text-sm font-semibold">Passez à Lumen Pro</p>
        </div>
        <p className="text-xs text-muted-foreground">
          Cours illimités, certifications & mentorat 1:1.
        </p>
        <button className="mt-3 w-full rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground shadow-soft transition hover:opacity-90">
          Découvrir
        </button>
      </div>
    </>
  );
}

function NotificationsBell() {
  const {
    notifications,
    unreadCount,
    markAllRead,
    markRead,
    dismissNotification,
    clearAllNotifications,
  } = useReminders();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
        aria-haspopup="dialog"
        aria-expanded={open}
        className="relative grid h-10 w-10 place-items-center rounded-lg border border-border bg-surface-elevated text-foreground/70 transition hover:text-foreground"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground ring-2 ring-background">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div
          role="dialog"
          aria-label="Notifications récentes"
          className="absolute right-0 top-12 z-40 w-80 overflow-hidden rounded-xl border border-border bg-card shadow-elegant"
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div>
              <p className="text-sm font-semibold">Notifications</p>
              <p className="text-[11px] text-muted-foreground">
                {notifications.length === 0
                  ? "Tout est calme"
                  : `${unreadCount} non lue${unreadCount > 1 ? "s" : ""} · ${notifications.length} au total`}
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-[11px] font-semibold text-primary hover:underline"
              >
                Tout marquer lu
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <Bell className="mx-auto mb-2 h-6 w-6 text-muted-foreground/60" />
                <p className="text-xs text-muted-foreground">
                  Vos rappels d'événements apparaîtront ici.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {notifications.slice(0, 6).map((n) => (
                  <li
                    key={n.id}
                    className={[
                      "group flex items-start gap-3 px-4 py-3 transition hover:bg-surface",
                      n.read ? "" : "bg-primary-soft/40",
                    ].join(" ")}
                  >
                    <button
                      onClick={() => !n.read && markRead(n.id)}
                      aria-label={n.read ? "Lu" : "Marquer comme lu"}
                      className={[
                        "mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-md",
                        n.read
                          ? "bg-muted text-muted-foreground"
                          : "bg-primary text-primary-foreground",
                      ].join(" ")}
                    >
                      {n.read ? <Check className="h-3.5 w-3.5" /> : <Bell className="h-3.5 w-3.5" />}
                    </button>
                    <div className="min-w-0 flex-1">
                      <p className={["truncate text-sm", n.read ? "font-medium" : "font-semibold"].join(" ")}>
                        {n.title}
                      </p>
                      <p className="line-clamp-2 text-[11px] text-muted-foreground">{n.body}</p>
                      <p className="mt-0.5 text-[10px] text-muted-foreground/70">
                        {new Date(n.createdAt).toLocaleString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                          day: "2-digit",
                          month: "short",
                        })}
                      </p>
                    </div>
                    <button
                      onClick={() => dismissNotification(n.id)}
                      className="opacity-0 transition group-hover:opacity-100"
                      aria-label="Supprimer la notification"
                    >
                      <XIcon className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="flex items-center justify-between gap-2 border-t border-border bg-surface px-4 py-2">
            <Link
              to="/notifications"
              onClick={() => setOpen(false)}
              className="text-[11px] font-semibold text-primary hover:underline"
            >
              Voir toutes les notifications
            </Link>
            {notifications.length > 0 && (
              <button
                onClick={clearAllNotifications}
                className="text-[11px] font-semibold text-muted-foreground hover:text-destructive"
              >
                Tout effacer
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
