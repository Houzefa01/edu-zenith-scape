import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/session";

export type CourseStats = { courseId: string; enrollments: number };
export type ExamStats = {
  examId: string;
  title: string;
  course: string;
  attempts: number;
  avgScore: number;
  lastSubmittedAt: string | null;
};

export function useTeacherStats() {
  const { user, isAuthenticated } = useSession();
  const [courseStats, setCourseStats] = useState<Record<string, number>>({});
  const [examStats, setExamStats] = useState<ExamStats[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!isAuthenticated || !user.id) {
      setCourseStats({});
      setExamStats([]);
      setLoading(false);
      return;
    }
    setLoading(true);

    // 1. Get teacher's courses & exams
    const [{ data: courses }, { data: exams }] = await Promise.all([
      supabase.from("teacher_courses").select("id").eq("teacher_id", user.id),
      supabase
        .from("teacher_exams")
        .select("id,title,course")
        .eq("teacher_id", user.id),
    ]);

    const courseIds = (courses ?? []).map((c) => c.id);
    const examList = exams ?? [];

    // 2. Enrollments per course
    const cs: Record<string, number> = {};
    if (courseIds.length) {
      const { data: enr } = await supabase
        .from("enrollments")
        .select("course_id")
        .in("course_id", courseIds);
      for (const id of courseIds) cs[id] = 0;
      for (const row of enr ?? []) cs[row.course_id] = (cs[row.course_id] ?? 0) + 1;
    }
    setCourseStats(cs);

    // 3. Attempts per exam
    const stats: ExamStats[] = [];
    for (const e of examList) {
      const { data: attempts } = await supabase
        .from("exam_attempts")
        .select("score,submitted_at")
        .eq("exam_id", e.id);
      const rows = attempts ?? [];
      const avg = rows.length
        ? rows.reduce((acc, r) => acc + Number(r.score), 0) / rows.length
        : 0;
      const last = rows
        .map((r) => r.submitted_at)
        .sort()
        .pop() ?? null;
      stats.push({
        examId: e.id,
        title: e.title,
        course: e.course,
        attempts: rows.length,
        avgScore: Math.round(avg),
        lastSubmittedAt: last,
      });
    }
    setExamStats(stats);
    setLoading(false);
  }, [isAuthenticated, user.id]);

  useEffect(() => {
    load();
  }, [load]);

  const totalEnrollments = Object.values(courseStats).reduce((a, b) => a + b, 0);

  return { courseStats, examStats, totalEnrollments, loading, reload: load };
}
