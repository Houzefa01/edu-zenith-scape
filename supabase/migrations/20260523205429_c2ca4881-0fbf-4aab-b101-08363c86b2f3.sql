
CREATE OR REPLACE FUNCTION public.sync_course_students_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.teacher_courses
       SET students = students + 1
     WHERE id = NEW.course_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.teacher_courses
       SET students = GREATEST(students - 1, 0)
     WHERE id = OLD.course_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS enrollments_count_ins ON public.enrollments;
DROP TRIGGER IF EXISTS enrollments_count_del ON public.enrollments;

CREATE TRIGGER enrollments_count_ins
AFTER INSERT ON public.enrollments
FOR EACH ROW EXECUTE FUNCTION public.sync_course_students_count();

CREATE TRIGGER enrollments_count_del
AFTER DELETE ON public.enrollments
FOR EACH ROW EXECUTE FUNCTION public.sync_course_students_count();

-- Prevent duplicate enrollments
CREATE UNIQUE INDEX IF NOT EXISTS enrollments_student_course_uniq
  ON public.enrollments (student_id, course_id);
