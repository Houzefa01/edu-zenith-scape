
CREATE TABLE public.course_messages (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null,
  author_id uuid not null,
  author_name text not null default '',
  body text not null,
  created_at timestamptz not null default now()
);

ALTER TABLE public.course_messages ENABLE ROW LEVEL SECURITY;

-- Helper: is the user a member of the course (enrolled student or its teacher)
CREATE OR REPLACE FUNCTION public.is_course_member(_user_id uuid, _course_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.teacher_courses c
    WHERE c.id = _course_id AND c.teacher_id = _user_id
  ) OR EXISTS (
    SELECT 1 FROM public.enrollments e
    WHERE e.course_id = _course_id AND e.student_id = _user_id
  );
$$;
REVOKE EXECUTE ON FUNCTION public.is_course_member(uuid, uuid) FROM anon, authenticated;

CREATE POLICY "messages members read" ON public.course_messages
  FOR SELECT TO authenticated
  USING (public.is_course_member(auth.uid(), course_id));

CREATE POLICY "messages members insert" ON public.course_messages
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = author_id
    AND public.is_course_member(auth.uid(), course_id)
  );

CREATE POLICY "messages author or teacher delete" ON public.course_messages
  FOR DELETE TO authenticated
  USING (
    auth.uid() = author_id
    OR EXISTS (
      SELECT 1 FROM public.teacher_courses c
      WHERE c.id = course_id AND c.teacher_id = auth.uid()
    )
  );

CREATE INDEX idx_course_messages_course_created ON public.course_messages(course_id, created_at);

ALTER PUBLICATION supabase_realtime ADD TABLE public.course_messages;
ALTER TABLE public.course_messages REPLICA IDENTITY FULL;
