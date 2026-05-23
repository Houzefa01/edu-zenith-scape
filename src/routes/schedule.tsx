import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { upcomingSchedule } from "@/lib/mock-data";
import {
  useReminders,
  REMINDER_PRESETS,
  type ReminderOffset,
} from "@/lib/reminders";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  CalendarDays,
  Clock,
  Video,
  X,
  MapPin,
  Users,
  BellRing,
  Pencil,
  Trash2,

} from "lucide-react";


export const Route = createFileRoute("/schedule")({
  head: () => ({
    meta: [
      { title: "Emploi du temps — Lumen" },
      { name: "description", content: "Visualisez vos cours, ateliers et examens à venir sur Lumen. Vue mensuelle et hebdomadaire, création rapide d'événements." },
      { property: "og:title", content: "Emploi du temps — Lumen" },
      { property: "og:description", content: "Votre planning d'apprentissage." },
    ],
  }),
  component: SchedulePage,
});

// ---------- Types & helpers ----------

type EventType = "Live" | "Atelier" | "Examen" | "Personnel";

type AgendaEvent = {
  id: string;
  title: string;
  teacher?: string;
  type: EventType;
  // Date object representing the start
  start: Date;
  duration: number; // minutes
  location?: string;
};

const TYPE_TONE: Record<EventType, string> = {
  Live: "bg-primary/10 border-primary/30 text-primary",
  Atelier: "bg-success/10 border-success/30 text-success",
  Examen: "bg-warning/15 border-warning/40 text-warning-foreground",
  Personnel: "bg-accent/15 border-accent/40 text-accent-foreground",
};

const TYPE_DOT: Record<EventType, string> = {
  Live: "bg-primary",
  Atelier: "bg-success",
  Examen: "bg-warning",
  Personnel: "bg-accent",
};

const DAYS_LABEL = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const MONTHS_LABEL = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

function startOfWeek(d: Date) {
  const date = new Date(d);
  const day = (date.getDay() + 6) % 7; // Mon = 0
  date.setDate(date.getDate() - day);
  date.setHours(0, 0, 0, 0);
  return date;
}

function addDays(d: Date, n: number) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatDayHeader(d: Date) {
  return `${DAYS_LABEL[(d.getDay() + 6) % 7]} ${d.getDate()}`;
}

// ---------- Seed events ----------

const today = new Date();
const weekStart = startOfWeek(today);

const seedEvents: AgendaEvent[] = [
  {
    id: "s1",
    title: "Tokens en production",
    teacher: "Amélie Rousseau",
    type: "Live",
    start: new Date(addDays(weekStart, 0).setHours(14, 0, 0, 0)),
    duration: 60,
    location: "Salle Zoom A",
  },
  {
    id: "s2",
    title: "React Profiler",
    teacher: "Karim Benali",
    type: "Atelier",
    start: new Date(addDays(weekStart, 1).setHours(10, 0, 0, 0)),
    duration: 90,
    location: "Studio 2",
  },
  {
    id: "s3",
    title: "Workshop Dataviz",
    teacher: "Sofia Marín",
    type: "Atelier",
    start: new Date(addDays(weekStart, 2).setHours(12, 0, 0, 0)),
    duration: 90,
  },
  {
    id: "s4",
    title: "Examen UX Research",
    teacher: "Léa Tanaka",
    type: "Examen",
    start: new Date(addDays(weekStart, 3).setHours(9, 0, 0, 0)),
    duration: 45,
  },
  {
    id: "s5",
    title: "Q&A Stratégie produit",
    teacher: "Hugo Lefèvre",
    type: "Live",
    start: new Date(addDays(weekStart, 4).setHours(17, 0, 0, 0)),
    duration: 60,
  },
  {
    id: "s6",
    title: "Live : Design Tokens v2",
    teacher: "Amélie Rousseau",
    type: "Live",
    start: new Date(addDays(weekStart, 7).setHours(15, 0, 0, 0)),
    duration: 60,
  },
  {
    id: "s7",
    title: "Examen final React",
    teacher: "Karim Benali",
    type: "Examen",
    start: new Date(addDays(weekStart, 10).setHours(10, 0, 0, 0)),
    duration: 120,
  },
];

// ---------- Component ----------

