import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { RequireAuth } from "@/components/require-auth";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/session";
import { ChevronLeft, ChevronUp, Loader2, Send, ShieldCheck, Trash2, Users } from "lucide-react";

const PAGE_SIZE = 30;

export const Route = createFileRoute("/chat/$courseId")({
  head: () => ({
    meta: [
      { title: "Chat de classe — Lumen" },
      { name: "description", content: "Discutez en temps réel avec les étudiants et l'enseignant de votre cours." },
    ],
  }),
  component: () => (
    <RequireAuth>
      <ChatPage />
    </RequireAuth>
  ),
});

type Message = {
  id: string;
  course_id: string;
  author_id: string;
  author_name: string;
  body: string;
  created_at: string;
};

function ChatPage() {
  const { courseId } = Route.useParams();
  const { user } = useSession();
  const [course, setCourse] = useState<{ id: string; title: string; teacher_id: string } | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const shouldStickBottom = useRef(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data: c } = await supabase
      .from("teacher_courses")
      .select("id,title,teacher_id")
      .eq("id", courseId)
      .maybeSingle();
    setCourse(c as { id: string; title: string; teacher_id: string } | null);

    // Fetch the newest PAGE_SIZE, then reverse to ascending order
    const { data: msgs, error } = await supabase
      .from("course_messages")
      .select("*")
      .eq("course_id", courseId)
      .order("created_at", { ascending: false })
      .limit(PAGE_SIZE);

    if (error) {
      setAllowed(false);
    } else {
      setAllowed(true);
      const list = ((msgs ?? []) as Message[]).slice().reverse();
      setMessages(list);
      setHasMore((msgs ?? []).length === PAGE_SIZE);
    }
    setLoading(false);
  }, [courseId]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || messages.length === 0) return;
    setLoadingMore(true);
    const container = scrollRef.current;
    const prevHeight = container?.scrollHeight ?? 0;
    const prevTop = container?.scrollTop ?? 0;

    const oldest = messages[0].created_at;
    const { data, error } = await supabase
      .from("course_messages")
      .select("*")
      .eq("course_id", courseId)
      .lt("created_at", oldest)
      .order("created_at", { ascending: false })
      .limit(PAGE_SIZE);

    if (!error) {
      const older = ((data ?? []) as Message[]).slice().reverse();
      setMessages((prev) => [...older, ...prev]);
      setHasMore((data ?? []).length === PAGE_SIZE);
      // Preserve scroll position after prepend
      requestAnimationFrame(() => {
        if (container) {
          const newHeight = container.scrollHeight;
          container.scrollTop = newHeight - prevHeight + prevTop;
        }
      });
    }
    setLoadingMore(false);
  }, [courseId, hasMore, loadingMore, messages]);

  useEffect(() => {
    load();
  }, [load]);

  // Realtime subscription
  useEffect(() => {
    if (!allowed) return;
    const channel = supabase
      .channel(`course-chat-${courseId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "course_messages",
          filter: `course_id=eq.${courseId}`,
        },
        (payload) => {
          setMessages((prev) => {
            const m = payload.new as Message;
            if (prev.some((p) => p.id === m.id)) return prev;
            return [...prev, m];
          });
        },
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "course_messages",
          filter: `course_id=eq.${courseId}`,
        },
        (payload) => {
          const removed = payload.old as { id: string };
          setMessages((prev) => prev.filter((m) => m.id !== removed.id));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [allowed, courseId]);

  // Auto-scroll to bottom only when the user is already near the bottom
  useEffect(() => {
    if (!shouldStickBottom.current) return;
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  // After initial load, jump to bottom (no smooth)
  useEffect(() => {
    if (!loading && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [loading]);

  function onScroll(e: React.UIEvent<HTMLDivElement>) {
    const el = e.currentTarget;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    shouldStickBottom.current = distanceFromBottom < 80;
    if (el.scrollTop < 120 && hasMore && !loadingMore) {
      loadMore();
    }
  }

  const isTeacher = course?.teacher_id === user.id;

  async function send() {
    const body = input.trim();
    if (!body || sending) return;
    setSending(true);
    const author_name =
      (user as { full_name?: string; email?: string }).full_name ||
      (user as { email?: string }).email?.split("@")[0] ||
      "Anonyme";
    const { error } = await supabase.from("course_messages").insert({
      course_id: courseId,
      author_id: user.id,
      author_name,
      body,
    });
    if (!error) setInput("");
    setSending(false);
  }

  async function remove(id: string) {
    await supabase.from("course_messages").delete().eq("id", id);
  }

  const grouped = useMemo(() => groupByDay(messages), [messages]);

  if (loading) {
    return (
      <AppShell>
        <div className="grid min-h-[60vh] place-items-center text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </AppShell>
    );
  }

  if (!course || !allowed) {
    return (
      <AppShell>
        <div className="mx-auto max-w-md p-10 text-center">
          <ShieldCheck className="mx-auto h-10 w-10 text-muted-foreground" />
          <h1 className="mt-3 font-display text-2xl font-semibold">Accès restreint</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Vous devez être inscrit à ce cours (ou en être l'enseignant) pour accéder au chat.
          </p>
          <Link to="/courses" className="mt-4 inline-block text-sm font-semibold text-primary hover:underline">
            ← Voir les cours
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="flex h-[calc(100vh-4rem)] flex-col p-4 md:p-8">
        <Link
          to="/learn/$courseId"
          params={{ courseId }}
          className="mb-3 inline-flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" /> Retour au cours
        </Link>

        <header className="mb-4 flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">Salon de classe</p>
            <h1 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
              {course.title}
            </h1>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground w-fit">
            <Users className="h-3.5 w-3.5" /> Temps réel
            <span className="ml-1 inline-block h-2 w-2 rounded-full bg-success animate-pulse" />
          </span>
        </header>

        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto rounded-2xl border border-border bg-card p-4 shadow-soft"
        >
          {messages.length === 0 ? (
            <div className="grid h-full place-items-center text-center text-sm text-muted-foreground">
              <div>
                <p className="font-semibold text-foreground">Soyez le premier à écrire</p>
                <p className="mt-1">Posez une question, partagez une ressource…</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {grouped.map(([day, list]) => (
                <div key={day}>
                  <div className="mb-3 flex items-center gap-3">
                    <div className="h-px flex-1 bg-border" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {day}
                    </span>
                    <div className="h-px flex-1 bg-border" />
                  </div>
                  <ul className="space-y-3">
                    {list.map((m) => {
                      const mine = m.author_id === user.id;
                      const fromTeacher = m.author_id === course.teacher_id;
                      const canDelete = mine || isTeacher;
                      return (
                        <li
                          key={m.id}
                          className={`flex gap-3 ${mine ? "flex-row-reverse" : ""}`}
                        >
                          <div
                            className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-semibold ${
                              fromTeacher
                                ? "bg-primary text-primary-foreground"
                                : "bg-accent text-accent-foreground"
                            }`}
                          >
                            {initials(m.author_name)}
                          </div>
                          <div className={`group max-w-[80%] ${mine ? "items-end text-right" : ""}`}>
                            <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                              <span className="font-semibold text-foreground">{m.author_name}</span>
                              {fromTeacher && (
                                <span className="rounded-md bg-primary-soft px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-primary">
                                  Enseignant
                                </span>
                              )}
                              <span>· {timeOf(m.created_at)}</span>
                            </div>
                            <div
                              className={`relative inline-block rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap break-words ${
                                mine
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted text-foreground"
                              }`}
                            >
                              {m.body}
                              {canDelete && (
                                <button
                                  onClick={() => remove(m.id)}
                                  className="absolute -top-2 -right-2 hidden h-6 w-6 place-items-center rounded-full border border-border bg-card text-muted-foreground shadow-soft hover:text-destructive group-hover:grid"
                                  aria-label="Supprimer"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              )}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          className="mt-4 flex items-end gap-2"
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            rows={1}
            placeholder="Écrivez votre message… (Maj+Entrée pour aller à la ligne)"
            className="flex-1 resize-none rounded-2xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
          />
          <button
            type="submit"
            disabled={!input.trim() || sending}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-soft hover:opacity-90 disabled:opacity-50"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            <span className="hidden sm:inline">Envoyer</span>
          </button>
        </form>
      </div>
    </AppShell>
  );
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "?";
}

function timeOf(iso: string) {
  return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

function groupByDay(msgs: Message[]): [string, Message[]][] {
  const map = new Map<string, Message[]>();
  for (const m of msgs) {
    const d = new Date(m.created_at);
    const key = d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(m);
  }
  return Array.from(map.entries());
}
