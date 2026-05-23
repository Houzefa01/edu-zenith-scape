import { RequireAuth } from "@/components/require-auth";
import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { exercises, courses } from "@/lib/mock-data";
import { useExercises } from "@/lib/exercises-store";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Lightbulb,
  Pencil,
  PlayCircle,
  RotateCcw,
  Send,
  Target,
  Trophy,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/exercises/$exerciseId")({
  head: ({ params }) => {
    const exo = exercises.find((e) => e.id === params.exerciseId);
    const title = exo ? `${exo.title} — Lumen` : "Exercice — Lumen";
    return {
      meta: [
        { title },
        { name: "description", content: exo?.objective ?? "Démarrez un exercice Lumen." },
        { property: "og:title", content: title },
        { property: "og:description", content: exo?.objective ?? "Exercice pratique." },
      ],
    };
  },
  loader: ({ params }) => {
    const exo = exercises.find((e) => e.id === params.exerciseId);
    if (!exo) throw notFound();
    return { exo };
  },
  errorComponent: ({ reset }) => {
    const router = useRouter();
    return (
      <AppShell>
        <div className="p-8 text-center">
          <p className="text-sm text-muted-foreground">Impossible de charger cet exercice.</p>
          <button
            className="mt-4 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
            onClick={() => { reset(); router.invalidate(); }}
          >
            Réessayer
          </button>
        </div>
      </AppShell>
    );
  },
  notFoundComponent: () => {
    const { exerciseId } = Route.useParams();
    return (
      <AppShell>
        <div className="p-8 text-center">
          <p className="text-sm text-muted-foreground">Exercice « {exerciseId} » introuvable.</p>
          <Link to="/exercises" className="mt-4 inline-block text-xs font-semibold text-primary">Retour aux ateliers</Link>
        </div>
      </AppShell>
    );
  },
  component: () => (<RequireAuth><ExerciseDetail /></RequireAuth>),
});

