import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Role = "student" | "teacher";
export type SessionUser = {
  name: string;
  email: string;
  initials: string;
  role: Role;
  subtitle: string;
};

const DEFAULT_USER: SessionUser = {
  name: "Nora Lambert",
  email: "nora.lambert@lumen.school",
  initials: "NL",
  role: "student",
  subtitle: "Étudiante · M2 Design",
};

const STORAGE_KEY = "lumen.session.v1";

type Ctx = {
  user: SessionUser;
  setUser: (u: SessionUser) => void;
  switchRole: (r: Role) => void;
  logout: () => void;
};

const SessionContext = createContext<Ctx | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<SessionUser>(DEFAULT_USER);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUserState({ ...DEFAULT_USER, ...JSON.parse(raw) });
    } catch {}
  }, []);

  const setUser = (u: SessionUser) => {
    setUserState(u);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(u)); } catch {}
  };

  const switchRole = (role: Role) =>
    setUser({
      ...user,
      role,
      subtitle: role === "teacher" ? "Enseignant · Design & Produit" : "Étudiante · M2 Design",
    });

  const logout = () => {
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    setUserState(DEFAULT_USER);
  };

  return (
    <SessionContext.Provider value={{ user, setUser, switchRole, logout }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}
