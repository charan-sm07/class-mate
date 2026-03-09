
-- Fix: Change restrictive SELECT policies to permissive so authenticated users can read data

-- Departments: drop restrictive SELECT, re-create as permissive
DROP POLICY IF EXISTS "Departments readable by authenticated" ON public.departments;
CREATE POLICY "Departments readable by authenticated"
ON public.departments FOR SELECT TO authenticated
USING (true);

-- Classes: drop restrictive SELECT, re-create as permissive
DROP POLICY IF EXISTS "Classes readable by authenticated" ON public.classes;
CREATE POLICY "Classes readable by authenticated"
ON public.classes FOR SELECT TO authenticated
USING (true);

-- Subjects: drop restrictive SELECT, re-create as permissive
DROP POLICY IF EXISTS "Subjects readable by authenticated" ON public.subjects;
CREATE POLICY "Subjects readable by authenticated"
ON public.subjects FOR SELECT TO authenticated
USING (true);

-- QR sessions: drop restrictive SELECT, re-create as permissive
DROP POLICY IF EXISTS "QR sessions readable by authenticated" ON public.qr_sessions;
CREATE POLICY "QR sessions readable by authenticated"
ON public.qr_sessions FOR SELECT TO authenticated
USING (true);

-- Profiles: drop restrictive SELECT, re-create as permissive
DROP POLICY IF EXISTS "Profiles viewable by authenticated" ON public.profiles;
CREATE POLICY "Profiles viewable by authenticated"
ON public.profiles FOR SELECT TO authenticated
USING (true);

-- User roles: drop restrictive SELECT, re-create as permissive
DROP POLICY IF EXISTS "Roles viewable by authenticated" ON public.user_roles;
CREATE POLICY "Roles viewable by authenticated"
ON public.user_roles FOR SELECT TO authenticated
USING (true);

-- Attendance: drop restrictive SELECT, re-create as permissive
DROP POLICY IF EXISTS "Attendance readable by faculty or self" ON public.attendance_records;
CREATE POLICY "Attendance readable by faculty or self"
ON public.attendance_records FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'faculty'::app_role) OR 
  (student_id = auth.uid())
);

-- Fix attendance INSERT: make student QR policy permissive so it works independently
DROP POLICY IF EXISTS "Students can mark own attendance via QR" ON public.attendance_records;
CREATE POLICY "Students can mark own attendance via QR"
ON public.attendance_records FOR INSERT TO authenticated
WITH CHECK (student_id = auth.uid() AND qr_verified = true);
