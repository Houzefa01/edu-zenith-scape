import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/session";

export type Note = {
  id: string;
  title: string;
  body: string;
  course?: string;
  updatedAt: number;
};

function mapRow(r: {
  id: string;
  title: string;
  body: string;
  course: string | null;
  updated_at: string;
}): Note {
  return {
    id: r.id,
    title: r.title,
    body: r.body,
    course: r.course ?? undefined,
    updatedAt: new Date(r.updated_at).getTime(),
  };
}

export function useNotes() {
  const { user, isAuthenticated } = useSession();
  const [notes, setNotes] = useState<Note[]>([]);
  const [hydrated, setHydrated] = useState(false);

  const load = useCallback(async () => {
    if (!isAuthenticated || !user.id) {
      setNotes([]);
      setHydrated(true);
      return;
    }
    const { data, error } = await supabase
      .from("notes")
      .select("id,title,body,course,updated_at")
      .order("updated_at", { ascending: false });
    if (!error && data) setNotes(data.map(mapRow));
    setHydrated(true);
  }, [isAuthenticated, user.id]);

  useEffect(() => {
    setHydrated(false);
    load();
  }, [load]);

  async function create(input: Omit<Note, "id" | "updatedAt">) {
    if (!user.id) return null;
    const { data, error } = await supabase
      .from("notes")
      .insert({ user_id: user.id, title: input.title, body: input.body, course: input.course ?? null })
      .select("id,title,body,course,updated_at")
      .single();
    if (error || !data) return null;
    const n = mapRow(data);
    setNotes((prev) => [n, ...prev]);
    return n;
  }

  async function update(id: string, patch: Partial<Omit<Note, "id">>) {
    const dbPatch: Record<string, unknown> = {};
    if (patch.title !== undefined) dbPatch.title = patch.title;
    if (patch.body !== undefined) dbPatch.body = patch.body;
    if (patch.course !== undefined) dbPatch.course = patch.course ?? null;
    const { data, error } = await supabase
      .from("notes")
      .update(dbPatch)
      .eq("id", id)
      .select("id,title,body,course,updated_at")
      .single();
    if (error || !data) return;
    const n = mapRow(data);
    setNotes((prev) => prev.map((x) => (x.id === id ? n : x)));
  }

  async function remove(id: string) {
    const { error } = await supabase.from("notes").delete().eq("id", id);
    if (!error) setNotes((prev) => prev.filter((n) => n.id !== id));
  }

  return { notes, create, update, remove, hydrated };
}
