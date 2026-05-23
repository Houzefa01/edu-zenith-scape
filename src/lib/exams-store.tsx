import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type ExamAttempt = {
  examId: string;
  answers: Record<string, string>; // questionId -> choiceId
  score: number; // 0..100
  correctCount: number;
  total: number;
  submittedAt: string; // ISO
  durationSeconds: number;
};

type Ctx = {
  attempts: Record<string, ExamAttempt>; // examId -> latest attempt
  getAttempt: (examId: string) => ExamAttempt | undefined;
  saveAttempt: (a: ExamAttempt) => void;
  resetAttempt: (examId: string) => void;
};

const ExamsCtx = createContext<Ctx | null>(null);
const STORAGE_KEY = "lumen.exams.attempts.v1";

export function ExamsProvider({ children }: { children: ReactNode }) {
  const [attempts, setAttempts] = useState<Record<string, ExamAttempt>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setAttempts(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(attempts));
    } catch {}
  }, [attempts]);

  const saveAttempt = useCallback((a: ExamAttempt) => {
    setAttempts((prev) => ({ ...prev, [a.examId]: a }));
  }, []);

  const resetAttempt = useCallback((examId: string) => {
    setAttempts((prev) => {
      const next = { ...prev };
      delete next[examId];
      return next;
    });
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      attempts,
      getAttempt: (id) => attempts[id],
      saveAttempt,
      resetAttempt,
    }),
    [attempts, saveAttempt, resetAttempt],
  );

  return <ExamsCtx.Provider value={value}>{children}</ExamsCtx.Provider>;
}

export function useExams() {
  const ctx = useContext(ExamsCtx);
  if (!ctx) throw new Error("useExams must be used inside ExamsProvider");
  return ctx;
}