const HOURS = Array.from({ length: 11 }, (_, i) => i + 8); // 08 → 18

function SchedulePage() {
  const { setEventReminders, clearEventReminders, remindersByEvent } = useReminders();
  const [view, setView] = useState<"week" | "month">("week");
  const [cursor, setCursor] = useState<Date>(today);
  const [events, setEvents] = useState<AgendaEvent[]>(seedEvents);
  const [modal, setModal] = useState<{
    open: boolean;
    date?: Date;
    hour?: number;
    editing?: AgendaEvent;
  }>({ open: false });


  const weekDays = useMemo(() => {
    const s = startOfWeek(cursor);
    return Array.from({ length: 7 }, (_, i) => addDays(s, i));
  }, [cursor]);

  const monthGrid = useMemo(() => {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const gridStart = startOfWeek(first);
    return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
  }, [cursor]);

  const weekEvents = useMemo(
    () =>
      events.filter((e) =>
        weekDays.some((d) => sameDay(d, e.start))
      ),
    [events, weekDays]
  );

  const upcomingFromNow = useMemo(
    () =>
      [...events]
        .filter((e) => e.start.getTime() >= Date.now() - 60 * 60 * 1000)
        .sort((a, b) => a.start.getTime() - b.start.getTime())
        .slice(0, 5),
    [events]
  );

  const headerTitle =
    view === "week"
      ? `Semaine du ${weekDays[0].getDate()} ${MONTHS_LABEL[weekDays[0].getMonth()]}`
      : `${MONTHS_LABEL[cursor.getMonth()]} ${cursor.getFullYear()}`;

  const totalMinutes = weekEvents.reduce((acc, e) => acc + e.duration, 0);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;

  function navigate(dir: -1 | 1) {
    if (view === "week") setCursor(addDays(cursor, dir * 7));
    else {
      const c = new Date(cursor);
      c.setMonth(c.getMonth() + dir);
      setCursor(c);
    }
  }

  function openCreate(date?: Date, hour?: number) {
    setModal({ open: true, date: date ?? today, hour });
  }

  function openEdit(ev: AgendaEvent) {
    setModal({ open: true, editing: ev });
  }

  function handleCreate(e: AgendaEvent, reminderOffsets: ReminderOffset[]) {
    setEvents((prev) => [...prev, e]);
    setEventReminders(e.id, e.title, e.start, reminderOffsets);
    setModal({ open: false });
  }

  function handleUpdate(e: AgendaEvent, reminderOffsets: ReminderOffset[]) {
    setEvents((prev) => prev.map((x) => (x.id === e.id ? e : x)));
    setEventReminders(e.id, e.title, e.start, reminderOffsets);
    setModal({ open: false });
  }

  function handleDelete(id: string) {
    setEvents((prev) => prev.filter((x) => x.id !== id));
    clearEventReminders(id);
    setModal({ open: false });
  }



  return (
    <AppShell>
      <div className="space-y-6 p-4 md:p-8">
        {/* Header */}
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              Planning
            </p>
            <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
              {headerTitle}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {view === "week"
                ? `${weekEvents.length} session${weekEvents.length > 1 ? "s" : ""} planifiée${weekEvents.length > 1 ? "s" : ""} · ${h}h ${m.toString().padStart(2, "0")}`
                : `${events.filter((e) => e.start.getMonth() === cursor.getMonth() && e.start.getFullYear() === cursor.getFullYear()).length} événements ce mois`}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {/* View toggle */}
            <div className="flex rounded-lg border border-border bg-surface-elevated p-0.5">
              {(["week", "month"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold capitalize transition ${
                    view === v
                      ? "bg-primary text-primary-foreground shadow-soft"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {v === "week" ? "Semaine" : "Mois"}
                </button>
              ))}
            </div>
            {/* Nav */}
            <div className="flex rounded-lg border border-border bg-surface-elevated">
              <button
                onClick={() => navigate(-1)}
                className="grid h-10 w-10 place-items-center rounded-l-lg hover:bg-muted"
                aria-label="Précédent"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setCursor(new Date())}
                className="border-x border-border px-4 text-sm font-semibold"
              >
                Aujourd'hui
              </button>
              <button
                onClick={() => navigate(1)}
                className="grid h-10 w-10 place-items-center rounded-r-lg hover:bg-muted"
                aria-label="Suivant"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <button
              onClick={() => openCreate()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft transition hover:opacity-90"
            >
              <Plus className="h-4 w-4" /> Nouvel événement
            </button>
          </div>
        </header>

        {/* Main grid: calendar + sidebar */}
        <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
          <div className="space-y-6">
            {view === "week" ? (
              <WeekGrid
                days={weekDays}
                events={weekEvents}
                onSlotClick={(d, h) => openCreate(d, h)}
                onEventClick={openEdit}
              />
            ) : (
              <MonthGrid
                cursor={cursor}
                days={monthGrid}
                events={events}
                onDayClick={(d) => openCreate(d)}
                onEventClick={openEdit}
              />
            )}


            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card p-4 text-xs shadow-soft">
              <span className="font-semibold text-muted-foreground">Légende :</span>
              {(["Live", "Atelier", "Examen", "Personnel"] as EventType[]).map(
                (t) => (
                  <div key={t} className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${TYPE_DOT[t]}`} />
                    <span>{t}</span>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-base font-semibold">À venir</h2>
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
              </div>
              {upcomingFromNow.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Aucun événement planifié.
                </p>
              ) : (
                <ul className="space-y-3">
                  {upcomingFromNow.map((e) => {
                    const offsets = remindersByEvent[e.id] ?? [];
                    return (
                      <li
                        key={e.id}
                        className="group flex items-start gap-3 rounded-xl border border-transparent p-2 transition hover:border-border hover:bg-surface"
                      >
                        <div
                          className={`grid h-12 w-12 shrink-0 place-items-center rounded-lg border ${TYPE_TONE[e.type]}`}
                        >
                          <span className="text-[10px] font-bold uppercase">
                            {e.type.slice(0, 4)}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className="truncate text-sm font-semibold">{e.title}</p>
                            <div className="flex shrink-0 items-center gap-1 opacity-0 transition group-hover:opacity-100">
                              <button
                                type="button"
                                onClick={() => openEdit(e)}
                                aria-label="Modifier"
                                className="grid h-6 w-6 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                              >
                                <Pencil className="h-3 w-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`Supprimer « ${e.title} » ?`)) handleDelete(e.id);
                                }}
                                aria-label="Supprimer"
                                className="grid h-6 w-6 place-items-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                          <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {formatEventTime(e)}
                          </p>
                          <ReminderPicker
                            value={offsets}
                            onChange={(next) => {
                              if (next.length === 0) clearEventReminders(e.id);
                              else setEventReminders(e.id, e.title, e.start, next);
                            }}
                          />
                        </div>

                      </li>
                    );
                  })}

                </ul>
              )}
            </div>

            {/* Quick stats */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <h2 className="mb-4 font-display text-base font-semibold">
                Cette semaine
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <StatTile
                  label="Sessions"
                  value={weekEvents.length.toString()}
                />
                <StatTile label="Temps" value={`${h}h${m.toString().padStart(2, "0")}`} />
                <StatTile
                  label="Lives"
                  value={weekEvents.filter((e) => e.type === "Live").length.toString()}
                />
                <StatTile
                  label="Examens"
                  value={weekEvents.filter((e) => e.type === "Examen").length.toString()}
                />
              </div>
            </div>

            {/* Legacy upcoming pulled from mock */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <h2 className="mb-4 font-display text-base font-semibold">
                Recommandés
              </h2>
              <ul className="space-y-3">
                {upcomingSchedule.slice(0, 3).map((s) => (
                  <li key={s.id} className="flex items-start gap-3">
                    <span
                      className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg text-[10px] font-bold uppercase ${s.color}`}
                    >
                      {s.type.slice(0, 3)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{s.title}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {s.time}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>

      {modal.open && (
        <CreateEventModal
          initialDate={modal.editing?.start ?? modal.date ?? today}
          initialHour={modal.hour}
          editing={modal.editing}
          initialReminders={
            modal.editing ? (remindersByEvent[modal.editing.id] ?? []) : undefined
          }
          onClose={() => setModal({ open: false })}
          onCreate={handleCreate}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      )}

    </AppShell>
  );
}

// ---------- Week grid ----------

function WeekGrid({
  days,
  events,
  onSlotClick,
  onEventClick,
}: {
  days: Date[];
  events: AgendaEvent[];
  onSlotClick: (d: Date, hour: number) => void;
  onEventClick: (e: AgendaEvent) => void;
}) {

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
      <div className="grid grid-cols-[64px_repeat(7,minmax(0,1fr))] border-b border-border bg-surface text-xs">
        <div className="p-3" />
        {days.map((d) => {
          const isToday = sameDay(d, new Date());
          return (
            <div
              key={d.toISOString()}
              className="border-l border-border p-3 text-center"
            >
              <p
                className={`text-[10px] font-semibold uppercase tracking-wider ${
                  isToday ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {DAYS_LABEL[(d.getDay() + 6) % 7]}
              </p>
              <p
                className={`mt-0.5 text-base font-semibold ${
                  isToday ? "text-primary" : "text-foreground"
                }`}
              >
                {d.getDate()}
              </p>
            </div>
          );
        })}
      </div>
      <div className="max-h-[640px] overflow-y-auto">
        <div className="grid grid-cols-[64px_repeat(7,minmax(0,1fr))]">
          {HOURS.map((h) => (
            <div key={h} className="contents">
              <div className="border-t border-border p-2 text-right text-[10px] font-medium text-muted-foreground">
                {h.toString().padStart(2, "0")}:00
              </div>
              {days.map((d) => {
                const slotEvents = events.filter(
                  (e) => sameDay(e.start, d) && e.start.getHours() === h
                );
                return (
                  <div
                    key={d.toISOString() + h}
                    onClick={() => onSlotClick(d, h)}
                    className="group relative h-20 cursor-pointer border-l border-t border-border p-1 text-left transition hover:bg-primary/5"
                  >
                    {slotEvents.map((e) => (
                      <button
                        type="button"
                        key={e.id}
                        onClick={(ev) => {
                          ev.stopPropagation();
                          onEventClick(e);
                        }}
                        className={`mb-1 block w-full rounded-md border p-1.5 text-left text-[10px] shadow-sm transition hover:ring-2 hover:ring-primary/30 ${TYPE_TONE[e.type]}`}
                      >
                        <p className="text-[9px] font-bold uppercase tracking-wide opacity-80">
                          {e.type}
                        </p>
                        <p className="line-clamp-1 text-[11px] font-semibold text-foreground">
                          {e.title}
                        </p>
                        <p className="text-[9px] text-muted-foreground">
                          {formatTime(e.start)} · {e.duration}m
                        </p>
                      </button>
                    ))}
                    {slotEvents.length === 0 && (
                      <span className="invisible absolute right-1 top-1 inline-flex h-4 w-4 items-center justify-center rounded-md bg-primary text-primary-foreground group-hover:visible">
                        <Plus className="h-3 w-3" />
                      </span>
                    )}
                  </div>

                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------- Month grid ----------

function MonthGrid({
  cursor,
  days,
  events,
  onDayClick,
  onEventClick,
}: {
  cursor: Date;
  days: Date[];
  events: AgendaEvent[];
  onDayClick: (d: Date) => void;
  onEventClick: (e: AgendaEvent) => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
      <div className="grid grid-cols-7 border-b border-border bg-surface">
        {DAYS_LABEL.map((d) => (
          <div
            key={d}
            className="border-l border-border p-3 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground first:border-l-0"
          >
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((d, i) => {
          const inMonth = d.getMonth() === cursor.getMonth();
          const isToday = sameDay(d, new Date());
          const dayEvents = events.filter((e) => sameDay(e.start, d));
          return (
            <div
              key={i}
              onClick={() => onDayClick(d)}
              className={`group min-h-[110px] cursor-pointer border-l border-t border-border p-2 text-left transition hover:bg-primary/5 ${
                !inMonth ? "bg-surface/40" : ""
              }`}
            >
              <div className="mb-1 flex items-center justify-between">
                <span
                  className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                    isToday
                      ? "bg-primary text-primary-foreground"
                      : inMonth
                        ? "text-foreground"
                        : "text-muted-foreground/60"
                  }`}
                >
                  {d.getDate()}
                </span>
                <Plus className="h-3 w-3 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
              </div>
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map((e) => (
                  <button
                    type="button"
                    key={e.id}
                    onClick={(ev) => {
                      ev.stopPropagation();
                      onEventClick(e);
                    }}
                    className={`flex w-full items-center gap-1 truncate rounded px-1.5 py-0.5 text-left text-[10px] font-medium transition hover:ring-2 hover:ring-primary/30 ${TYPE_TONE[e.type]}`}
                  >
                    <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${TYPE_DOT[e.type]}`} />
                    <span className="truncate text-foreground">
                      {formatTime(e.start)} {e.title}
                    </span>
                  </button>
                ))}
                {dayEvents.length > 3 && (
                  <p className="text-[10px] font-semibold text-muted-foreground">
                    +{dayEvents.length - 3} autres
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


// ---------- Stat tile ----------

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-3">
      <p className="font-display text-xl font-semibold">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}

// ---------- Create modal ----------

function CreateEventModal({
  initialDate,
  initialHour,
  editing,
  initialReminders,
  onClose,
  onCreate,
  onUpdate,
  onDelete,
}: {
  initialDate: Date;
  initialHour?: number;
  editing?: AgendaEvent;
  initialReminders?: ReminderOffset[];
  onClose: () => void;
  onCreate: (e: AgendaEvent, reminders: ReminderOffset[]) => void;
  onUpdate: (e: AgendaEvent, reminders: ReminderOffset[]) => void;
  onDelete: (id: string) => void;
}) {
  const isEdit = !!editing;
  const [title, setTitle] = useState(editing?.title ?? "");
  const [type, setType] = useState<EventType>(editing?.type ?? "Live");
  const [date, setDate] = useState(toDateInput(editing?.start ?? initialDate));
  const [time, setTime] = useState(
    editing
      ? `${editing.start.getHours().toString().padStart(2, "0")}:${editing.start.getMinutes().toString().padStart(2, "0")}`
      : `${(initialHour ?? 9).toString().padStart(2, "0")}:00`,
  );
  const [duration, setDuration] = useState(editing?.duration ?? 60);
  const [teacher, setTeacher] = useState(editing?.teacher ?? "");
  const [location, setLocation] = useState(editing?.location ?? "");
  const [reminders, setReminders] = useState<ReminderOffset[]>(
    initialReminders ?? (isEdit ? [] : [15, 60]),
  );

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    const [hh, mm] = time.split(":").map(Number);
    const [y, m, d] = date.split("-").map(Number);
    const start = new Date(y, m - 1, d, hh, mm, 0, 0);
    const payload: AgendaEvent = {
      id: editing?.id ?? `u-${Date.now()}`,
      title: title.trim(),
      type,
      start,
      duration,
      teacher: teacher.trim() || undefined,
      location: location.trim() || undefined,
    };
    if (isEdit) onUpdate(payload, reminders);
    else onCreate(payload, reminders);
  }



  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-elegant"
      >
        <div className="flex items-center justify-between border-b border-border p-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">
              {isEdit ? "Édition" : "Création rapide"}
            </p>
            <h3 className="font-display text-lg font-semibold">
              {isEdit ? "Modifier l'événement" : "Nouvel événement"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-lg hover:bg-muted"
            aria-label="Fermer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>


        <div className="space-y-4 p-5">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">
              Titre
            </label>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ex. Live React Server Components"
              className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">
              Type
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(["Live", "Atelier", "Examen", "Personnel"] as EventType[]).map(
                (t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`rounded-lg border px-2 py-2 text-xs font-semibold transition ${
                      type === t
                        ? TYPE_TONE[t] + " ring-2 ring-primary/20"
                        : "border-border bg-surface text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t}
                  </button>
                )
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>
            <div className="col-span-1">
              <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                Heure
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>
            <div className="col-span-1">
              <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                Durée (min)
              </label>
              <input
                type="number"
                min={15}
                step={15}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                Intervenant
              </label>
              <div className="relative">
                <Users className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={teacher}
                  onChange={(e) => setTeacher(e.target.value)}
                  placeholder="Optionnel"
                  className="w-full rounded-lg border border-border bg-surface py-2.5 pl-9 pr-3 text-sm outline-none focus:border-primary"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                Lieu
              </label>
              <div className="relative">
                <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Salle, Zoom…"
                  className="w-full rounded-lg border border-border bg-surface py-2.5 pl-9 pr-3 text-sm outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <BellRing className="h-3.5 w-3.5" /> Rappels
            </label>
            <div className="flex flex-wrap gap-1.5">
              {REMINDER_PRESETS.map((p) => {
                const active = reminders.includes(p.value);
                return (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() =>
                      setReminders((prev) =>
                        active
                          ? prev.filter((v) => v !== p.value)
                          : [...prev, p.value],
                      )
                    }
                    className={`rounded-full border px-3 py-1 text-[11px] font-semibold transition ${
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-surface text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
            <p className="mt-1.5 text-[10px] text-muted-foreground">
              Vous recevrez une notification dans l'application avant l'événement.
            </p>
          </div>
        </div>


        <div className="flex items-center justify-between gap-3 border-t border-border bg-surface/40 p-5">
          {isEdit && editing ? (
            <button
              type="button"
              onClick={() => {
                if (confirm(`Supprimer « ${editing.title} » ?`)) onDelete(editing.id);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive transition hover:bg-destructive/20"
            >
              <Trash2 className="h-4 w-4" /> Supprimer
            </button>
          ) : (
            <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Video className="h-3.5 w-3.5" />
              Un lien de visio sera généré automatiquement.
            </p>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-semibold hover:bg-muted"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft hover:opacity-90"
            >
              {isEdit ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {isEdit ? "Enregistrer" : "Créer"}
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}

// ---------- formatters ----------

function formatTime(d: Date) {
  return `${d.getHours().toString().padStart(2, "0")}:${d
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
}

function formatEventTime(e: AgendaEvent) {
  const now = new Date();
  const d = e.start;
  const sameDayNow = sameDay(d, now);
  const tomorrow = addDays(now, 1);
  const isTomorrow = sameDay(d, tomorrow);
  const prefix = sameDayNow
    ? "Aujourd'hui"
    : isTomorrow
      ? "Demain"
      : `${DAYS_LABEL[(d.getDay() + 6) % 7]} ${d.getDate()} ${MONTHS_LABEL[d.getMonth()].slice(0, 3)}`;
  return `${prefix} · ${formatTime(d)} · ${e.duration}m`;
}

function toDateInput(d: Date) {
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d
    .getDate()
    .toString()
    .padStart(2, "0")}`;
}

// formatDayHeader kept for potential reuse
export { formatDayHeader };

// ---------- Reminder picker (sidebar inline) ----------

function ReminderPicker({
  value,
  onChange,
}: {
  value: ReminderOffset[];
  onChange: (next: ReminderOffset[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const label =
    value.length === 0
      ? "Aucun rappel"
      : value.length === 1
        ? REMINDER_PRESETS.find((p) => p.value === value[0])?.label ?? "Rappel"
        : `${value.length} rappels`;

  function toggle(v: ReminderOffset) {
    onChange(
      value.includes(v) ? value.filter((x) => x !== v) : [...value, v],
    );
  }

  return (
    <div className="relative mt-1">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-semibold transition ${
          value.length > 0
            ? "border-primary/40 bg-primary-soft text-primary"
            : "border-border bg-surface text-muted-foreground hover:text-foreground"
        }`}
      >
        <BellRing className="h-3 w-3" />
        {label}
      </button>
      {open && (
        <div className="absolute left-0 top-7 z-30 w-48 rounded-lg border border-border bg-card p-1.5 shadow-elegant">
          {REMINDER_PRESETS.map((p) => {
            const active = value.includes(p.value);
            return (
              <button
                key={p.value}
                type="button"
                onClick={() => toggle(p.value)}
                className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-xs transition ${
                  active
                    ? "bg-primary-soft text-primary"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                <span>{p.label}</span>
                {active && <span className="text-[10px]">✓</span>}
              </button>
            );
          })}
          {value.length > 0 && (
            <button
              type="button"
              onClick={() => {
                onChange([]);
                setOpen(false);
              }}
              className="mt-1 w-full rounded-md px-2 py-1 text-[10px] text-muted-foreground hover:text-destructive"
            >
              Désactiver tous les rappels
            </button>
          )}
        </div>
      )}
    </div>
  );
}
