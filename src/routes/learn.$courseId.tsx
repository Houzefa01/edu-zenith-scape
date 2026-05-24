import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { RequireAuth } from "@/components/require-auth";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/session";
import {
  CheckCircle2,
  ChevronLeft,
  Circle,
  Loader2,
  PlayCircle,
  Send,
  Sparkles,
  Trophy,
} from "lucide-react";

export const Route = createFileRoute("/learn/$courseId")({
  head: () => ({
    meta: [
      { title: "Mon cours — Lumen" },
      { name: "description", content: "Apprenez, pratiquez et suivez votre progression sur Lumen." },
    ],
  }),
  component: () => (
    <RequireAuth>
      <LearnPage />
    </RequireAuth>
  ),
});

type CourseMeta = {
  id: string;
  title: string;
  category: string;
  level: string;
  students: number;
  teacher_id: string;
};

const LESSONS = [
  {
    key: "lesson:1",
    title: "Introduction et objectifs",
    duration: "08 min",
    video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  },
  {
    key: "lesson:2",
    title: "Fondamentaux essentiels",
    duration: "14 min",
    video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
  },
  {
    key: "lesson:3",
    title: "Mise en pratique guidée",
    duration: "18 min",
    video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  },
  {
    key: "lesson:4",
    title: "Cas avancés et bonnes pratiques",
    duration: "22 min",
    video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  },
  {
    key: "lesson:5",
    title: "Synthèse et prochaines étapes",
    duration: "11 min",
    video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
  },
];

const EXERCISES = [
  {
    key: "exercise:1",
    title: "Exercice 1 — Résumé personnel",
    prompt: "En 3-4 phrases, expliquez avec vos propres mots les concepts clés vus dans la leçon 1.",
  },
  {
    key: "exercise:2",
    title: "Exercice 2 — Application pratique",
    prompt: "Proposez un mini cas d'usage concret où vous appliqueriez ce qui a été vu en leçon 2 et 3.",
  },
  {
    key: "exercise:3",
    title: "Exercice 3 — Projet de synthèse",
    prompt: "Décrivez un livrable réaliste qui combine au moins deux notions vues en leçon 4 ou 5.",
  },
];

type ProgressRow = {
  item_key: string;
  completed: boolean;
  submission: string;
  score: number;
};

