import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { exercises, type Exercise } from "@/lib/mock-data";

export type ExerciseStatus = "À faire" | "En cours" | "Terminé";

export type ExerciseProgress = {
  exerciseId: string;
  answers: string[]; // index-aligned with steps
  submitted: boolean[]; // per-step submission flag
  stepIndex: number;
  status: ExerciseStatus;
  progress: number; // 0..100
  updatedAt: string;
};

type Ctx = {
  getProgress: (exerciseId: string) => ExerciseProgress;
  saveAnswer: (exerciseId: string, stepIndex: number, value: string) => void;
  submitAnswer: (exerciseId: string, stepIndex: number) => void;
  editAnswer: (exerciseId: string, stepIndex: number) => void;
  setStepIndex: (exerciseId: string, stepIndex: number) => void;
  markCompleted: (exerciseId: string) => void;
  resetProgress: (exerciseId: string) => void;
  // aggregated view for lists
  decorate: (exo: Exercise) => Exercise & { status: ExerciseStatus; progress: number };
};

const ExercisesCtx = createContext<Ctx | null>(null);
const STORAGE_KEY = "lumen.exercises.progress.v1";

function defaultFor(exerciseId: string): ExerciseProgress {
  const exo = exercises.find((e) => e.id === exerciseId);
  const len = exo?.steps.length ?? 0;
  // Seed from mock-data so the initial app state matches the existing demo
  const seed = exo;
  return {
    exerciseId,
    answers: Array.from({ length: len }, () => ""),
    submitted: Array.from({ length: len }, (_, i) =>
      seed?.status === "Terminé"
        ? true
        : seed?.status === "En cours"
          ? i < Math.floor((len * (seed.progress ?? 0)) / 100)
          : false,
    ),
    stepIndex: seed?.status === "En cours"
      ? Math.min(len - 1, Math.floor((len * (seed.progress ?? 0)) / 100))
      : 0,
    status: (seed?.status as ExerciseStatus) ?? "À faire",
    progress: seed?.progress ?? 0,
    updatedAt: new Date().toISOString(),
  };
}

function computeDerived(p: ExerciseProgress): Pick<ExerciseProgress, "status" | "progress"> {
  const total = p.submitted.length || 1;
  const done = p.submitted.filter(Boolean).length;
  const progress = Math.round((done / total) * 100);
  const status: ExerciseStatus =
    done === 0 ? "À faire" : done >= total ? "Terminé" : "En cours";
  return { status, progress };
}

export function ExercisesProvider({ children }: { children: ReactNode }) {
  const [map, setMap] = useState<Record<string, ExerciseProgress>>({});

  // Hydrate
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const stored: Record<string, ExerciseProgress> = raw ? JSON.parse(raw) : {};
      const next: Record<string, ExerciseProgress> = {};
      for (const e of exercises) {
        next[e.id] = stored[e.id] ?? defaultFor(e.id);
      }
      setMap(next);
    } catch {
      const next: Record<string, ExerciseProgress> = {};
      for (const e of exercises) next[e.id] = defaultFor(e.id);
      setMap(next);
    }
  }, []);

  useEffect(() => {
    if (Object.keys(map).length === 0) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
    } catch {}
  }, [map]);

  const update = useCallback(
    (id: string, fn: (p: ExerciseProgress) => ExerciseProgress) => {
      setMap((prev) => {
        const cur = prev[id] ?? defaultFor(id);
        const draft = fn(cur);
        const derived = computeDerived(draft);
        return {
          ...prev,
          [id]: { ...draft, ...derived, updatedAt: new Date().toISOString() },
        };
      });
    },
    [],
  );

  const value = useMemo<Ctx>(
    () => ({
      getProgress: (id) => map[id] ?? defaultFor(id),
      saveAnswer: (id, idx, v) =>
        update(id, (p) => {
          const answers = [...p.answers];
          answers[idx] = v;
          return { ...p, answers };
        }),
      submitAnswer: (id, idx) =>
        update(id, (p) => {
          const submitted = [...p.submitted];
          submitted[idx] = true;
          return { ...p, submitted, stepIndex: Math.max(p.stepIndex, idx) };
        }),
      editAnswer: (id, idx) =>
        update(id, (p) => {
          const submitted = [...p.submitted];
          submitted[idx] = false;
          return { ...p, submitted, stepIndex: idx };
        }),
      setStepIndex: (id, idx) => update(id, (p) => ({ ...p, stepIndex: idx })),
      markCompleted: (id) =>
        update(id, (p) => ({
          ...p,
          submitted: p.submitted.map(() => true),
        })),
      resetProgress: (id) =>
        update(id, () => ({
          ...defaultFor(id),
          answers: Array.from({ length: defaultFor(id).answers.length }, () => ""),
          submitted: Array.from({ length: defaultFor(id).submitted.length }, () => false),
          stepIndex: 0,
          status: "À faire",
          progress: 0,
        })),
      decorate: (exo) => {
        const p = map[exo.id] ?? defaultFor(exo.id);
        return { ...exo, status: p.status, progress: p.progress };
      },
    }),
    [map, update],
  );

  return <ExercisesCtx.Provider value={value}>{children}</ExercisesCtx.Provider>;
}

export function useExercises() {
  const ctx = useContext(ExercisesCtx);
  if (!ctx) throw new Error("useExercises must be used inside ExercisesProvider");
  return ctx;
}
