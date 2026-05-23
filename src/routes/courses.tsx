import { RequireAuth } from "@/components/require-auth";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { CourseCard } from "@/components/course-card";
import { courses } from "@/lib/mock-data";
import { Check, GraduationCap, Loader2, Search, SlidersHorizontal, UserPlus, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { usePublishedCourses } from "@/lib/enrollments";

export const Route = createFileRoute("/courses")({
  validateSearch: (s: Record<string, unknown>) => ({ q: typeof s.q === "string" ? s.q : undefined }),
  head: () => ({
    meta: [
      { title: "Catalogue de cours — Lumen" },
      { name: "description", content: "Explorez le catalogue de cours premium de Lumen : design, dev, produit, data et plus." },
      { property: "og:title", content: "Catalogue de cours — Lumen" },
      { property: "og:description", content: "Tous les cours de l'école Lumen." },
    ],
  }),
  component: () => (<RequireAuth><CoursesPage /></RequireAuth>),
});

const categories = ["Tous", "Design", "Développement", "Data", "Produit", "Contenu"];
const levels = ["Tous niveaux", "Débutant", "Intermédiaire", "Avancé"] as const;

function CoursesPage() {
  const search = Route.useSearch();
  const [cat, setCat] = useState("Tous");
  const [lvl, setLvl] = useState<(typeof levels)[number]>("Tous niveaux");
  const [q, setQ] = useState(search.q ?? "");

  useEffect(() => {
    if (search.q !== undefined) setQ(search.q);
  }, [search.q]);

  const filtered = useMemo(
    () =>
      courses.filter(
        (c) =>
          (cat === "Tous" || c.category === cat) &&
          (lvl === "Tous niveaux" || c.level === lvl) &&
          (q === "" || c.title.toLowerCase().includes(q.toLowerCase())),
      ),
    [cat, lvl, q],
  );

  return (
    <AppShell>
      <div className="space-y-8 p-4 md:p-8">
        <header className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Catalogue</p>
          <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
            Apprenez ce qui compte vraiment
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            {courses.length} cours conçus avec des praticiens reconnus. Filtrez par niveau, sujet, ou cherchez ce que vous voulez maîtriser.
          </p>
        </header>

        <PublishedCoursesSection />


        <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 shadow-soft md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher un cours…"
              className="h-11 w-full rounded-lg border border-border bg-surface pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            <select
              value={lvl}
              onChange={(e) => setLvl(e.target.value as typeof lvl)}
              className="h-11 rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:border-primary"
            >
              {levels.map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((c) => {
            const active = c === cat;
            return (
              <button
                key={c}
                type="button"
                onClick={() => setCat(c)}
                className={[
                  "rounded-full border px-4 py-1.5 text-xs font-semibold transition",
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-surface-elevated text-foreground/70 hover:text-foreground",
                ].join(" ")}
              >
                {c}
              </button>
            );
          })}
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
            <p className="font-display text-lg font-semibold">Aucun cours trouvé</p>
            <p className="mt-1 text-sm text-muted-foreground">Essayez d'élargir vos filtres.</p>
            <Link to="/courses" onClick={() => { setCat("Tous"); setLvl("Tous niveaux"); setQ(""); }} className="mt-4 inline-block text-sm font-semibold text-primary hover:underline">
              Réinitialiser les filtres
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

function PublishedCoursesSection() {
  const { courses: list, enrolledIds, loading, enroll, unenroll } = usePublishedCourses();

  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold inline-flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" /> Cours des enseignants
          </h2>
          <p className="text-sm text-muted-foreground">
            Publiés par les enseignants Lumen — inscrivez-vous en un clic.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="grid place-items-center rounded-2xl border border-dashed border-border bg-card p-10 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : list.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
          Aucun cours publié pour le moment.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((c) => {
            const enrolled = enrolledIds.has(c.id);
            return (
              <div
                key={c.id}
                className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-soft"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="rounded-md bg-primary-soft px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary">
                    {c.category || "Cours"}
                  </span>
                  <span className="rounded-md bg-muted px-2 py-1 text-[10px] font-semibold text-foreground/70">
                    {c.level}
                  </span>
                </div>
                <h3 className="font-display text-base font-semibold leading-snug">{c.title}</h3>
                <div className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Users className="h-3.5 w-3.5" /> {c.students} inscrit{c.students > 1 ? "s" : ""}
                </div>
                <button
                  type="button"
                  onClick={() => (enrolled ? unenroll(c.id) : enroll(c.id))}
                  className={[
                    "mt-auto inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition",
                    enrolled
                      ? "border border-border bg-surface-elevated text-foreground hover:bg-muted"
                      : "bg-primary text-primary-foreground hover:opacity-90",
                  ].join(" ")}
                >
                  {enrolled ? (
                    <>
                      <Check className="h-4 w-4" /> Inscrit — se désinscrire
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" /> S'inscrire au cours
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
