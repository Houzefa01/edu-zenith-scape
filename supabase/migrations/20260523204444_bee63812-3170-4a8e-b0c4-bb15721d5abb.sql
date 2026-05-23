
create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.teacher_courses(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(student_id, course_id)
);
alter table public.enrollments enable row level security;

create policy "enrollments student select own" on public.enrollments
  for select to authenticated using (auth.uid() = student_id);

create policy "enrollments teacher select for own courses" on public.enrollments
  for select to authenticated using (
    exists (
      select 1 from public.teacher_courses c
      where c.id = enrollments.course_id and c.teacher_id = auth.uid()
    )
  );

create policy "enrollments student insert own" on public.enrollments
  for insert to authenticated with check (auth.uid() = student_id);

create policy "enrollments student delete own" on public.enrollments
  for delete to authenticated using (auth.uid() = student_id);

create index enrollments_course_idx on public.enrollments(course_id);
create index enrollments_student_idx on public.enrollments(student_id);

-- Allow teachers to read attempts on their own exams (exam_attempts.exam_id matches teacher_exams.id as text)
create policy "attempts teacher read for own exams" on public.exam_attempts
  for select to authenticated using (
    exists (
      select 1 from public.teacher_exams e
      where e.id::text = exam_attempts.exam_id and e.teacher_id = auth.uid()
    )
  );
