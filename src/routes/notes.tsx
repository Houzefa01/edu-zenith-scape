import { RequireAuth } from "@/components/require-auth";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { useNotes, type Note } from "@/lib/notes-store";
import { useMemo, useState } from "react";
import { Plus, Search, StickyNote, Trash2 } from "lucide-react";

export const Route = createFileRoute("/notes")({
  head: () => ({
    meta: [
      { title: "Mes notes — Lumen" },
      { name: "description", content: "Prenez et retrouvez vos notes de cours rapidement." },
    ],
  }),
  component: () => (<RequireAuth><NotesPage /></RequireAuth>),
});

function NotesPage() {
  const { notes, create, update, remove, hydrated } = useNotes();
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return notes;
    return notes.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.body.toLowerCase().includes(q) ||
        (n.course ?? "").toLowerCase().includes(q),
    );
  }, [notes, query]);

  const active: Note | undefined = filtered.find((n) => n.id === activeId) ?? filtered[0];

  function createNote() {
    const n = create({ title: "Nouvelle note", body: "" });
    setActiveId(n.id);
  }

  return (
    <AppShell>
      <div className="space-y-6 p-4 md:p-8">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">Notes</p>
            <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
              Votre carnet d'apprentissage
            </h1>
          </div>
          <button
            onClick={createNote}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> Nouvelle note
          </button>
        </header>

        <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
          <aside className="rounded-2xl border border-border bg-card p-3 shadow-soft">
            <div className="relative mb-3">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher…"
                className="h-9 w-full rounded-lg border border-border bg-surface pl-9 pr-3 text-sm outline-none focus:border-primary"
              />
            </div>
            <ul className="max-h-[60vh] space-y-1 overflow-y-auto pr-1">
              {hydrated && filtered.length === 0 && (
                <li className="px-3 py-6 text-center text-xs text-muted-foreground">
                  Aucune note pour le moment.
                </li>
              )}
              {filtered.map((n) => {
                const sel = (active?.id ?? null) === n.id;
                return (
                  <li key={n.id}>
                    <button
                      onClick={() => setActiveId(n.id)}
                      className={[
                        "w-full rounded-lg px-3 py-2 text-left transition",
                        sel ? "bg-primary-soft text-primary" : "hover:bg-muted",
                      ].join(" ")}
                    >
                      <p className="truncate text-sm font-semibold">{n.title || "Sans titre"}</p>
                      <p className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground">
                        {n.body || "Vide"}
                      </p>
                      <p className="mt-1 text-[10px] text-muted-foreground/70">
                        {new Date(n.updatedAt).toLocaleString("fr-FR", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </p>
                    </button>
                  </li>
                );
              })}
            </ul>
          </aside>

          <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            {active ? (
              <NoteEditor
                key={active.id}
                note={active}
                onChange={(patch) => update(active.id, patch)}
                onDelete={() => {
                  remove(active.id);
                  setActiveId(null);
                }}
              />
            ) : (
              <div className="grid h-full place-items-center py-20 text-center">
                <div>
                  <StickyNote className="mx-auto mb-3 h-10 w-10 text-muted-foreground/60" />
                  <p className="text-sm font-semibold">Aucune note sélectionnée</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Créez votre première note pour commencer.
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </AppShell>
  );
}

function NoteEditor({
  note,
  onChange,
  onDelete,
}: {
  note: Note;
  onChange: (patch: Partial<Note>) => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <input
          value={note.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="Titre"
          className="flex-1 bg-transparent text-xl font-display font-semibold outline-none"
        />
        <button
          onClick={() => {
            if (confirm("Supprimer cette note ?")) onDelete();
          }}
          aria-label="Supprimer la note"
          className="grid h-9 w-9 place-items-center rounded-lg border border-border text-muted-foreground hover:border-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      <input
        value={note.course ?? ""}
        onChange={(e) => onChange({ course: e.target.value })}
        placeholder="Cours associé (optionnel)"
        className="h-8 w-full max-w-xs rounded-md border border-border bg-surface px-2 text-xs outline-none focus:border-primary"
      />
      <textarea
        value={note.body}
        onChange={(e) => onChange({ body: e.target.value })}
        placeholder="Écrivez votre note ici…"
        rows={14}
        className="w-full flex-1 resize-none rounded-lg border border-border bg-surface p-3 text-sm leading-relaxed outline-none focus:border-primary"
      />
      <p className="text-[11px] text-muted-foreground">
        Modifiée le{" "}
        {new Date(note.updatedAt).toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" })}
      </p>
    </div>
  );
}
