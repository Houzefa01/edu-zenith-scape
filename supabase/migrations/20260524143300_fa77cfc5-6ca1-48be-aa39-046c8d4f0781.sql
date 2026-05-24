
CREATE TABLE public.course_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  course_id uuid not null,
  item_key text not null,
  completed boolean not null default false,
  submission text not null default '',
  score numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, course_id, item_key)
);

ALTER TABLE public.course_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "progress owner select" ON public.course_progress
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "progress owner insert" ON public.course_progress
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "progress owner update" ON public.course_progress
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "progress owner delete" ON public.course_progress
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "progress teacher read for own courses" ON public.course_progress
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.teacher_courses c
            WHERE c.id = course_progress.course_id AND c.teacher_id = auth.uid())
  );

CREATE TRIGGER trg_course_progress_updated
  BEFORE UPDATE ON public.course_progress
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_course_progress_user_course ON public.course_progress(user_id, course_id);
