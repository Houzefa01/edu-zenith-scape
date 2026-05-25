
CREATE TABLE public.course_typing (
  course_id uuid NOT NULL,
  user_id uuid NOT NULL,
  author_name text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (course_id, user_id)
);

ALTER TABLE public.course_typing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "typing members read"
ON public.course_typing
FOR SELECT
TO authenticated
USING (public.is_course_member(auth.uid(), course_id));

CREATE POLICY "typing self insert"
ON public.course_typing
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND public.is_course_member(auth.uid(), course_id)
);

CREATE POLICY "typing self update"
ON public.course_typing
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND public.is_course_member(auth.uid(), course_id)
);

CREATE POLICY "typing self delete"
ON public.course_typing
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

ALTER TABLE public.course_typing REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.course_typing;
