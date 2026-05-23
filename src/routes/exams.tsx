import { RequireAuth } from "@/components/require-auth";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { exams } from "@/lib/mock-data";
import { useExams } from "@/lib/exams-store";
import { CalendarClock, Clock, FileText, GraduationCap, PlayCircle, RotateCcw, Trophy, CheckCircle2 } from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/exams")({
  head: () => ({
    meta: [
      { title: "Examens — Lumen" },
      { name: "description", content: "Consultez vos examens à venir, démarrez une session et révisez vos résultats détaillés." },
      { property: "og:title", content: "Examens — Lumen" },
      { property: "og:description", content: "Vos examens, résultats et corrections au même endroit." },
    ],
  }),
  component: () => (<RequireAuth><ExamsPage /></RequireAuth>),
});

const tabs = ["À venir", "Terminés", "Tous"] as const;

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("fr-FR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ExamsPage() {
  const { attempts } = useExams();
  const [tab, setTab] = useState<(typeof tabs)[number]>("À venir");

  const filtered = useMemo(() => {
    return exams.filter((e) => {
      const done = !!attempts[e.id];
      if (tab === "Tous") return true;
      if (tab === "Terminés") return done;
      return !done;
    });
  }, [tab, attempts]);

  const completed = Object.values(attempts);
  const avgScore = completed.length
    ? Math.round(completed.reduce((s, a) => s + a.score, 0) / completed.length)
    : 0;

  return (
    <AppShell>
      <div className="px-4 py-6 md:px-8 md:py-8">
        <header className="mb-6 flex flex-col gap-4 md:mb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Évaluations
            </p>
            <h1 className="mt-1 font-display text-2xl font-semibold md:text-3xl">Examens</h1>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              Préparez vos examens, démarrez une session chronométrée et consultez vos corrections.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Stat icon={<FileText className="h-4 w-4" />} label="Programmés" value={exams.length} />
            <Stat icon={<CheckCircle2 className="h-4 w-4" />} label="Terminés" value={completed.length} />
            <Stat icon={<Trophy className="h-4 w-4" />} label="Moyenne" value={`${avgScore}%`} />
          </div>
        </header>

        <div className="mb-6 flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={[
                "rounded-full px-4 py-1.5 text-xs font-semibold transition",
                tab === t
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : "border border-border bg-surface-elevated text-foreground/70 hover:text-foreground",
              ].join(" ")}
            >
              {t}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-surface-elevated px-6 py-16 text-center">
            <GraduationCap className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-semibold">Aucun examen dans cette catégorie</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Changez d'onglet pour voir vos autres examens.
            </p>
          </div>
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">
            {filtered.map((exam) => {
              const attempt = attempts[exam.id];
              return (
                <li
                  key={exam.id}
                  className="group flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft transition hover:border-primary/40"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                        {exam.course}
                      </p>
                      <h2 className="mt-1 font-display text-lg font-semibold leading-tight">
                        {exam.title}
                      </h2>
                      <p className="mt-1 text-xs text-muted-foreground">avec {exam.teacher}</p>
                    </div>
                    {attempt ? (
                      <span className="shrink-0 rounded-full bg-success/10 px-2.5 py-1 text-[11px] font-semibold text-success">
                        {attempt.score}%
                      </span>
                    ) : (
                      <span className="shrink-0 rounded-full bg-warning/15 px-2.5 py-1 text-[11px] font-semibold text-warning-foreground">
                        À passer
                      </span>
                    )}
                  </div>

                  <p className="line-clamp-2 text-sm text-muted-foreground">{exam.description}</p>

                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <CalendarClock className="h-3.5 w-3.5" />
                      {formatDate(exam.date)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {exam.duration}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <FileText className="h-3.5 w-3.5" />
                      {exam.questionsCount} questions
                    </span>
                  </div>

                  <div className="mt-auto flex items-center gap-2">
                    <Link
                      to="/exams/$examId"
                      params={{ examId: exam.id }}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft transition hover:opacity-90"
                    >
                      {attempt ? (
                        <>
                          <RotateCcw className="h-4 w-4" /> Voir mes résultats
                        </>
                      ) : (
                        <>
                          <PlayCircle className="h-4 w-4" /> Démarrer l'examen
                        </>
                      )}
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </AppShell>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-surface-elevated px-3 py-2">
      <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className="mt-1 font-display text-lg font-semibold">{value}</p>
    </div>
  );
}
