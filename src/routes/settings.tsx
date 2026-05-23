import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { useSession, type Role } from "@/lib/session";
import { useEffect, useState } from "react";
import { Bell, Globe, Moon, Palette, Shield, Sun, UserCog } from "lucide-react";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Paramètres — Lumen" },
      { name: "description", content: "Préférences, notifications, thème et sécurité de votre compte Lumen." },
    ],
  }),
  component: SettingsPage,
});

const THEME_KEY = "lumen.theme.v1";
const PREFS_KEY = "lumen.prefs.v1";

type Prefs = {
  emailReminders: boolean;
  pushReminders: boolean;
  weeklyDigest: boolean;
  language: "fr" | "en";
};
const DEFAULT_PREFS: Prefs = {
  emailReminders: true,
  pushReminders: true,
  weeklyDigest: false,
  language: "fr",
};

function SettingsPage() {
  const { user, switchRole } = useSession();
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);

  useEffect(() => {
    try {
      const t = localStorage.getItem(THEME_KEY) as "light" | "dark" | null;
      if (t) setTheme(t);
      const p = localStorage.getItem(PREFS_KEY);
      if (p) setPrefs({ ...DEFAULT_PREFS, ...JSON.parse(p) });
    } catch {}
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    try { localStorage.setItem(THEME_KEY, theme); } catch {}
  }, [theme]);

  useEffect(() => {
    try { localStorage.setItem(PREFS_KEY, JSON.stringify(prefs)); } catch {}
  }, [prefs]);

  return (
    <AppShell>
      <div className="space-y-8 p-4 md:p-8">
        <header>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Paramètres</p>
          <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
            Personnalisez votre expérience
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Ces préférences sont enregistrées localement sur votre appareil.
          </p>
        </header>

        <Section icon={UserCog} title="Compte" description="Rôle et informations de session.">
          <Row label="Rôle">
            <div className="inline-flex rounded-lg border border-border bg-surface p-1">
              {(["student", "teacher"] as Role[]).map((r) => (
                <button
                  key={r}
                  onClick={() => switchRole(r)}
                  className={[
                    "rounded-md px-3 py-1.5 text-xs font-semibold transition",
                    user.role === r
                      ? "bg-primary text-primary-foreground shadow-soft"
                      : "text-foreground/70 hover:text-foreground",
                  ].join(" ")}
                >
                  {r === "student" ? "Étudiant" : "Enseignant"}
                </button>
              ))}
            </div>
          </Row>
        </Section>

        <Section icon={Palette} title="Apparence" description="Thème clair ou sombre.">
          <Row label="Thème">
            <div className="inline-flex rounded-lg border border-border bg-surface p-1">
              <button
                onClick={() => setTheme("light")}
                className={[
                  "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition",
                  theme === "light" ? "bg-primary text-primary-foreground" : "text-foreground/70",
                ].join(" ")}
              >
                <Sun className="h-3.5 w-3.5" /> Clair
              </button>
              <button
                onClick={() => setTheme("dark")}
                className={[
                  "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition",
                  theme === "dark" ? "bg-primary text-primary-foreground" : "text-foreground/70",
                ].join(" ")}
              >
                <Moon className="h-3.5 w-3.5" /> Sombre
              </button>
            </div>
          </Row>
        </Section>

        <Section icon={Bell} title="Notifications" description="Comment Lumen vous tient au courant.">
          <Toggle
            label="Rappels par email"
            checked={prefs.emailReminders}
            onChange={(v) => setPrefs({ ...prefs, emailReminders: v })}
          />
          <Toggle
            label="Rappels push (in-app)"
            checked={prefs.pushReminders}
            onChange={(v) => setPrefs({ ...prefs, pushReminders: v })}
          />
          <Toggle
            label="Résumé hebdomadaire"
            checked={prefs.weeklyDigest}
            onChange={(v) => setPrefs({ ...prefs, weeklyDigest: v })}
          />
        </Section>

        <Section icon={Globe} title="Langue & région" description="Paramètres régionaux.">
          <Row label="Langue">
            <select
              value={prefs.language}
              onChange={(e) => setPrefs({ ...prefs, language: e.target.value as Prefs["language"] })}
              className="h-9 rounded-lg border border-border bg-surface px-3 text-sm"
            >
              <option value="fr">Français</option>
              <option value="en">English</option>
            </select>
          </Row>
        </Section>

        <Section icon={Shield} title="Sécurité" description="Protégez votre compte.">
          <Row label="Mot de passe">
            <button className="rounded-lg border border-border bg-surface-elevated px-3 py-1.5 text-xs font-semibold hover:bg-muted">
              Modifier
            </button>
          </Row>
          <Row label="Sessions actives">
            <span className="text-xs text-muted-foreground">1 appareil — ce navigateur</span>
          </Row>
        </Section>
      </div>
    </AppShell>
  );
}

function Section({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-soft">
      <div className="mb-5 flex items-start gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary-soft text-primary">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <h2 className="font-display text-lg font-semibold">{title}</h2>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="divide-y divide-border">{children}</div>
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
      <p className="text-sm font-medium">{label}</p>
      <div>{children}</div>
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <Row label={label}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={[
          "relative h-6 w-11 rounded-full transition",
          checked ? "bg-primary" : "bg-muted",
        ].join(" ")}
      >
        <span
          className={[
            "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition",
            checked ? "left-[22px]" : "left-0.5",
          ].join(" ")}
        />
      </button>
    </Row>
  );
}
