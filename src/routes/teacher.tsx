import { RequireAuth } from "@/components/require-auth";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { useTeacherStore, type TeacherCourse } from "@/lib/teacher-store";
import { useSession } from "@/lib/session";
import { useState } from "react";
import { BookOpen, ClipboardList, Eye, EyeOff, Plus, Trash2, Users } from "lucide-react";

export const Route = createFileRoute("/teacher")({
  head: () => ({
    meta: [
      { title: "Espace enseignant — Lumen" },
      { name: "description", content: "Gérez vos cours, examens et étudiants depuis votre tableau de bord enseignant." },
    ],
  }),
  component: () => (<RequireAuth><TeacherPage /></RequireAuth>),
});

function TeacherPage() {
  const { user, switchRole } = useSession();
  const store = useTeacherStore();
  const [tab, setTab] = useState<"courses" | "exams">("courses");

  const totalStudents = store.courses.reduce((acc, c) => acc + c.students, 0);
  const published = store.courses.filter((c) => c.published).length;

  if (user.role !== "teacher") {
    return (
      <AppShell>
        <div className="grid place-items-center p-10">
          <div className="max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-soft">
            <p className="font-display text-xl font-semibold">Espace réservé aux enseignants</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Passez en rôle « Enseignant » pour accéder à la gestion de cours et d'examens.
            </p>
            <button
              onClick={() => switchRole("teacher")}
              className="mt-5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              Activer le mode enseignant
            </button>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-8 p-4 md:p-8">
        <header>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Espace enseignant</p>
          <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
            Bienvenue, {user.name.split(" ")[0]} 👋
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Gérez vos contenus, suivez vos étudiants et publiez vos examens.
          </p>
        </header>

        <div className="grid gap-4 sm:grid-cols-3">
          <Kpi icon={BookOpen} label="Cours" value={String(store.courses.length)} tint="bg-primary-soft text-primary" />
          <Kpi icon={Eye} label="Publiés" value={String(published)} tint="bg-success/10 text-success" />
          <Kpi icon={Users} label="Étudiants" value={String(totalStudents)} tint="bg-warning/15 text-warning-foreground" />
        </div>

        <div className="flex gap-2">
          {([
            ["courses", "Mes cours"],
            ["exams", "Examens"],
          ] as const).map(([k, label]) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={[
                "rounded-full border px-4 py-1.5 text-xs font-semibold transition",
                tab === k
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-surface-elevated text-foreground/70 hover:text-foreground",
              ].join(" ")}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "courses" ? <CoursesPanel store={store} /> : <ExamsPanel store={store} />}
      </div>
    </AppShell>
  );
}

function Kpi({ icon: Icon, label, value, tint }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; tint: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <div className={`mb-3 inline-grid h-10 w-10 place-items-center rounded-lg ${tint}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="font-display text-2xl font-semibold">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function CoursesPanel({ store }: { store: ReturnType<typeof useTeacherStore> }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Design");
  const [level, setLevel] = useState<TeacherCourse["level"]>("Intermédiaire");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    store.addCourse({ title: title.trim(), category, level });
    setTitle("");
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
        <ul className="divide-y divide-border">
          {store.courses.length === 0 && (
            <li className="px-5 py-10 text-center text-sm text-muted-foreground">
              Aucun cours. Créez-en un à droite.
            </li>
          )}
          {store.courses.map((c) => (
            <li key={c.id} className="flex flex-wrap items-center gap-4 p-4">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-display text-base font-semibold">{c.title}</p>
                  <span className={[
                    "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                    c.published ? "bg-success/15 text-success" : "bg-muted text-foreground/60",
                  ].join(" ")}>
                    {c.published ? "Publié" : "Brouillon"}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {c.category} · {c.level} · {c.students} étudiants
                </p>
              </div>
              <button
                onClick={() => store.toggleCoursePublish(c.id)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-elevated px-3 py-1.5 text-xs font-semibold hover:bg-muted"
              >
                {c.published ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                {c.published ? "Dépublier" : "Publier"}
              </button>
              <button
                onClick={() => {
                  if (confirm(`Supprimer « ${c.title} » ?`)) store.removeCourse(c.id);
                }}
                aria-label="Supprimer"
                className="grid h-9 w-9 place-items-center rounded-lg border border-border text-muted-foreground hover:border-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      </div>

      <form onSubmit={submit} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <h3 className="mb-3 font-display text-base font-semibold">Nouveau cours</h3>
        <div className="space-y-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titre du cours"
            className="h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:border-primary"
          />
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Catégorie"
            className="h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:border-primary"
          />
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value as TeacherCourse["level"])}
            className="h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:border-primary"
          >
            <option>Débutant</option>
            <option>Intermédiaire</option>
            <option>Avancé</option>
          </select>
          <button
            type="submit"
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> Créer le cours
          </button>
        </div>
      </form>
    </div>
  );
}

function ExamsPanel({ store }: { store: ReturnType<typeof useTeacherStore> }) {
  const [title, setTitle] = useState("");
  const [course, setCourse] = useState(store.courses[0]?.title ?? "");
  const [date, setDate] = useState(() => new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString().slice(0, 16));
  const [duration, setDuration] = useState(45);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !course) return;
    store.addExam({
      title: title.trim(),
      course,
      date: new Date(date).toISOString(),
      durationMin: duration,
    });
    setTitle("");
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
        <ul className="divide-y divide-border">
          {store.exams.length === 0 && (
            <li className="px-5 py-10 text-center text-sm text-muted-foreground">
              Aucun examen planifié.
            </li>
          )}
          {store.exams.map((e) => (
            <li key={e.id} className="flex flex-wrap items-center gap-4 p-4">
              <ClipboardList className="h-5 w-5 text-primary" />
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-display text-base font-semibold">{e.title}</p>
                  <span className={[
                    "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                    e.published ? "bg-success/15 text-success" : "bg-muted text-foreground/60",
                  ].join(" ")}>
                    {e.published ? "Publié" : "Brouillon"}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {e.course} ·{" "}
                  {new Date(e.date).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })}{" "}
                  · {e.durationMin} min
                </p>
              </div>
              <button
                onClick={() => store.toggleExamPublish(e.id)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-elevated px-3 py-1.5 text-xs font-semibold hover:bg-muted"
              >
                {e.published ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                {e.published ? "Dépublier" : "Publier"}
              </button>
              <button
                onClick={() => {
                  if (confirm(`Supprimer « ${e.title} » ?`)) store.removeExam(e.id);
                }}
                aria-label="Supprimer"
                className="grid h-9 w-9 place-items-center rounded-lg border border-border text-muted-foreground hover:border-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      </div>

      <form onSubmit={submit} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <h3 className="mb-3 font-display text-base font-semibold">Nouvel examen</h3>
        <div className="space-y-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titre de l'examen"
            className="h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:border-primary"
          />
          <select
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            className="h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:border-primary"
          >
            {store.courses.length === 0 && <option value="">— Créez d'abord un cours —</option>}
            {store.courses.map((c) => (
              <option key={c.id} value={c.title}>{c.title}</option>
            ))}
          </select>
          <input
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:border-primary"
          />
          <label className="block">
            <span className="mb-1 block text-xs text-muted-foreground">Durée (min)</span>
            <input
              type="number"
              min={5}
              max={240}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:border-primary"
            />
          </label>
          <button
            type="submit"
            disabled={!store.courses.length}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" /> Planifier
          </button>
        </div>
      </form>
    </div>
  );
}