function ExerciseDetail() {
  const { exo } = Route.useLoaderData();
  const course = useMemo(() => courses.find((c) => c.id === exo.courseId), [exo.courseId]);
  const {
    getProgress,
    saveAnswer,
    submitAnswer,
    editAnswer,
    setStepIndex,
    markCompleted,
    resetProgress,
  } = useExercises();
  const progress = getProgress(exo.id);

  const [started, setStarted] = useState(progress.status !== "À faire");
  const [showHint, setShowHint] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const total = exo.steps.length;
  const stepIndex = Math.min(progress.stepIndex, total - 1);
  const current = exo.steps[stepIndex];
  const isSubmitted = !!progress.submitted[stepIndex];
  const finished = progress.status === "Terminé";

  function handleSubmit() {
    const value = progress.answers[stepIndex]?.trim();
    if (!value) {
      toast.error("Saisissez une réponse avant de soumettre.");
      return;
    }
    submitAnswer(exo.id, stepIndex);
    toast.success("Réponse enregistrée");
  }

  function handleNext() {
    setShowHint(false);
    setRevealed(false);
    if (stepIndex + 1 < total) setStepIndex(exo.id, stepIndex + 1);
  }

  function handlePrev() {
    setShowHint(false);
    setRevealed(false);
    if (stepIndex > 0) setStepIndex(exo.id, stepIndex - 1);
  }

  function handleEdit() {
    editAnswer(exo.id, stepIndex);
  }

  function handleFinish() {
    markCompleted(exo.id);
    toast.success("Exercice marqué comme terminé");
  }

  function handleRestart() {
    resetProgress(exo.id);
    setStarted(false);
    setShowHint(false);
    setRevealed(false);
  }

  const statusTint =
    progress.status === "Terminé"
      ? "bg-success/10 text-success"
      : progress.status === "En cours"
        ? "bg-primary-soft text-primary"
        : "bg-muted text-foreground/70";

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl space-y-6 p-4 md:p-8">
        <Link to="/exercises" className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Tous les ateliers
        </Link>

        <header className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                {course?.title ?? exo.course}
              </p>
              <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight md:text-3xl">
                {exo.title}
              </h1>
            </div>
            <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${statusTint}`}>
              {progress.status}
            </span>
          </div>

          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">{exo.objective}</p>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {exo.duration}</span>
            <span className="rounded bg-muted px-2 py-0.5 font-medium text-foreground/80">{exo.level}</span>
            <span className="inline-flex items-center gap-1"><Target className="h-3.5 w-3.5" /> {total} étapes</span>
          </div>

          <div className="mt-5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground">Progression</span>
              <span className="font-semibold">{progress.progress}%</span>
            </div>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress.progress}%` }} />
            </div>
          </div>
        </header>

        {!started && progress.status === "À faire" ? (
          <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-soft">
            <PlayCircle className="mx-auto h-10 w-10 text-primary" />
            <h2 className="mt-3 font-display text-xl font-semibold">Prêt à démarrer ?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {total} étapes guidées. Vos réponses sont enregistrées automatiquement.
            </p>
            <button
              onClick={() => setStarted(true)}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft hover:opacity-90"
            >
              <PlayCircle className="h-4 w-4" />
              Démarrer l'exercice
            </button>
          </div>
        ) : finished ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-success/40 bg-success/5 p-8 text-center shadow-soft">
              <Trophy className="mx-auto h-10 w-10 text-success" />
              <h2 className="mt-3 font-display text-xl font-semibold">Bravo, exercice terminé !</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Vous avez soumis les {total} étapes. Vous pouvez relire et modifier chaque réponse.
              </p>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={handleRestart}
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface-elevated px-4 py-2 text-xs font-semibold hover:bg-muted"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Tout réinitialiser
                </button>
                <Link
                  to="/exercises"
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-soft hover:opacity-90"
                >
                  Voir d'autres ateliers
                </Link>
              </div>
            </div>

            <section className="rounded-2xl border border-border bg-card p-6 shadow-soft">
              <h3 className="font-display text-base font-semibold">Vos réponses</h3>
              <ul className="mt-4 space-y-3">
                {exo.steps.map((s: typeof exo.steps[number], i: number) => (
                  <li key={i} className="rounded-xl border border-border bg-surface-elevated p-4">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-semibold">Étape {i + 1} · {s.prompt}</p>
                      <button
                        onClick={() => {
                          setStepIndex(exo.id, i);
                          editAnswer(exo.id, i);
                          setStarted(true);
                        }}
                        className="inline-flex items-center gap-1 rounded-md border border-border bg-surface px-2 py-1 text-[11px] font-semibold hover:bg-muted"
                      >
                        <Pencil className="h-3 w-3" /> Modifier
                      </button>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-foreground/80">
                      {progress.answers[i] || <span className="italic text-muted-foreground">Aucune réponse</span>}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Étape {stepIndex + 1} / {total}
              </p>
              <nav className="flex gap-1.5" aria-label="Étapes">
                {exo.steps.map((_s: typeof exo.steps[number], i: number) => {
                  const done = !!progress.submitted[i];
                  const active = i === stepIndex;
                  return (
                    <button
                      key={i}
                      onClick={() => setStepIndex(exo.id, i)}
                      aria-label={`Aller à l'étape ${i + 1}`}
                      className={[
                        "h-2 w-7 rounded-full transition",
                        active
                          ? "bg-primary"
                          : done
                            ? "bg-success/70"
                            : "bg-muted hover:bg-muted-foreground/30",
                      ].join(" ")}
                    />
                  );
                })}
              </nav>
            </div>

            <h2 className="mt-4 font-display text-lg font-semibold">{current.prompt}</h2>

            <textarea
              value={progress.answers[stepIndex] ?? ""}
              onChange={(e) => saveAnswer(exo.id, stepIndex, e.target.value)}
              readOnly={isSubmitted}
              placeholder="Tapez votre réponse…"
              className={[
                "mt-4 min-h-28 w-full resize-y rounded-lg border p-3 text-sm outline-none transition",
                isSubmitted
                  ? "border-success/40 bg-success/5 text-foreground/80"
                  : "border-border bg-surface-elevated focus:border-primary",
              ].join(" ")}
            />

            {isSubmitted && (
              <div className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-xs">
                <span className="inline-flex items-center gap-1.5 font-semibold text-success">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Réponse soumise
                </span>
                <button
                  onClick={handleEdit}
                  className="inline-flex items-center gap-1 rounded-md border border-border bg-surface px-2 py-1 font-semibold hover:bg-muted"
                >
                  <Pencil className="h-3 w-3" /> Modifier
                </button>
              </div>
            )}

            {current.hint && showHint && (
              <div className="mt-3 flex gap-2 rounded-lg border border-border bg-primary-soft p-3 text-xs text-foreground/80">
                <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                <span>{current.hint}</span>
              </div>
            )}

            {revealed && (
              <div className="mt-3 rounded-lg border border-success/30 bg-success/10 p-3 text-xs text-foreground">
                <p className="font-semibold text-success">Solution suggérée</p>
                <p className="mt-1">{current.solution}</p>
              </div>
            )}

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                {current.hint && (
                  <button
                    onClick={() => setShowHint((s) => !s)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-elevated px-3 py-1.5 text-xs font-semibold hover:bg-muted"
                  >
                    <Lightbulb className="h-3.5 w-3.5" /> {showHint ? "Masquer l'indice" : "Voir un indice"}
                  </button>
                )}
                <button
                  onClick={() => setRevealed((r) => !r)}
                  className="rounded-lg border border-border bg-surface-elevated px-3 py-1.5 text-xs font-semibold hover:bg-muted"
                >
                  {revealed ? "Masquer la solution" : "Afficher la solution"}
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handlePrev}
                  disabled={stepIndex === 0}
                  className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface-elevated px-3 py-1.5 text-xs font-semibold disabled:opacity-50"
                >
                  <ChevronLeft className="h-3.5 w-3.5" /> Précédent
                </button>
                {isSubmitted ? (
                  stepIndex + 1 === total ? (
                    <button
                      onClick={handleFinish}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-success px-4 py-2 text-xs font-semibold text-success-foreground shadow-soft hover:opacity-90"
                    >
                      <Trophy className="h-3.5 w-3.5" /> Terminer
                    </button>
                  ) : (
                    <button
                      onClick={handleNext}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-soft hover:opacity-90"
                    >
                      Étape suivante <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  )
                ) : (
                  <button
                    onClick={handleSubmit}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-soft hover:opacity-90"
                  >
                    <Send className="h-3.5 w-3.5" /> Soumettre la réponse
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
