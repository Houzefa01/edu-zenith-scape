import { createFileRoute, Link } from "@tanstack/react-router";
import { GraduationCap, Mail, Lock, User, BookOpen, Presentation, Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const signupSchema = z
  .object({
    fullName: z
      .string()
      .min(2, "Le nom doit contenir au moins 2 caractères")
      .max(100, "Le nom ne doit pas dépasser 100 caractères"),
    email: z
      .string()
      .min(1, "L'email est requis")
      .email("Adresse email invalide"),
    password: z
      .string()
      .min(8, "Le mot de passe doit contenir au moins 8 caractères")
      .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
      .regex(/[a-z]/, "Le mot de passe doit contenir au moins une minuscule")
      .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre"),
    confirmPassword: z.string().min(1, "Veuillez confirmer le mot de passe"),
    role: z.enum(["student", "teacher"]),
    terms: z.literal(true, {
      errorMap: () => ({ message: "Vous devez accepter les conditions d'utilisation" }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

type SignupFormData = z.infer<typeof signupSchema>;

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Créer un compte — Lumen" },
      { name: "description", content: "Rejoignez Lumen, l'école en ligne premium pour étudiants et enseignants." },
      { property: "og:title", content: "Créer un compte — Lumen" },
      { property: "og:description", content: "Inscription rapide à Lumen." },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      role: "student",
      terms: false as unknown as true,
    },
  });

  const role = watch("role");

  const onSubmit = async (data: SignupFormData) => {
    console.log("Signup data:", data);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    // TODO: connect to auth backend
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-primary to-primary/70 lg:block">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="absolute right-10 top-10 h-60 w-60 rounded-full bg-white/10 blur-3xl" />
        <div className="relative flex h-full flex-col justify-between p-12 text-primary-foreground">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/15 backdrop-blur">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span className="font-display text-lg font-semibold">Lumen</span>
          </div>
          <div className="max-w-md space-y-6">
            <h2 className="font-display text-4xl font-semibold leading-tight">
              Une école pensée pour ceux qui veulent vraiment apprendre.
            </h2>
            <ul className="space-y-3 text-sm opacity-90">
              {[
                "Cours produits par des praticiens reconnus",
                "Classes en direct, ateliers et examens",
                "Suivi de progression et certifications",
                "Communauté active 24/7",
              ].map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <span className="mt-0.5 grid h-4 w-4 place-items-center rounded-full bg-white/20 text-[10px]">✓</span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
          <p className="text-xs opacity-70">+18 000 étudiants déjà inscrits</p>
        </div>
      </aside>

      <main className="flex flex-col justify-center p-8 md:p-12">
        <div className="mx-auto w-full max-w-sm space-y-6">
          <div>
            <h1 className="font-display text-3xl font-semibold tracking-tight">Créer votre compte</h1>
            <p className="mt-1 text-sm text-muted-foreground">Commencez gratuitement en moins d'une minute.</p>
          </div>

          {/* Role picker */}
          <div className="grid grid-cols-2 gap-2 rounded-xl border border-border bg-surface p-1">
            <RoleButton
              active={role === "student"}
              onClick={() => setValue("role", "student")}
              icon={BookOpen}
              label="Étudiant"
            />
            <RoleButton
              active={role === "teacher"}
              onClick={() => setValue("role", "teacher")}
              icon={Presentation}
              label="Enseignant"
            />
          </div>
          {errors.role && <p className="text-xs text-destructive">{errors.role.message}</p>}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="fullName" className="text-xs font-semibold text-foreground/80">
                Nom complet
              </Label>
              <div className="relative flex items-center">
                <User className="pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="fullName"
                  placeholder="Nora Lambert"
                  className="h-11 pl-10"
                  {...register("fullName")}
                />
              </div>
              {errors.fullName && <p className="text-xs text-destructive">{errors.fullName.message}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="email" className="text-xs font-semibold text-foreground/80">
                Email
              </Label>
              <div className="relative flex items-center">
                <Mail className="pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="vous@exemple.com"
                  className="h-11 pl-10"
                  {...register("email")}
                />
              </div>
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="password" className="text-xs font-semibold text-foreground/80">
                Mot de passe
              </Label>
              <div className="relative flex items-center">
                <Lock className="pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="8 caractères minimum"
                  className="h-11 pl-10 pr-10"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="confirmPassword" className="text-xs font-semibold text-foreground/80">
                Confirmation du mot de passe
              </Label>
              <div className="relative flex items-center">
                <Lock className="pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Confirmez votre mot de passe"
                  className="h-11 pl-10 pr-10"
                  {...register("confirmPassword")}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 text-muted-foreground hover:text-foreground"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
            </div>

            <div className="flex items-start gap-2">
              <input
                id="terms"
                type="checkbox"
                className="mt-0.5 h-4 w-4 rounded border-border accent-primary"
                {...register("terms", { setValueAs: (v) => v === true || v === "on" })}
              />
              <Label htmlFor="terms" className="text-xs text-muted-foreground font-normal leading-relaxed">
                J'accepte les{" "}
                <a href="#" className="font-semibold text-primary hover:underline">
                  conditions d'utilisation
                </a>{" "}
                et la politique de confidentialité.
              </Label>
            </div>
            {errors.terms && <p className="text-xs text-destructive -mt-2">{errors.terms.message}</p>}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-11 w-full text-sm font-semibold shadow-card"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création en cours...
                </>
              ) : (
                <>Créer mon compte {role === "teacher" ? "enseignant" : "étudiant"}</>
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Déjà inscrit ?{" "}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Se connecter
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

function RoleButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition",
        active ? "bg-card text-foreground shadow-soft" : "text-muted-foreground hover:text-foreground",
      ].join(" ")}
    >
      <Icon className="h-4 w-4" /> {label}
    </button>
  );
}
