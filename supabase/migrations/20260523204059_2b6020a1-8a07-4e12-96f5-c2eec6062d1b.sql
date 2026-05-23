
-- NOTES
create table public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default '',
  body text not null default '',
  course text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.notes enable row level security;
create policy "notes owner select" on public.notes for select to authenticated using (auth.uid() = user_id);
create policy "notes owner insert" on public.notes for insert to authenticated with check (auth.uid() = user_id);
create policy "notes owner update" on public.notes for update to authenticated using (auth.uid() = user_id);
create policy "notes owner delete" on public.notes for delete to authenticated using (auth.uid() = user_id);
create trigger notes_updated before update on public.notes for each row execute function public.set_updated_at();
create index notes_user_idx on public.notes(user_id, updated_at desc);

-- EXAM ATTEMPTS
create table public.exam_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  exam_id text not null,
  answers jsonb not null default '{}'::jsonb,
  score numeric not null default 0,
  correct_count int not null default 0,
  total int not null default 0,
  duration_seconds int not null default 0,
  submitted_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, exam_id)
);
alter table public.exam_attempts enable row level security;
create policy "attempts owner select" on public.exam_attempts for select to authenticated using (auth.uid() = user_id);
create policy "attempts owner insert" on public.exam_attempts for insert to authenticated with check (auth.uid() = user_id);
create policy "attempts owner update" on public.exam_attempts for update to authenticated using (auth.uid() = user_id);
create policy "attempts owner delete" on public.exam_attempts for delete to authenticated using (auth.uid() = user_id);
create trigger attempts_updated before update on public.exam_attempts for each row execute function public.set_updated_at();

-- TEACHER COURSES
create table public.teacher_courses (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  category text not null default '',
  level text not null default 'Débutant',
  students int not null default 0,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.teacher_courses enable row level security;
create policy "courses public read published" on public.teacher_courses for select to authenticated using (published = true or auth.uid() = teacher_id);
create policy "courses teacher insert" on public.teacher_courses for insert to authenticated with check (auth.uid() = teacher_id and public.has_role(auth.uid(), 'teacher'));
create policy "courses teacher update" on public.teacher_courses for update to authenticated using (auth.uid() = teacher_id);
create policy "courses teacher delete" on public.teacher_courses for delete to authenticated using (auth.uid() = teacher_id);
create trigger teacher_courses_updated before update on public.teacher_courses for each row execute function public.set_updated_at();

-- TEACHER EXAMS
create table public.teacher_exams (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  course text not null default '',
  exam_date timestamptz not null default now(),
  duration_min int not null default 30,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.teacher_exams enable row level security;
create policy "exams public read published" on public.teacher_exams for select to authenticated using (published = true or auth.uid() = teacher_id);
create policy "exams teacher insert" on public.teacher_exams for insert to authenticated with check (auth.uid() = teacher_id and public.has_role(auth.uid(), 'teacher'));
create policy "exams teacher update" on public.teacher_exams for update to authenticated using (auth.uid() = teacher_id);
create policy "exams teacher delete" on public.teacher_exams for delete to authenticated using (auth.uid() = teacher_id);
create trigger teacher_exams_updated before update on public.teacher_exams for each row execute function public.set_updated_at();
