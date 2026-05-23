import { RequireAuth } from "@/components/require-auth";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { useReminders } from "@/lib/reminders";
import { Bell, BellOff, CheckCheck, Inbox, Mail, MailOpen, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — Lumen" },
      { name: "description", content: "Consultez, marquez comme lues et supprimez vos notifications Lumen." },
      { property: "og:title", content: "Notifications — Lumen" },
      { property: "og:description", content: "Centre de notifications de votre espace Lumen." },
    ],
  }),
  component: () => (<RequireAuth><NotificationsPage /></RequireAuth>),
});

const tabs = ["Toutes", "Non lues", "Lues"] as const;

function formatDate(ts: number) {
  const diff = Date.now() - ts;
  const min = Math.round(diff / 60_000);
  if (min < 1) return "À l'instant";
  if (min < 60) return `Il y a ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `Il y a ${h} h`;
  return new Date(ts).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function NotificationsPage() {
  const {
    notifications,
    unreadCount,
    markAllRead,
    toggleRead,
    dismissNotification,
    clearAllNotifications,
  } = useReminders();
  const [tab, setTab] = useState<(typeof tabs)[number]>("Toutes");

  const filtered = useMemo(() => {
    if (tab === "Non lues") return notifications.filter((n) => !n.read);
    if (tab === "Lues") return notifications.filter((n) => n.read);
    return notifications;
  }, [notifications, tab]);

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-4 py-6 md:px-8 md:py-8">
        <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Centre de notifications
            </p>
            <h1 className="mt-1 font-display text-2xl font-semibold md:text-3xl">
              Vos notifications
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {notifications.length === 0
                ? "Vous êtes à jour — aucune notification pour le moment."
                : `${unreadCount} non lue${unreadCount > 1 ? "s" : ""} sur ${notifications.length}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={markAllRead}
              disabled={unreadCount === 0}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-elevated px-3 py-2 text-xs font-semibold hover:bg-muted disabled:opacity-50"
            >
              <CheckCheck className="h-3.5 w-3.5" /> Tout marquer lu
            </button>
            <button
              onClick={clearAllNotifications}
              disabled={notifications.length === 0}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-elevated px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10 disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" /> Tout effacer
            </button>
          </div>
        </header>

        <div className="mb-6 flex flex-wrap gap-2">
          {tabs.map((t) => {
            const count =
              t === "Toutes"
                ? notifications.length
                : t === "Non lues"
                  ? unreadCount
                  : notifications.length - unreadCount;
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={[
                  "inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold transition",
                  tab === t
                    ? "bg-primary text-primary-foreground shadow-soft"
                    : "border border-border bg-surface-elevated text-foreground/70 hover:text-foreground",
                ].join(" ")}
              >
                {t}
                <span
                  className={[
                    "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                    tab === t ? "bg-primary-foreground/20" : "bg-muted",
                  ].join(" ")}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-surface-elevated px-6 py-16 text-center">
            {notifications.length === 0 ? (
              <BellOff className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
            ) : (
              <Inbox className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
            )}
            <p className="text-sm font-semibold">
              {notifications.length === 0
                ? "Aucune notification"
                : "Rien dans cette catégorie"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {notifications.length === 0
                ? "Activez des rappels depuis l'emploi du temps pour recevoir des alertes."
                : "Changez d'onglet pour voir d'autres notifications."}
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {filtered.map((n) => (
              <li
                key={n.id}
                className={[
                  "group flex gap-3 rounded-2xl border bg-card p-4 shadow-soft transition",
                  n.read
                    ? "border-border"
                    : "border-primary/30 bg-primary-soft/30",
                ].join(" ")}
              >
                <div
                  className={[
                    "grid h-10 w-10 shrink-0 place-items-center rounded-xl",
                    n.read ? "bg-muted text-muted-foreground" : "bg-primary text-primary-foreground",
                  ].join(" ")}
                  aria-hidden
                >
                  <Bell className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className={["text-sm", n.read ? "font-medium" : "font-semibold"].join(" ")}>
                      {n.title}
                    </p>
                    {!n.read && (
                      <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
                        Nouveau
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{n.body}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground/70">
                    {formatDate(n.createdAt)}
                  </p>
                </div>
                <div className="flex flex-col gap-1 sm:flex-row">
                  <button
                    onClick={() => toggleRead(n.id)}
                    className="inline-flex items-center gap-1 rounded-md border border-border bg-surface-elevated px-2 py-1 text-[11px] font-semibold hover:bg-muted"
                    aria-label={n.read ? "Marquer comme non lue" : "Marquer comme lue"}
                  >
                    {n.read ? (
                      <>
                        <Mail className="h-3 w-3" />
                        <span className="hidden sm:inline">Non lue</span>
                      </>
                    ) : (
                      <>
                        <MailOpen className="h-3 w-3" />
                        <span className="hidden sm:inline">Lue</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => dismissNotification(n.id)}
                    className="inline-flex items-center gap-1 rounded-md border border-border bg-surface-elevated px-2 py-1 text-[11px] font-semibold text-destructive hover:bg-destructive/10"
                    aria-label="Supprimer la notification"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span className="hidden sm:inline">Supprimer</span>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <p className="mt-8 text-center text-[11px] text-muted-foreground">
          Configurez vos rappels d'événements depuis{" "}
          <Link to="/schedule" className="font-semibold text-primary hover:underline">
            l'emploi du temps
          </Link>
          .
        </p>
      </div>
    </AppShell>
  );
}
