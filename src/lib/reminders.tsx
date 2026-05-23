import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";

export type ReminderOffset = 5 | 15 | 30 | 60 | 1440;

export const REMINDER_PRESETS: { value: ReminderOffset; label: string }[] = [
  { value: 5, label: "5 min avant" },
  { value: 15, label: "15 min avant" },
  { value: 30, label: "30 min avant" },
  { value: 60, label: "1 heure avant" },
  { value: 1440, label: "1 jour avant" },
];

export type AppNotification = {
  id: string;
  title: string;
  body: string;
  createdAt: number;
  read: boolean;
  eventId?: string;
};

type StoredReminder = {
  id: string; // `${eventId}-${minutes}`
  eventId: string;
  title: string;
  startISO: string;
  minutesBefore: ReminderOffset;
  fired: boolean;
};

type Ctx = {
  remindersByEvent: Record<string, ReminderOffset[]>;
  notifications: AppNotification[];
  unreadCount: number;
  setEventReminders: (
    eventId: string,
    title: string,
    start: Date,
    offsets: ReminderOffset[],
  ) => void;
  clearEventReminders: (eventId: string) => void;
  markAllRead: () => void;
  markRead: (id: string) => void;
  toggleRead: (id: string) => void;
  dismissNotification: (id: string) => void;
  clearAllNotifications: () => void;
  addNotification: (n: Omit<AppNotification, "id" | "createdAt" | "read">) => void;
};

const ReminderCtx = createContext<Ctx | null>(null);

const REMINDERS_KEY = "lumen.reminders.v1";
const NOTIFS_KEY = "lumen.notifications.v1";

function load<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

export function ReminderProvider({ children }: { children: ReactNode }) {
  const [reminders, setReminders] = useState<StoredReminder[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const hydrated = useRef(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    setReminders(load<StoredReminder[]>(REMINDERS_KEY, []));
    setNotifications(load<AppNotification[]>(NOTIFS_KEY, []));
    hydrated.current = true;
  }, []);

  useEffect(() => {
    if (hydrated.current) save(REMINDERS_KEY, reminders);
  }, [reminders]);

  useEffect(() => {
    if (hydrated.current) save(NOTIFS_KEY, notifications);
  }, [notifications]);

  const fireReminder = useCallback((r: StoredReminder) => {
    const start = new Date(r.startISO);
    const label =
      r.minutesBefore >= 1440
        ? `${Math.round(r.minutesBefore / 1440)}j`
        : r.minutesBefore >= 60
          ? `${Math.round(r.minutesBefore / 60)}h`
          : `${r.minutesBefore} min`;
    const timeStr = `${start.getHours().toString().padStart(2, "0")}:${start
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
    const body = `${r.title} commence dans ${label} (${timeStr})`;
    toast(`⏰ Rappel — ${label}`, { description: body, duration: 8000 });
    setNotifications((prev) => [
      {
        id: `n-${r.id}-${Date.now()}`,
        title: `Rappel : ${r.title}`,
        body,
        createdAt: Date.now(),
        read: false,
        eventId: r.eventId,
      },
      ...prev,
    ].slice(0, 30));
  }, []);

  // Poll for due reminders
  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      let changed = false;
      const next = reminders.map((r) => {
        if (r.fired) return r;
        const triggerAt =
          new Date(r.startISO).getTime() - r.minutesBefore * 60_000;
        if (now >= triggerAt && now <= new Date(r.startISO).getTime() + 60_000) {
          fireReminder(r);
          changed = true;
          return { ...r, fired: true };
        }
        // Auto-mark past-event reminders as fired so they don't trigger late
        if (now > new Date(r.startISO).getTime() + 60_000) {
          changed = true;
          return { ...r, fired: true };
        }
        return r;
      });
      if (changed) setReminders(next);
    };
    tick();
    const id = window.setInterval(tick, 20_000);
    return () => window.clearInterval(id);
  }, [reminders, fireReminder]);

  const setEventReminders = useCallback(
    (
      eventId: string,
      title: string,
      start: Date,
      offsets: ReminderOffset[],
    ) => {
      setReminders((prev) => {
        const without = prev.filter((r) => r.eventId !== eventId);
        const fresh: StoredReminder[] = offsets.map((m) => ({
          id: `${eventId}-${m}`,
          eventId,
          title,
          startISO: start.toISOString(),
          minutesBefore: m,
          fired: false,
        }));
        return [...without, ...fresh];
      });
    },
    [],
  );

  const clearEventReminders = useCallback((eventId: string) => {
    setReminders((prev) => prev.filter((r) => r.eventId !== eventId));
  }, []);

  const remindersByEvent = useMemo(() => {
    const map: Record<string, ReminderOffset[]> = {};
    for (const r of reminders) {
      if (!map[r.eventId]) map[r.eventId] = [];
      map[r.eventId].push(r.minutesBefore);
    }
    return map;
  }, [reminders]);

  const value: Ctx = {
    remindersByEvent,
    notifications,
    unreadCount: notifications.filter((n) => !n.read).length,
    setEventReminders,
    clearEventReminders,
    markAllRead: () =>
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true }))),
    markRead: (id) =>
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
      ),
    toggleRead: (id) =>
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n)),
      ),
    dismissNotification: (id) =>
      setNotifications((prev) => prev.filter((n) => n.id !== id)),
    clearAllNotifications: () => setNotifications([]),
    addNotification: (n) =>
      setNotifications((prev) =>
        [
          {
            id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            createdAt: Date.now(),
            read: false,
            ...n,
          },
          ...prev,
        ].slice(0, 50),
      ),
  };

  return <ReminderCtx.Provider value={value}>{children}</ReminderCtx.Provider>;
}

export function useReminders() {
  const ctx = useContext(ReminderCtx);
  if (!ctx) throw new Error("useReminders must be used within ReminderProvider");
  return ctx;
}
