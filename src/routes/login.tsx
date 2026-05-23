import { createFileRoute, Link } from "@tanstack/react-router";
import { GraduationCap, Mail, Lock, Eye } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Connexion — Lumen" },
      { name: "description", content: "Connectez-vous à votre espace Lumen pour reprendre vos cours, ateliers et examens." },
      { property: "og:title", content: "Connexion — Lumen" },
      { property: "og:description", content: "Accédez à votre école en ligne premium." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const [show, setShow] = useState(false);
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <main className="flex flex-col justify-between p-8 md:p-12">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl gradient-primary text-primary-foreground shadow-soft">
            <GraduationCap className="h-5 w-5" />
          </div>
          <span className="font-display text-lg font-semibold">Lumen</span>
        </Link>

        <div className="mx-auto w-full max-w-sm space-y-8">
          <div>
            <h1 className="font-display text-3xl font-semibold tracking-tight">Content de vous revoir.</h1>
            <p className="mt-2 text-sm text-muted-foreground">Connectez-vous à votre espace étudiant.</p>
          </div>

          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <Field label="Email" icon={Mail}>
              <input type="email" required placeholder="vous@exemple.com" className="h-11 w-full bg-transparent pl-10 pr-3 text-sm outline-none" />
            </Field>
            <Field label="Mot de passe" icon={Lock} right={
              <button type="button" onClick={() => setShow((s) => !s)} aria-label="Afficher le mot de passe" className="px-3 text-muted-foreground hover:text-foreground">
                <Eye className="h-4 w-4" />
              </button>
            }>
              <input type={show ? "text" : "password"} required placeholder="••••••••" className="h-11 w-full bg-transparent pl-10 pr-3 text-sm outline-none" />
            </Field>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-muted-foreground">
                <input type="checkbox" className="rounded border-border" /> Se souvenir de moi
              </label>
              <Link to="/login" className="font-semibold text-primary hover:underline">Mot de passe oublié ?</Link>
            </div>

            <Link to="/" className="flex h-11 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-card transition hover:opacity-90">
              Se connecter
            </Link>

            <div className="flex items-center gap-3 py-2">
              <div className="h-px flex-1 bg-border" />
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">ou</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <button type="button" className="flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-border bg-surface-elevated text-sm font-semibold hover:bg-muted">
              <span className="grid h-4 w-4 place-items-center rounded-sm bg-foreground text-[10px] font-bold text-background">G</span>
              Continuer avec Google
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Pas encore de compte ?{" "}
            <Link to="/signup" className="font-semibold text-primary hover:underline">Créer un compte</Link>
          </p>
        </div>

        <p className="text-xs text-muted-foreground">© 2026 Lumen · Tous droits réservés</p>
      </main>

      <aside className="relative hidden overflow-hidden bg-primary lg:block">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="absolute -left-20 top-1/4 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-0 h-72 w-72 rounded-full bg-black/20 blur-3xl" />
        <div className="relative flex h-full flex-col justify-end p-12 text-primary-foreground">
          <blockquote className="max-w-md">
            <p className="font-display text-2xl font-medium leading-snug">
              « Lumen a transformé ma façon d'apprendre. C'est l'école premium que j'attendais. »
            </p>
            <footer className="mt-4 text-sm opacity-80">— Camille Roux, Product Designer @Notion</footer>
          </blockquote>
        </div>
      </aside>
    </div>
  );
}

function Field({
  label,
  icon: Icon,
  right,
  children,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-foreground/80">{label}</span>
      <div className="relative flex items-center rounded-lg border border-border bg-surface-elevated transition focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10">
        <Icon className="pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground" />
        {children}
        {right}
      </div>
    </label>
  );
}
