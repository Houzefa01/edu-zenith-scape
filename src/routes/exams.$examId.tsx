import { RequireAuth } from "@/components/require-auth";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { exams } from "@/lib/mock-data";
import { useExams, type ExamAttempt } from "@/lib/exams-store";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  PlayCircle,
  RotateCcw,
  Send,
  XCircle,
  Trophy,
} from "lucide-react";

export const Route = createFileRoute("/exams/$examId")({
  head: ({ params }) => {
    const exam = exams.find((e) => e.id === params.examId);
    return {
      meta: [
        { title: exam ? `${exam.title} — Lumen` : "Examen — Lumen" },
        {
          name: "description",
          content: exam?.description ?? "Démarrez votre examen et consultez vos résultats.",
        },
      ],
    };
  },
  component: () => (<RequireAuth><ExamDetailPage /></RequireAuth>),
  notFoundComponent: () => (
    <AppShell>
      <div className="px-6 py-16 text-center">
        <p className="text-sm font-semibold">Examen introuvable.</p>
        <Link to="/exams" className="mt-3 inline-block text-sm text-primary underline">
          Retour aux examens
        </Link>
      </div>
    </AppShell>
  ),
});

type Mode = "intro" | "taking" | "results";

function ExamDetailPage() {
  const { examId } = Route.useParams();
  const exam = exams.find((e) => e.id === examId);
  const { getAttempt, saveAttempt, resetAttempt } = useExams();
  const existing = exam ? getAttempt(exam.id) : undefined;
  const navigate = useNavigate();

  const [mode, setMode] = useState<Mode>(existing ? "results" : "intro");
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [secondsLeft, setSecondsLeft] = useState(0);
  const startRef = useRef<number>(0);

  useEffect(() => {
    if (mode !== "taking" || !exam) return;
    const interval = setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [mode, exam]);

  useEffect(() => {
    if (mode === "taking" && secondsLeft === 0 && exam) {
      submit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft]);

  if (!exam) {
    return (
      <AppShell>
        <div className="px-6 py-16 text-center">
          <p className="text-sm font-semibold">Examen introuvable.</p>
          <Link to="/exams" className="mt-3 inline-block text-sm text-primary underline">
            Retour aux examens
          </Link>
        </div>
      </AppShell>
    );
  }

  function start() {
    setAnswers({});
    setCurrent(0);
    setSecondsLeft(exam!.durationMinutes * 60);
    startRef.current = Date.now();
    setMode("taking");
  }

  function submit() {
    const total = exam!.questions.length;
    const correctCount = exam!.questions.reduce(
      (n, q) => (answers[q.id] === q.correctId ? n + 1 : n),
      0,
    );
    const attempt: ExamAttempt = {
      examId: exam!.id,
      answers,
      total,
      correctCount,
      score: Math.round((correctCount / total) * 100),
      submittedAt: new Date().toISOString(),
      durationSeconds: Math.max(1, Math.round((Date.now() - startRef.current) / 1000)),
    };
    saveAttempt(attempt);
    setMode("results");
  }

  function retry() {
    resetAttempt(exam!.id);
    start();
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-4 py-6 md:px-8 md:py-8">
        <button
          onClick={() => navigate({ to: "/exams" })}
          className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Tous les examens
        </button>

        {mode === "intro" && <IntroView exam={exam} onStart={start} />}
        {mode === "taking" && (
          <TakingView
            exam={exam}
            current={current}
            setCurrent={setCurrent}
            answers={answers}
            setAnswers={setAnswers}
            secondsLeft={secondsLeft}
            onSubmit={submit}
          />
        )}
        {mode === "results" && existing && (
          <ResultsView exam={exam} attempt={existing} onRetry={retry} />
        )}
        {mode === "results" && !existing && (
          <ResultsView
            exam={exam}
            attempt={{
              examId: exam.id,
              answers,
              total: exam.questions.length,
              correctCount: exam.questions.reduce(
                (n, q) => (answers[q.id] === q.correctId ? n + 1 : n),
                0,
              ),
              score: Math.round(
                (exam.questions.reduce(
                  (n, q) => (answers[q.id] === q.correctId ? n + 1 : n),
                  0,
                ) /
                  exam.questions.length) *
                  100,
              ),
              submittedAt: new Date().toISOString(),
              durationSeconds: 0,
            }}
            onRetry={retry}
          />
        )}
      </div>
    </AppShell>
  );
}

function IntroView({ exam, onStart }: { exam: (typeof exams)[number]; onStart: () => void }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-soft md:p-8">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">{exam.course}</p>
      <h1 className="mt-1 font-display text-2xl font-semibold md:text-3xl">{exam.title}</h1>
      <p className="mt-3 text-sm text-muted-foreground">{exam.description}</p>

      <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Info label="Durée" value={exam.duration} />
        <Info label="Questions" value={`${exam.questions.length}`} />
        <Info label="Enseignant" value={exam.teacher} />
      </dl>

      <div className="mt-6 rounded-xl border border-border bg-surface p-4 text-xs text-muted-foreground">
        <p className="font-semibold text-foreground">Avant de commencer</p>
        <ul className="mt-2 list-disc space-y-1 pl-4">
          <li>Une fois lancé, le chronomètre démarre immédiatement.</li>
          <li>Vous pouvez naviguer entre les questions avant de soumettre.</li>
          <li>Vos résultats et la correction seront disponibles à la fin.</li>
        </ul>
      </div>

      <button
        onClick={onStart}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition hover:opacity-90 sm:w-auto"
      >
        <PlayCircle className="h-4 w-4" /> Démarrer l'examen
      </button>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface-elevated px-3 py-2">
      <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-semibold">{value}</dd>
    </div>
  );
}

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
}

