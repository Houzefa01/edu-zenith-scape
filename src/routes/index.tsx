import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { CourseCard } from "@/components/course-card";
import { courses, upcomingSchedule, notifications } from "@/lib/mock-data";
import {
  ArrowUpRight,
  Flame,
  Trophy,
  Clock3,
  PlayCircle,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tableau de bord — Lumen" },
      { name: "description", content: "Suivez votre progression, vos cours et votre planning sur Lumen, l'école en ligne premium." },
      { property: "og:title", content: "Tableau de bord — Lumen" },
      { property: "og:description", content: "Votre espace d'apprentissage personnalisé." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const inProgress = courses.filter((c) => c.progress > 0 && c.progress < 100);
  const recommended = courses.slice(0, 3);

  return (
    <AppShell>
      <div className="space-y-8 p-4 md:p-8">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 md:p-10">
          <div className="absolute inset-0 -z-10 opacity-[0.35] bg-grid" />
          <div className="absolute -right-24 -top-24 -z-10 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />

          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-2 text-sm text-muted-foreground">Bonjour Nora 👋</p>
              <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
                Prête à reprendre <span className="text-primary">Design Systems</span> ?
              </h1>
              <p className="mt-3 max-w-xl text-sm text-muted-foreground">
                Tu es à 64% du module — il te reste 2 leçons avant ton certificat.
                Continue sur ta lancée, tu fais partie du top 8% des étudiants cette semaine.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  to="/courses/$courseId"
                  params={{ courseId: "design-systems" }}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-card transition hover:opacity-90"
                >
                  <PlayCircle className="h-4 w-4" /> Reprendre le cours
                </Link>
                <Link
                  to="/schedule"
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface-elevated px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted"
                >
                  Voir mon planning <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 md:gap-4">
              <Stat icon={Flame} label="Série" value="12j" tint="text-warning-foreground bg-warning/15" />
              <Stat icon={Trophy} label="Badges" value="07" tint="text-primary bg-primary-soft" />
              <Stat icon={Clock3} label="Cette sem." value="6h" tint="text-success bg-success/15" />
            </div>
          </div>
        </section>

        {/* Bento */}
        <section className="grid grid-cols-1 gap-4 md:grid-cols-6">
          {/* Progress big */}
          <div className="md:col-span-4 rounded-2xl border border-border bg-card p-6 shadow-soft">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-display text-lg font-semibold">Continuer l'apprentissage</h2>
                <p className="text-xs text-muted-foreground">Reprenez là où vous vous êtes arrêtée.</p>
              </div>
              <Link to="/courses" className="text-xs font-semibold text-primary hover:underline">
                Tous les cours →
              </Link>
            </div>
            <div className="space-y-3">
              {inProgress.slice(0, 3).map((c) => (
                <Link
                  key={c.id}
                  to="/courses/$courseId"
                  params={{ courseId: c.id }}
                  className="group flex items-center gap-4 rounded-xl border border-border bg-surface p-3 transition hover:border-primary/30 hover:bg-primary-soft/40"
                >
                  <div className="h-14 w-14 shrink-0 rounded-lg" style={{ backgroundImage: c.cover }} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{c.title}</p>
                    <p className="text-xs text-muted-foreground">{c.teacher} · {c.lessons} leçons</p>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${c.progress}%` }} />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-lg font-semibold">{c.progress}%</p>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{c.level}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Up next */}
          <div className="md:col-span-2 rounded-2xl border border-border bg-card p-6 shadow-soft">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">À venir</h2>
              <Link to="/schedule" className="text-xs font-semibold text-primary hover:underline">Tout</Link>
            </div>
            <ul className="space-y-3">
              {upcomingSchedule.slice(0, 4).map((s) => (
                <li key={s.id} className="flex items-start gap-3">
                  <span className={`mt-1 inline-flex h-7 items-center rounded-md px-2 text-[10px] font-semibold ${s.color}`}>
                    {s.type}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{s.title}</p>
                    <p className="text-xs text-muted-foreground">{s.time} · {s.duration}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Activity chart card */}
          <div className="md:col-span-3 rounded-2xl border border-border bg-card p-6 shadow-soft">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-display text-lg font-semibold">Activité de la semaine</h2>
                <p className="text-xs text-muted-foreground">Temps passé chaque jour (min)</p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-md bg-success/10 px-2 py-1 text-[11px] font-semibold text-success">
                <TrendingUp className="h-3 w-3" /> +18%
              </span>
            </div>
            <div className="flex h-44 items-end gap-2">
              {[42, 65, 28, 90, 55, 78, 110].map((v, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-2">
                  <div
                    className="w-full rounded-md bg-gradient-to-t from-primary/30 to-primary"
                    style={{ height: `${(v / 110) * 100}%` }}
                  />
                  <span className="text-[10px] text-muted-foreground">
                    {["L", "M", "M", "J", "V", "S", "D"][i]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Notifications */}
          <div className="md:col-span-3 rounded-2xl border border-border bg-card p-6 shadow-soft">
            <h2 className="mb-4 font-display text-lg font-semibold">Notifications</h2>
            <ul className="space-y-3">
              {notifications.map((n) => (
                <li key={n.id} className="flex gap-3 rounded-lg border border-border bg-surface p-3">
                  <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary-soft text-primary">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{n.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{n.body}</p>
                    <p className="mt-1 text-[10px] text-muted-foreground">{n.time}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Recommended */}
        <section>
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h2 className="font-display text-xl font-semibold">Recommandés pour vous</h2>
              <p className="text-sm text-muted-foreground">Sélectionnés selon votre parcours en Design Produit.</p>
            </div>
            <Link to="/courses" className="text-sm font-semibold text-primary hover:underline">
              Explorer le catalogue →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recommended.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  tint,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  tint: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface-elevated p-4">
      <div className={`mb-3 inline-grid h-9 w-9 place-items-center rounded-lg ${tint}`}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="font-display text-2xl font-semibold leading-none">{value}</p>
      <p className="mt-1 text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
    </div>
  );
}
