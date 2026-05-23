import { useEffect, useState } from "react";

export type Note = {
  id: string;
  title: string;
  body: string;
  course?: string;
  updatedAt: number;
};

const KEY = "lumen.notes.v1";

const SEED: Note[] = [
  {
    id: "n-seed-1",
    title: "Tokens de couleur — règles d'or",
    body:
      "1. Toujours nommer par intention (primary, surface) plutôt que par valeur.\n2. Conserver des paires fond/texte testées WCAG AA.\n3. Documenter les exceptions dans la gouvernance.",
    course: "Design Systems modernes",
    updatedAt: Date.now() - 1000 * 60 * 60 * 26,
  },
  {
    id: "n-seed-2",
    title: "React — éviter les re-renders inutiles",
    body:
      "• useMemo pour les calculs coûteux uniquement.\n• Stabiliser les callbacks passés à des enfants memo.\n• Séparer l'état proche de là où il est lu.",
    course: "React Avancé",
    updatedAt: Date.now() - 1000 * 60 * 60 * 6,
  },
];

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      setNotes(raw ? (JSON.parse(raw) as Note[]) : SEED);
    } catch {
      setNotes(SEED);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(KEY, JSON.stringify(notes)); } catch {}
  }, [notes, hydrated]);

  function create(input: Omit<Note, "id" | "updatedAt">) {
    const n: Note = { ...input, id: crypto.randomUUID(), updatedAt: Date.now() };
    setNotes((prev) => [n, ...prev]);
    return n;
  }
  function update(id: string, patch: Partial<Omit<Note, "id">>) {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ...patch, updatedAt: Date.now() } : n)),
    );
  }
  function remove(id: string) {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }
  return { notes, create, update, remove, hydrated };
}
