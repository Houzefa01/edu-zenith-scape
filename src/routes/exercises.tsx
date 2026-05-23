import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { exercises, courses } from "@/lib/mock-data";
import { useExercises } from "@/lib/exercises-store";
import { CheckCircle2, Circle, Clock, PlayCircle, Trophy, Target, Flame, BookOpen } from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/exercises")({
  head: () => ({
    meta: [
      { title: "Ateliers d'exercices — Lumen" },
      { name: "description", content: "Mettez en pratique vos apprentissages avec les ateliers Lumen, feedback immédiat et progression personnalisée." },
      { property: "og:title", content: "Ateliers d'exercices — Lumen" },
      { property: "og:description", content: "Exercices et ateliers pratiques par cours." },
    ],
  }),
  component: ExercisesPage,
});

const tabs = ["Tous", "À faire", "En cours", "Terminé"] as const;

function ExercisesPage() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("Tous");
  const { decorate } = useExercises();

  const decorated = useMemo(() => exercises.map(decorate), [decorate]);

  const filtered = useMemo(
    () => decorated.filter((e) => tab === "Tous" || e.status === tab),
    [tab, decorated],
  );

  const grouped = useMemo(() => {
    const map = new Map<string, typeof decorated>();
    for (const e of filtered) {
      const list = map.get(e.courseId) ?? [];
      list.push(e);
      map.set(e.courseId, list);
    }
    return map;
  }, [filtered]);

  const stats = {
    completed: decorated.filter((e) => e.status === "Terminé").length,
    inProgress: decorated.filter((e) => e.status === "En cours").length,
    streak: 12,
  };

  return (
    <AppShell>
      <div className="space-y-8 p-4 md:p-8">
        <header>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Ateliers</p>
          <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
            Devoirs et exercices par cours
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Reprenez là où vous vous êtes arrêté, ou démarrez un nouvel atelier — corrigé pas à pas.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard icon={Trophy} tint="bg-success/10 text-success" label="Exercices terminés" value={String(stats.completed)} />
          <StatCard icon={Target} tint="bg-primary-soft text-primary" label="En cours" value={String(stats.inProgress)} />
          <StatCard icon={Flame} tint="bg-warning/15 text-warning-foreground" label="Série quotidienne" value={`${stats.streak} jours`} />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={[
                "rounded-full border px-4 py-1.5 text-xs font-semibold transition",
                t === tab
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-surface-elevated text-foreground/70 hover:text-foreground",
              ].join(" ")}
            >
              {t}
            </button>
          ))}
        </div>

        {grouped.size === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
            Aucun exercice dans cette catégorie.
          </div>
        ) : (
          <div className="space-y-6">
            {Array.from(grouped.entries()).map(([courseId, list]) => {
              const course = courses.find((c) => c.id === courseId);
              return (
                <section key={courseId} className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
                  <div className="flex items-center justify-between gap-3 border-b border-border p-5">
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary-soft text-primary">
                        <BookOpen className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          {course?.category ?? "Cours"}
                        </p>
                        <p className="font-display text-base font-semibold">{course?.title ?? list[0].course}</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-muted px-3 py-1 text-[11px] font-semibold text-foreground/70">
                      {list.length} devoir{list.length > 1 ? "s" : ""}
                    </span>
                  </div>
                  <ul className="divide-y divide-border">
                    {list.map((e) => {
                      const Icon = e.status === "Terminé" ? CheckCircle2 : Circle;
                      const iconTint =
                        e.status === "Terminé"
                          ? "text-success"
                          : e.status === "En cours"
                          ? "text-primary"
                          : "text-muted-foreground";
                      return (
                        <li key={e.id} className="flex flex-col gap-4 p-5 md:flex-row md:items-center">
                          <Icon className={`h-6 w-6 shrink-0 ${iconTint}`} />
                          <div className="flex-1">
                            <p className="font-display text-base font-semibold">{e.title}</p>
                            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                              <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {e.duration}</span>
                              <span className="rounded bg-muted px-2 py-0.5 font-medium text-foreground/80">{e.level}</span>
                              <span>{e.steps.length} étapes</span>
                            </div>
                          </div>
                          <div className="w-full md:w-48">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-muted-foreground">Progression</span>
                              <span className="font-semibold">{e.progress}%</span>
                            </div>
                            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                              <div className="h-full rounded-full bg-primary" style={{ width: `${e.progress}%` }} />
                            </div>
                          </div>
                          <Link
                            to="/exercises/$exerciseId"
                            params={{ exerciseId: e.id }}
                            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-soft hover:opacity-90"
                          >
                            <PlayCircle className="h-3.5 w-3.5" />
                            {e.status === "Terminé" ? "Revoir" : e.status === "En cours" ? "Reprendre" : "Commencer"}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}

function StatCard({
  icon: Icon,
  tint,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  tint: string;
  label: string;
  value: string;
}) {
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
