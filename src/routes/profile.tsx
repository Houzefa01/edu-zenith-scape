import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { useSession } from "@/lib/session";
import { courses } from "@/lib/mock-data";
import { Award, BookOpen, Flame, Mail, MapPin, Pencil, Trophy } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profil — Lumen" },
      { name: "description", content: "Votre profil Lumen : progression, badges et bio." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, setUser } = useSession();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [bio, setBio] = useState(
    "Designer produit passionnée par les design systems et la recherche utilisateur.",
  );

  const completed = courses.filter((c) => c.progress >= 100).length;
  const inProgress = courses.filter((c) => c.progress > 0 && c.progress < 100).length;

  function save() {
    setUser({
      ...user,
      name,
      email,
      initials: name
        .split(" ")
        .map((s) => s[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
    });
    setEditing(false);
  }

  return (
    <AppShell>
      <div className="space-y-8 p-4 md:p-8">
        <section className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 md:p-8">
          <div className="absolute -right-16 -top-16 -z-10 h-64 w-64 rounded-full bg-primary/15 blur-3xl" />
          <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-5">
              <div className="grid h-20 w-20 place-items-center rounded-2xl gradient-primary text-2xl font-bold text-primary-foreground shadow-soft">
                {user.initials}
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                  {user.role === "teacher" ? "Enseignant" : "Étudiant"}
                </p>
                <h1 className="font-display text-3xl font-semibold tracking-tight">{user.name}</h1>
                <p className="mt-1 inline-flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" /> {user.email}
                </p>
                <p className="mt-0.5 inline-flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" /> Paris, France
                </p>
              </div>
            </div>
            <button
              onClick={() => setEditing((v) => !v)}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface-elevated px-4 py-2 text-sm font-semibold hover:bg-muted"
            >
              <Pencil className="h-4 w-4" />
              {editing ? "Annuler" : "Modifier"}
            </button>
          </div>
        </section>

        {editing && (
          <section className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <h2 className="font-display text-lg font-semibold">Mes informations</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Field label="Nom complet">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:border-primary"
                />
              </Field>
              <Field label="Email">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:border-primary"
                />
              </Field>
              <Field label="Bio" className="md:col-span-2">
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </Field>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setEditing(false)}
                className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted"
              >
                Annuler
              </button>
              <button
                onClick={save}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
              >
                Enregistrer
              </button>
            </div>
          </section>
        )}

        <section className="grid gap-4 sm:grid-cols-3">
          <Stat icon={Trophy} label="Cours terminés" value={String(completed)} tint="bg-success/10 text-success" />
          <Stat icon={BookOpen} label="En cours" value={String(inProgress)} tint="bg-primary-soft text-primary" />
          <Stat icon={Flame} label="Série" value="12 jours" tint="bg-warning/15 text-warning-foreground" />
        </section>

        <section className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h2 className="font-display text-lg font-semibold">Badges récents</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            {["Design Tokens", "Profiler React", "UX Researcher", "Top 8 % hebdo"].map((b) => (
              <span
                key={b}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-semibold"
              >
                <Award className="h-3.5 w-3.5 text-primary" />
                {b}
              </span>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function Stat({ icon: Icon, label, value, tint }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; tint: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <div className={`mb-3 inline-grid h-10 w-10 place-items-center rounded-lg ${tint}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="font-display text-2xl font-semibold">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
