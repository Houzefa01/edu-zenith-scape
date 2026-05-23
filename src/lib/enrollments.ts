import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/session";

export type PublishedCourse = {
  id: string;
  title: string;
  category: string;
  level: string;
  students: number;
  teacher_id: string;
};

export function usePublishedCourses() {
  const { user, isAuthenticated } = useSession();
  const [courses, setCourses] = useState<PublishedCourse[]>([]);
  const [enrolledIds, setEnrolledIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data: cs } = await supabase
      .from("teacher_courses")
      .select("id,title,category,level,students,teacher_id")
      .eq("published", true)
      .order("updated_at", { ascending: false });
    setCourses((cs ?? []) as PublishedCourse[]);

    if (isAuthenticated && user.id) {
      const { data: en } = await supabase
        .from("enrollments")
        .select("course_id")
        .eq("student_id", user.id);
      setEnrolledIds(new Set((en ?? []).map((e) => e.course_id)));
    } else {
      setEnrolledIds(new Set());
    }
    setLoading(false);
  }, [isAuthenticated, user.id]);

  useEffect(() => {
    load();
  }, [load]);

  const enroll = useCallback(
    async (courseId: string) => {
      if (!user.id) return;
      const { error } = await supabase
        .from("enrollments")
        .insert({ student_id: user.id, course_id: courseId });
      if (!error) setEnrolledIds((prev) => new Set(prev).add(courseId));
    },
    [user.id],
  );

  const unenroll = useCallback(
    async (courseId: string) => {
      if (!user.id) return;
      const { error } = await supabase
        .from("enrollments")
        .delete()
        .eq("student_id", user.id)
        .eq("course_id", courseId);
      if (!error)
        setEnrolledIds((prev) => {
          const next = new Set(prev);
          next.delete(courseId);
          return next;
        });
    },
    [user.id],
  );

  return { courses, enrolledIds, loading, enroll, unenroll, reload: load };
}