function TakingView({
  exam,
  current,
  setCurrent,
  answers,
  setAnswers,
  secondsLeft,
  onSubmit,
}: {
  exam: (typeof exams)[number];
  current: number;
  setCurrent: (n: number) => void;
  answers: Record<string, string>;
  setAnswers: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  secondsLeft: number;
  onSubmit: () => void;
}) {
  const q = exam.questions[current];
  const isLast = current === exam.questions.length - 1;
  const answeredCount = Object.keys(answers).length;
  const progress = Math.round(((current + 1) / exam.questions.length) * 100);
  const lowTime = secondsLeft <= 60;

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">
              Question {current + 1} / {exam.questions.length}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">{exam.title}</p>
          </div>
          <span
            className={[
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
              lowTime
                ? "bg-destructive/10 text-destructive"
                : "bg-surface-elevated text-foreground/70",
            ].join(" ")}
            aria-live="polite"
          >
            <Clock className="h-3.5 w-3.5" /> {formatTime(secondsLeft)}
          </span>
        </div>
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
        <h2 className="font-display text-lg font-semibold leading-snug">{q.prompt}</h2>
        <ul className="mt-5 space-y-2">
          {q.choices.map((c) => {
            const selected = answers[q.id] === c.id;
            return (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() =>
                    setAnswers((prev) => ({ ...prev, [q.id]: c.id }))
                  }
                  className={[
                    "flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition",
                    selected
                      ? "border-primary bg-primary-soft text-foreground"
                      : "border-border bg-surface-elevated hover:border-primary/40",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "grid h-5 w-5 shrink-0 place-items-center rounded-full border",
                      selected ? "border-primary bg-primary text-primary-foreground" : "border-border",
                    ].join(" ")}
                  >
                    {selected && <span className="h-2 w-2 rounded-full bg-primary-foreground" />}
                  </span>
                  <span className="flex-1">{c.label}</span>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => setCurrent(Math.max(0, current - 1))}
            disabled={current === 0}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-surface-elevated px-4 py-2 text-sm font-semibold disabled:opacity-50"
          >
            <ArrowLeft className="h-4 w-4" /> Précédent
          </button>

          <p className="text-center text-xs text-muted-foreground">
            {answeredCount} / {exam.questions.length} répondu{answeredCount > 1 ? "es" : ""}
          </p>

          {isLast ? (
            <button
              type="button"
              onClick={onSubmit}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft hover:opacity-90"
            >
              <Send className="h-4 w-4" /> Soumettre
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setCurrent(Math.min(exam.questions.length - 1, current + 1))}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft hover:opacity-90"
            >
              Suivant <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <nav className="flex flex-wrap gap-2" aria-label="Navigation entre questions">
        {exam.questions.map((qq, idx) => {
          const active = idx === current;
          const answered = !!answers[qq.id];
          return (
            <button
              key={qq.id}
              onClick={() => setCurrent(idx)}
              className={[
                "h-9 w-9 rounded-lg border text-xs font-semibold transition",
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : answered
                    ? "border-primary/40 bg-primary-soft text-primary"
                    : "border-border bg-surface-elevated text-muted-foreground hover:text-foreground",
              ].join(" ")}
              aria-label={`Aller à la question ${idx + 1}`}
            >
              {idx + 1}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

function ResultsView({
  exam,
  attempt,
  onRetry,
}: {
  exam: (typeof exams)[number];
  attempt: ExamAttempt;
  onRetry: () => void;
}) {
  const passed = attempt.score >= 60;
  const submittedAt = useMemo(
    () =>
      new Date(attempt.submittedAt).toLocaleString("fr-FR", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }),
    [attempt.submittedAt],
  );

  return (
    <div className="space-y-5">
      <div
        className={[
          "rounded-2xl border p-6 shadow-soft",
          passed ? "border-success/40 bg-success/5" : "border-warning/40 bg-warning/5",
        ].join(" ")}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={[
                "grid h-12 w-12 place-items-center rounded-xl",
                passed ? "bg-success text-success-foreground" : "bg-warning text-warning-foreground",
              ].join(" ")}
            >
              <Trophy className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {passed ? "Examen réussi" : "Examen à retravailler"}
              </p>
              <h1 className="font-display text-2xl font-semibold">{exam.title}</h1>
              <p className="mt-0.5 text-xs text-muted-foreground">Soumis le {submittedAt}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-display text-4xl font-semibold">{attempt.score}%</p>
            <p className="text-xs text-muted-foreground">
              {attempt.correctCount} / {attempt.total} bonnes réponses
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft hover:opacity-90"
          >
            <RotateCcw className="h-4 w-4" /> Repasser l'examen
          </button>
          <Link
            to="/exams"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-elevated px-4 py-2 text-sm font-semibold"
          >
            Retour aux examens
          </Link>
        </div>
      </div>

      <section aria-label="Correction détaillée" className="space-y-3">
        <h2 className="font-display text-lg font-semibold">Correction détaillée</h2>
        {exam.questions.map((q, idx) => {
          const userId = attempt.answers[q.id];
          const correct = userId === q.correctId;
          return (
            <article
              key={q.id}
              className="rounded-2xl border border-border bg-card p-5 shadow-soft"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Question {idx + 1}
                  </p>
                  <h3 className="mt-0.5 font-semibold">{q.prompt}</h3>
                </div>
                <span
                  className={[
                    "inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold",
                    correct
                      ? "bg-success/10 text-success"
                      : "bg-destructive/10 text-destructive",
                  ].join(" ")}
                >
                  {correct ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5" /> Correct
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3.5 w-3.5" /> Faux
                    </>
                  )}
                </span>
              </div>

              <ul className="space-y-2">
                {q.choices.map((c) => {
                  const isUser = c.id === userId;
                  const isCorrect = c.id === q.correctId;
                  const tone = isCorrect
                    ? "border-success/50 bg-success/5"
                    : isUser
                      ? "border-destructive/50 bg-destructive/5"
                      : "border-border bg-surface-elevated";
                  return (
                    <li
                      key={c.id}
                      className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm ${tone}`}
                    >
                      <span>{c.label}</span>
                      <span className="flex items-center gap-2 text-[11px] font-semibold text-muted-foreground">
                        {isUser && <span>Votre réponse</span>}
                        {isCorrect && (
                          <span className="text-success">Bonne réponse</span>
                        )}
                      </span>
                    </li>
                  );
                })}
                {!userId && (
                  <li className="text-xs text-muted-foreground italic">
                    Aucune réponse sélectionnée pour cette question.
                  </li>
                )}
              </ul>

              {q.explanation && (
                <p className="mt-3 rounded-lg bg-surface px-3 py-2 text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">Explication. </span>
                  {q.explanation}
                </p>
              )}
            </article>
          );
        })}
      </section>
    </div>
  );
}