function LearnPage() {
  const { courseId } = Route.useParams();
  const { user } = useSession();
  const navigate = useNavigate();
  const [course, setCourse] = useState<CourseMeta | null>(null);
  const [progress, setProgress] = useState<Record<string, ProgressRow>>({});
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState<boolean | null>(null);
  const [currentLesson, setCurrentLesson] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: c }, { data: en }, { data: pr }] = await Promise.all([
      supabase
        .from("teacher_courses")
        .select("id,title,category,level,students,teacher_id")
        .eq("id", courseId)
        .maybeSingle(),
      supabase
        .from("enrollments")
        .select("id")
        .eq("student_id", user.id)
        .eq("course_id", courseId)
        .maybeSingle(),
      supabase
        .from("course_progress")
        .select("item_key,completed,submission,score")
        .eq("user_id", user.id)
        .eq("course_id", courseId),
    ]);
    setCourse((c as CourseMeta) ?? null);
    setEnrolled(Boolean(en));
    const map: Record<string, ProgressRow> = {};
    for (const row of (pr ?? []) as ProgressRow[]) map[row.item_key] = row;
    setProgress(map);
    setLoading(false);
  }, [courseId, user.id]);

  useEffect(() => {
    if (user.id) load();
  }, [load, user.id]);

  async function upsert(item_key: string, patch: Partial<ProgressRow>) {
    const base: ProgressRow = progress[item_key] ?? {
      item_key,
      completed: false,
      submission: "",
      score: 0,
    };
    const next: ProgressRow = { ...base, ...patch, item_key };
    setProgress((prev) => ({ ...prev, [item_key]: next }));
    await supabase.from("course_progress").upsert(
      {
        user_id: user.id,
        course_id: courseId,
        item_key,
        completed: next.completed,
        submission: next.submission,
        score: next.score,
      },
      { onConflict: "user_id,course_id,item_key" },
    );
  }

  async function enroll() {
    const { error } = await supabase
      .from("enrollments")
      .insert({ student_id: user.id, course_id: courseId });
    if (!error) setEnrolled(true);
  }

  const totalItems = LESSONS.length + EXERCISES.length;
  const completedCount = useMemo(
    () =>
      [...LESSONS, ...EXERCISES].filter((it) => progress[it.key]?.completed).length,
    [progress],
  );
  const pct = Math.round((completedCount / totalItems) * 100);

  if (loading) {
    return (
      <AppShell>
        <div className="grid min-h-[60vh] place-items-center text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </AppShell>
    );
  }

  if (!course) {
    return (
      <AppShell>
        <div className="p-10 text-center">
          <p className="font-display text-2xl font-semibold">Cours introuvable</p>
          <Link to="/courses" className="mt-3 inline-block text-sm font-semibold text-primary hover:underline">
            ← Retour au catalogue
          </Link>
        </div>
      </AppShell>
    );
  }

  if (!enrolled) {
    return (
      <AppShell>
        <div className="mx-auto max-w-xl p-10 text-center">
          <Sparkles className="mx-auto h-10 w-10 text-primary" />
          <h1 className="mt-3 font-display text-2xl font-semibold">Inscrivez-vous pour suivre ce cours</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            « {course.title} » — {course.category} · {course.level}
          </p>
          <button
            onClick={enroll}
            className="mt-6 inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            S'inscrire maintenant
          </button>
          <button
            onClick={() => navigate({ to: "/courses" })}
            className="mt-3 block w-full text-xs text-muted-foreground hover:text-foreground"
          >
            Retour au catalogue
          </button>
        </div>
      </AppShell>
    );
  }

  const lesson = LESSONS[currentLesson];
  const lessonDone = Boolean(progress[lesson.key]?.completed);

  return (
    <AppShell>
      <div className="space-y-6 p-4 md:p-8">
        <div className="flex items-center justify-between">
          <Link to="/courses" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-4 w-4" /> Catalogue
          </Link>
          <Link
            to="/chat/$courseId"
            params={{ courseId: course.id }}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold shadow-soft hover:bg-muted"
          >
            <MessageCircle className="h-4 w-4 text-primary" /> Chat de classe
          </Link>
        </div>

        <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="rounded-md bg-primary-soft px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary">
              {course.category} · {course.level}
            </span>
            <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight md:text-4xl">
              {course.title}
            </h1>
          </div>
          <div className="rounded-xl border border-border bg-card px-4 py-3 shadow-soft min-w-[220px]">
            <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Trophy className="h-3.5 w-3.5" /> Progression
              </span>
              <span className="font-semibold text-foreground">{pct}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {completedCount}/{totalItems} éléments terminés
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="overflow-hidden rounded-2xl border border-border bg-black shadow-card">
              <video
                key={lesson.key}
                src={lesson.video}
                controls
                className="aspect-video w-full bg-black"
                onEnded={() => upsert(lesson.key, { completed: true })}
              />
              <div className="flex items-center justify-between gap-3 border-t border-border bg-card p-4">
                <div>
                  <p className="text-xs text-muted-foreground">
                    Leçon {currentLesson + 1} / {LESSONS.length} · {lesson.duration}
                  </p>
                  <p className="font-display text-base font-semibold">{lesson.title}</p>
                </div>
                <button
                  onClick={() => upsert(lesson.key, { completed: !lessonDone })}
                  className={[
                    "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition",
                    lessonDone
                      ? "border border-success/40 bg-success/10 text-success"
                      : "bg-primary text-primary-foreground hover:opacity-90",
                  ].join(" ")}
                >
                  {lessonDone ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" /> Leçon terminée
                    </>
                  ) : (
                    <>Marquer comme terminée</>
                  )}
                </button>
              </div>
            </div>

            <section className="space-y-3">
              <h2 className="font-display text-xl font-semibold">Exercices</h2>
              <p className="text-sm text-muted-foreground">
                Soumettez vos réponses — elles sont enregistrées et visibles par votre enseignant.
              </p>
              <div className="space-y-4">
                {EXERCISES.map((ex) => (
                  <ExerciseCard
                    key={ex.key}
                    exercise={ex}
                    state={progress[ex.key]}
                    onSubmit={(text) =>
                      upsert(ex.key, { submission: text, completed: true })
                    }
                    onReset={() =>
                      upsert(ex.key, { submission: "", completed: false })
                    }
                  />
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <h3 className="mb-3 font-display text-base font-semibold">Programme</h3>
              <ul className="space-y-1">
                {LESSONS.map((l, i) => {
                  const done = Boolean(progress[l.key]?.completed);
                  const active = i === currentLesson;
                  return (
                    <li key={l.key}>
                      <button
                        onClick={() => setCurrentLesson(i)}
                        className={[
                          "flex w-full items-center gap-3 rounded-lg p-2 text-left transition",
                          active ? "bg-primary-soft" : "hover:bg-muted",
                        ].join(" ")}
                      >
                        {done ? (
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                        ) : active ? (
                          <PlayCircle className="h-4 w-4 shrink-0 text-primary" />
                        ) : (
                          <Circle className="h-4 w-4 shrink-0 text-muted-foreground" />
                        )}
                        <span
                          className={`flex-1 text-sm ${done ? "text-muted-foreground line-through" : active ? "font-semibold text-primary" : "font-medium"}`}
                        >
                          {l.title}
                        </span>
                        <span className="text-xs text-muted-foreground">{l.duration}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-4 border-t border-border pt-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Exercices
                </p>
                <ul className="space-y-1">
                  {EXERCISES.map((ex) => {
                    const done = Boolean(progress[ex.key]?.completed);
                    return (
                      <li key={ex.key} className="flex items-center gap-2 px-2 py-1.5 text-sm">
                        {done ? (
                          <CheckCircle2 className="h-4 w-4 text-success" />
                        ) : (
                          <Circle className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className={done ? "text-muted-foreground line-through" : ""}>
                          {ex.title}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>

            {pct === 100 && (
              <div className="rounded-2xl border border-success/30 bg-success/10 p-5 text-center">
                <Trophy className="mx-auto h-8 w-8 text-success" />
                <p className="mt-2 font-display text-base font-semibold">Cours complété !</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Bravo, vous avez terminé toutes les leçons et exercices.
                </p>
              </div>
            )}
          </aside>
        </div>
      </div>
    </AppShell>
  );
}

function ExerciseCard({
  exercise,
  state,
  onSubmit,
  onReset,
}: {
  exercise: { key: string; title: string; prompt: string };
  state: ProgressRow | undefined;
  onSubmit: (text: string) => void;
  onReset: () => void;
}) {
  const submitted = Boolean(state?.completed);
  const [text, setText] = useState(state?.submission ?? "");

  useEffect(() => {
    setText(state?.submission ?? "");
  }, [state?.submission]);

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <div className="mb-2 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-base font-semibold">{exercise.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{exercise.prompt}</p>
        </div>
        {submitted && (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-success/10 px-2 py-1 text-[10px] font-semibold text-success">
            <CheckCircle2 className="h-3 w-3" /> Soumis
          </span>
        )}
      </div>
      <textarea
        value={text}
        disabled={submitted}
        onChange={(e) => setText(e.target.value)}
        placeholder="Votre réponse…"
        rows={4}
        className="w-full rounded-lg border border-border bg-surface p-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:opacity-70"
      />
      <div className="mt-3 flex justify-end gap-2">
        {submitted ? (
          <button
            onClick={onReset}
            className="rounded-lg border border-border bg-surface px-3 py-2 text-xs font-semibold hover:bg-muted"
          >
            Modifier
          </button>
        ) : (
          <button
            onClick={() => text.trim() && onSubmit(text.trim())}
            disabled={!text.trim()}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            <Send className="h-3.5 w-3.5" /> Soumettre
          </button>
        )}
      </div>
    </div>
  );
}
