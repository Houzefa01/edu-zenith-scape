
-- Revoke direct execute access on SECURITY DEFINER functions.
-- They remain callable from RLS policies and triggers (executed as definer/owner).
REVOKE ALL ON FUNCTION public.is_course_member(uuid, uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.sync_course_students_count() FROM PUBLIC, anon, authenticated;
