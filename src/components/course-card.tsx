import { Link } from "@tanstack/react-router";
import { Clock, Star, Users } from "lucide-react";
import type { Course } from "@/lib/mock-data";

export function CourseCard({ course }: { course: Course }) {
  return (
    <Link
      to="/courses/$courseId"
      params={{ courseId: course.id }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition hover:-translate-y-0.5 hover:shadow-card"
    >
      <div
        className="relative h-32 w-full"
        style={{ backgroundImage: course.cover }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        <span className="absolute left-3 top-3 rounded-md bg-white/90 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-foreground backdrop-blur">
          {course.category}
        </span>
        <span className="absolute right-3 top-3 rounded-md bg-black/40 px-2 py-1 text-[10px] font-semibold text-white backdrop-blur">
          {course.level}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="font-display text-base font-semibold leading-snug text-foreground group-hover:text-primary">
          {course.title}
        </h3>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="grid h-6 w-6 place-items-center rounded-full bg-primary-soft text-[10px] font-semibold text-primary">
            {course.teacherAvatar}
          </div>
          <span>{course.teacher}</span>
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> {course.duration}
          </span>
          <span className="inline-flex items-center gap-1">
            <Users className="h-3.5 w-3.5" /> {course.students.toLocaleString("fr-FR")}
          </span>
          <span className="inline-flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-warning text-warning" /> {course.rating}
          </span>
        </div>

        <div className="mt-auto space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground">Progression</span>
            <span className="font-semibold">{course.progress}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${course.progress}%` }}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
