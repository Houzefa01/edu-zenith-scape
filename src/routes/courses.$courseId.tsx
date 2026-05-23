import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import type { Course } from "@/lib/mock-data";
import { courses } from "@/lib/mock-data";
import {
  PlayCircle,
  CheckCircle2,
  Circle,
  Download,
  Hand,
  MessageCircle,
  Clock,
  Users,
  Star,
  ChevronLeft,
} from "lucide-react";

export const Route = createFileRoute("/courses/$courseId")({
  loader: ({ params }): { course: Course } => {
    const course = courses.find((c) => c.id === params.courseId);
    if (!course) throw notFound();
    return { course };
  },
  head: ({ loaderData }) =>
    loaderData
      ? {
          meta: [
            { title: `${loaderData.course.title} — Lumen` },
            { name: "description", content: loaderData.course.description },
            { property: "og:title", content: loaderData.course.title },
            { property: "og:description", content: loaderData.course.description },
          ],
        }
      : {},
  notFoundComponent: () => (
    <AppShell>
      <div className="p-10 text-center">
        <p className="font-display text-2xl font-semibold">Cours introuvable</p>
        <Link to="/courses" className="mt-3 inline-block text-sm font-semibold text-primary hover:underline">
          ← Retour au catalogue
        </Link>
      </div>
    </AppShell>
  ),
  component: CourseDetail,
});

function CourseDetail() {
  const { course } = Route.useLoaderData() as { course: Course };
  const related = courses.filter((c) => c.id !== course.id).slice(0, 3);

  return (
    <AppShell>
      <div className="space-y-8 p-4 md:p-8">
        <Link to="/courses" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-4 w-4" /> Catalogue
        </Link>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {/* Video player */}
            <div className="relative aspect-video overflow-hidden rounded-2xl border border-border shadow-card" style={{ backgroundImage: course.cover }}>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <button
                type="button"
                aria-label="Lire la vidéo"
                className="absolute inset-0 grid place-items-center"
              >
                <span className="grid h-20 w-20 place-items-center rounded-full bg-white/90 text-primary shadow-pop backdrop-blur transition hover:scale-105">
                  <PlayCircle className="h-10 w-10" />
                </span>
              </button>
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
                <div>
                  <p className="text-xs opacity-80">Leçon 4 sur {course.chapters.length}</p>
                  <p className="font-display text-lg font-semibold">
                    {course.chapters.find((c) => !c.done)?.title ?? "Cours terminé"}
                  </p>
                </div>
                <div className="hidden gap-2 md:flex">
                  <button className="rounded-lg border border-white/30 bg-white/10 px-3 py-1.5 text-xs font-semibold backdrop-blur transition hover:bg-white/20">
                    <Hand className="mr-1 inline h-3.5 w-3.5" /> Lever la main
                  </button>
                  <button className="rounded-lg border border-white/30 bg-white/10 px-3 py-1.5 text-xs font-semibold backdrop-blur transition hover:bg-white/20">
                    <MessageCircle className="mr-1 inline h-3.5 w-3.5" /> Poser une question
                  </button>
                </div>
              </div>
            </div>

            {/* Title & meta */}
            <div className="space-y-4">
              <span className="inline-flex items-center rounded-md bg-primary-soft px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary">
                {course.category} · {course.level}
              </span>
              <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">{course.title}</h1>
              <p className="text-base text-muted-foreground">{course.description}</p>

              <div className="flex flex-wrap items-center gap-5 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4" /> {course.duration}</span>
                <span className="inline-flex items-center gap-1.5"><Users className="h-4 w-4" /> {course.students.toLocaleString("fr-FR")} étudiants</span>
                <span className="inline-flex items-center gap-1.5"><Star className="h-4 w-4 fill-warning text-warning" /> {course.rating} / 5</span>
              </div>
            </div>

            {/* Resources */}
            <div className="rounded-2xl border border-border bg-card p-5">
              <h3 className="mb-3 font-display text-base font-semibold">Ressources</h3>
              <ul className="space-y-2">
                {["Slides — Module 1.pdf", "Cheatsheet tokens.fig", "Repo GitHub d'exemple"].map((r) => (
                  <li key={r}>
                    <button className="flex w-full items-center justify-between rounded-lg border border-border bg-surface px-4 py-3 text-sm transition hover:bg-muted">
                      <span className="font-medium">{r}</span>
                      <Download className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Comments */}
            <div className="rounded-2xl border border-border bg-card p-5">
              <h3 className="mb-4 font-display text-base font-semibold">Discussion</h3>
              <div className="mb-4 flex gap-3">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">NL</div>
                <div className="flex-1">
                  <textarea
                    placeholder="Posez une question à l'enseignant ou à la communauté…"
                    rows={3}
                    className="w-full rounded-lg border border-border bg-surface p-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                  />
                  <div className="mt-2 flex justify-end">
                    <button className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-soft hover:opacity-90">
                      Publier
                    </button>
                  </div>
                </div>
              </div>
              <ul className="space-y-4 border-t border-border pt-4">
                {[
                  { name: "Marc D.", time: "Il y a 2h", text: "Excellent module, la partie sur les tokens sémantiques m'a vraiment éclairé !" },
                  { name: "Léa P.", time: "Hier", text: "Une recommandation pour appliquer ça sur un design system existant ?" },
                ].map((c) => (
                  <li key={c.name} className="flex gap-3">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">
                      {c.name[0]}
                    </div>
                    <div>
                      <p className="text-sm"><span className="font-semibold">{c.name}</span> <span className="text-muted-foreground">· {c.time}</span></p>
                      <p className="mt-1 text-sm text-foreground/80">{c.text}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-display text-base font-semibold">Programme</h3>
                <span className="text-xs text-muted-foreground">{course.chapters.filter(c => c.done).length}/{course.chapters.length}</span>
              </div>
              <ul className="space-y-1">
                {course.chapters.map((ch, i) => (
                  <li key={i}>
                    <button className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition hover:bg-muted">
                      {ch.done ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                      ) : (
                        <Circle className="h-4 w-4 shrink-0 text-muted-foreground" />
                      )}
                      <span className={`flex-1 text-sm ${ch.done ? "text-muted-foreground line-through" : "font-medium"}`}>
                        {ch.title}
                      </span>
                      <span className="text-xs text-muted-foreground">{ch.duration}</span>
                    </button>
                  </li>
                ))}
              </ul>

              <div className="mt-5 space-y-2 border-t border-border pt-4">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Progression</span>
                  <span className="font-semibold">{course.progress}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${course.progress}%` }} />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <h3 className="mb-3 font-display text-base font-semibold">Enseignant</h3>
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  {course.teacherAvatar}
                </div>
                <div>
                  <p className="text-sm font-semibold">{course.teacher}</p>
                  <p className="text-xs text-muted-foreground">{course.category} · Mentor Lumen</p>
                </div>
              </div>
              <button className="mt-4 w-full rounded-lg border border-border bg-surface px-3 py-2 text-xs font-semibold transition hover:bg-muted">
                Voir le profil
              </button>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <h3 className="mb-3 font-display text-base font-semibold">Cours recommandés</h3>
              <ul className="space-y-3">
                {related.map((r) => (
                  <li key={r.id}>
                    <Link
                      to="/courses/$courseId"
                      params={{ courseId: r.id }}
                      className="flex items-center gap-3 rounded-lg p-2 transition hover:bg-muted"
                    >
                      <div className="h-10 w-10 shrink-0 rounded-md" style={{ backgroundImage: r.cover }} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{r.title}</p>
                        <p className="text-xs text-muted-foreground">{r.teacher}</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
