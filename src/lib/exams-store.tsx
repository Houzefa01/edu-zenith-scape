import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/session";

export type ExamAttempt = {
  examId: string;
  answers: Record<string, string>;
  score: number;
  correctCount: number;
  total: number;
  submittedAt: string;
  durationSeconds: number;
};

type Ctx = {
  attempts: Record<string, ExamAttempt>;
  getAttempt: (examId: string) => ExamAttempt | undefined;
  saveAttempt: (a: ExamAttempt) => void;
  resetAttempt: (examId: string) => void;
};

const ExamsCtx = createContext<Ctx | null>(null);

export function ExamsProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useSession();
  const [attempts, setAttempts] = useState<Record<string, ExamAttempt>>({});

  useEffect(() => {
    if (!isAuthenticated || !user.id) {
      setAttempts({});
      return;
    }
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("exam_attempts")
        .select("exam_id,answers,score,correct_count,total,submitted_at,duration_seconds");
      if (cancelled || error || !data) return;
      const map: Record<string, ExamAttempt> = {};
      for (const r of data) {
        map[r.exam_id] = {
          examId: r.exam_id,
          answers: (r.answers as Record<string, string>) ?? {},
          score: Number(r.score),
          correctCount: r.correct_count,
          total: r.total,
          submittedAt: r.submitted_at,
          durationSeconds: r.duration_seconds,
        };
      }
      setAttempts(map);
    })();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, user.id]);

  const saveAttempt = useCallback(
    async (a: ExamAttempt) => {
      setAttempts((prev) => ({ ...prev, [a.examId]: a }));
      if (!user.id) return;
      await supabase
        .from("exam_attempts")
        .upsert(
          {
            user_id: user.id,
            exam_id: a.examId,
            answers: a.answers,
            score: a.score,
            correct_count: a.correctCount,
            total: a.total,
            submitted_at: a.submittedAt,
            duration_seconds: a.durationSeconds,
          },
          { onConflict: "user_id,exam_id" },
        );
    },
    [user.id],
  );

  const resetAttempt = useCallback(
    async (examId: string) => {
      setAttempts((prev) => {
        const next = { ...prev };
        delete next[examId];
        return next;
      });
      if (!user.id) return;
      await supabase.from("exam_attempts").delete().eq("exam_id", examId).eq("user_id", user.id);
    },
    [user.id],
  );

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
