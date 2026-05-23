import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/session";

export type TeacherCourse = {
  id: string;
  title: string;
  category: string;
  level: "Débutant" | "Intermédiaire" | "Avancé";
  students: number;
  published: boolean;
  updatedAt: number;
};

export type TeacherExam = {
  id: string;
  title: string;
  course: string;
  date: string;
  durationMin: number;
  published: boolean;
};

function mapCourse(r: {
  id: string;
  title: string;
  category: string;
  level: string;
  students: number;
  published: boolean;
  updated_at: string;
}): TeacherCourse {
  return {
    id: r.id,
    title: r.title,
    category: r.category,
    level: (r.level as TeacherCourse["level"]) || "Débutant",
    students: r.students,
    published: r.published,
    updatedAt: new Date(r.updated_at).getTime(),
  };
}

function mapExam(r: {
  id: string;
  title: string;
  course: string;
  exam_date: string;
  duration_min: number;
  published: boolean;
}): TeacherExam {
  return {
    id: r.id,
    title: r.title,
    course: r.course,
    date: r.exam_date,
    durationMin: r.duration_min,
    published: r.published,
  };
}

export function useTeacherStore() {
  const { user, isAuthenticated } = useSession();
  const [courses, setCourses] = useState<TeacherCourse[]>([]);
  const [exams, setExams] = useState<TeacherExam[]>([]);
  const [hydrated, setHydrated] = useState(false);

  const load = useCallback(async () => {
    if (!isAuthenticated || !user.id) {
      setCourses([]);
      setExams([]);
      setHydrated(true);
      return;
    }
    const [{ data: cs }, { data: es }] = await Promise.all([
      supabase
        .from("teacher_courses")
        .select("id,title,category,level,students,published,updated_at")
        .eq("teacher_id", user.id)
        .order("updated_at", { ascending: false }),
      supabase
        .from("teacher_exams")
        .select("id,title,course,exam_date,duration_min,published")
        .eq("teacher_id", user.id)
        .order("exam_date", { ascending: true }),
    ]);
    setCourses((cs ?? []).map(mapCourse));
    setExams((es ?? []).map(mapExam));
    setHydrated(true);
  }, [isAuthenticated, user.id]);

  useEffect(() => {
    setHydrated(false);
    load();
  }, [load]);

  async function addCourse(c: Omit<TeacherCourse, "id" | "updatedAt" | "students" | "published">) {
    if (!user.id) return;
    const { data } = await supabase
      .from("teacher_courses")
      .insert({
        teacher_id: user.id,
        title: c.title,
        category: c.category,
        level: c.level,
      })
      .select("id,title,category,level,students,published,updated_at")
      .single();
    if (data) setCourses((prev) => [mapCourse(data), ...prev]);
  }

  async function toggleCoursePublish(id: string) {
    const current = courses.find((c) => c.id === id);
    if (!current) return;
    const { data } = await supabase
      .from("teacher_courses")
      .update({ published: !current.published })
      .eq("id", id)
      .select("id,title,category,level,students,published,updated_at")
      .single();
    if (data) setCourses((prev) => prev.map((c) => (c.id === id ? mapCourse(data) : c)));
  }

  async function removeCourse(id: string) {
    const { error } = await supabase.from("teacher_courses").delete().eq("id", id);
    if (!error) setCourses((prev) => prev.filter((c) => c.id !== id));
  }

  async function addExam(e: Omit<TeacherExam, "id" | "published">) {
    if (!user.id) return;
    const { data } = await supabase
      .from("teacher_exams")
      .insert({
        teacher_id: user.id,
        title: e.title,
        course: e.course,
        exam_date: e.date,
        duration_min: e.durationMin,
      })
      .select("id,title,course,exam_date,duration_min,published")
      .single();
    if (data) setExams((prev) => [mapExam(data), ...prev]);
  }

  async function toggleExamPublish(id: string) {
    const current = exams.find((e) => e.id === id);
    if (!current) return;
    const { data } = await supabase
      .from("teacher_exams")
      .update({ published: !current.published })
      .eq("id", id)
      .select("id,title,course,exam_date,duration_min,published")
      .single();
    if (data) setExams((prev) => prev.map((e) => (e.id === id ? mapExam(data) : e)));
  }

  async function removeExam(id: string) {
    const { error } = await supabase.from("teacher_exams").delete().eq("id", id);
    if (!error) setExams((prev) => prev.filter((e) => e.id !== id));
  }

  return {
    courses,
    exams,
    hydrated,
    addCourse,
    toggleCoursePublish,
    removeCourse,
    addExam,
    toggleExamPublish,
    removeExam,
  };
}
