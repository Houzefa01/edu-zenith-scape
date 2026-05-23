import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type Role = "student" | "teacher" | "admin";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  initials: string;
  role: Role;
  subtitle: string;
  avatarUrl?: string | null;
};

const FALLBACK_USER: SessionUser = {
  id: "",
  name: "Invité",
  email: "",
  initials: "?",
  role: "student",
  subtitle: "Non connecté",
  avatarUrl: null,
};

type Ctx = {
  user: SessionUser;
  session: Session | null;
  isAuthenticated: boolean;
  loading: boolean;
  refresh: () => Promise<void>;
  switchRole: (r: Role) => void; // local UI toggle only
  logout: () => Promise<void>;
};

const SessionContext = createContext<Ctx | null>(null);

function initialsFrom(name: string, email: string) {
  const src = (name || email || "?").trim();
  const parts = src.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return src.slice(0, 2).toUpperCase();
}

async function loadUser(session: Session | null): Promise<SessionUser> {
  if (!session?.user) return FALLBACK_USER;
  const uid = session.user.id;

  const [{ data: profile }, { data: roles }] = await Promise.all([
    supabase.from("profiles").select("full_name, email, avatar_url, subtitle").eq("id", uid).maybeSingle(),
    supabase.from("user_roles").select("role").eq("user_id", uid),
  ]);

  const roleList = (roles ?? []).map((r) => r.role as Role);
  const role: Role = roleList.includes("admin")
    ? "admin"
    : roleList.includes("teacher")
      ? "teacher"
      : "student";

  const name = profile?.full_name || session.user.user_metadata?.full_name || session.user.email || "";
  const email = profile?.email || session.user.email || "";
  return {
    id: uid,
    name,
    email,
    initials: initialsFrom(name, email),
    role,
    subtitle:
      profile?.subtitle ||
      (role === "teacher" ? "Enseignant" : role === "admin" ? "Administrateur" : "Étudiant"),
    avatarUrl: profile?.avatar_url ?? null,
  };
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<SessionUser>(FALLBACK_USER);
  const [loading, setLoading] = useState(true);

  const hydrate = async (s: Session | null) => {
    setSession(s);
    const u = await loadUser(s);
    setUser(u);
    setLoading(false);
  };

  useEffect(() => {
    // Set up listener FIRST
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      // Defer Supabase calls to avoid deadlock inside callback
      setSession(s);
      setTimeout(() => {
        loadUser(s).then(setUser);
      }, 0);
    });

    // Then fetch existing session
    supabase.auth.getSession().then(({ data }) => hydrate(data.session));

    return () => sub.subscription.unsubscribe();
  }, []);

  const refresh = async () => {
    const { data } = await supabase.auth.getSession();
    await hydrate(data.session);
  };

  const switchRole = (role: Role) =>
    setUser((u) => ({
      ...u,
      role,
      subtitle: role === "teacher" ? "Enseignant" : role === "admin" ? "Administrateur" : "Étudiant",
    }));

  const logout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(FALLBACK_USER);
  };

  return (
    <SessionContext.Provider
      value={{ user, session, isAuthenticated: !!session, loading, refresh, switchRole, logout }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}
