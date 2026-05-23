import { useEffect, useState } from "react";

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
  date: string; // ISO
  durationMin: number;
  published: boolean;
};

const KEY = "lumen.teacher.v1";

const SEED: { courses: TeacherCourse[]; exams: TeacherExam[] } = {
  courses: [
    {
      id: "tc-1",
      title: "Design Systems modernes",
      category: "Design",
      level: "Intermédiaire",
      students: 128,
      published: true,
      updatedAt: Date.now() - 1000 * 60 * 60 * 48,
    },
    {
      id: "tc-2",
      title: "Atelier Tokens en production",
      category: "Design",
      level: "Avancé",
      students: 34,
      published: false,
      updatedAt: Date.now() - 1000 * 60 * 60 * 12,
    },
  ],
  exams: [
    {
      id: "ex-1",
      title: "Évaluation — Composants atomiques",
      course: "Design Systems modernes",
      date: new Date(Date.now() + 1000 * 60 * 60 * 72).toISOString(),
      durationMin: 45,
      published: true,
    },
  ],
};

export function useTeacherStore() {
  const [data, setData] = useState(SEED);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setData(JSON.parse(raw));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch {}
  }, [data, hydrated]);

  function addCourse(c: Omit<TeacherCourse, "id" | "updatedAt" | "students" | "published">) {
    setData((d) => ({
      ...d,
      courses: [
        { ...c, id: crypto.randomUUID(), students: 0, published: false, updatedAt: Date.now() },
        ...d.courses,
      ],
    }));
  }
  function toggleCoursePublish(id: string) {
    setData((d) => ({
      ...d,
      courses: d.courses.map((c) =>
        c.id === id ? { ...c, published: !c.published, updatedAt: Date.now() } : c,
      ),
    }));
  }
  function removeCourse(id: string) {
    setData((d) => ({ ...d, courses: d.courses.filter((c) => c.id !== id) }));
  }
  function addExam(e: Omit<TeacherExam, "id" | "published">) {
    setData((d) => ({
      ...d,
      exams: [{ ...e, id: crypto.randomUUID(), published: false }, ...d.exams],
    }));
  }
  function toggleExamPublish(id: string) {
    setData((d) => ({
      ...d,
      exams: d.exams.map((e) => (e.id === id ? { ...e, published: !e.published } : e)),
    }));
  }
  function removeExam(id: string) {
    setData((d) => ({ ...d, exams: d.exams.filter((e) => e.id !== id) }));
  }

  return {
    ...data,
    addCourse,
    toggleCoursePublish,
    removeCourse,
    addExam,
    toggleExamPublish,
    removeExam,
  };
}
