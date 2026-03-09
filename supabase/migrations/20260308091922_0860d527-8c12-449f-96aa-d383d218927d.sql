
-- Fix: Change restrictive INSERT policies to permissive so they work independently

-- Drop and recreate faculty insert as PERMISSIVE
DROP POLICY IF EXISTS "Attendance markable by faculty" ON public.attendance_records;
CREATE POLICY "Attendance markable by faculty"
ON public.attendance_records FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'faculty'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Drop and recreate student QR insert as PERMISSIVE
DROP POLICY IF EXISTS "Students can mark own attendance via QR" ON public.attendance_records;
CREATE POLICY "Students can mark own attendance via QR"
ON public.attendance_records FOR INSERT TO authenticated
WITH CHECK (student_id = auth.uid() AND qr_verified = true);

-- Also fix SELECT and UPDATE to be permissive
DROP POLICY IF EXISTS "Attendance readable by faculty or self" ON public.attendance_records;
CREATE POLICY "Attendance readable by faculty or self"
ON public.attendance_records FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'faculty'::app_role) OR student_id = auth.uid());

DROP POLICY IF EXISTS "Attendance updatable by faculty" ON public.attendance_records;
CREATE POLICY "Attendance updatable by faculty"
ON public.attendance_records FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'faculty'::app_role) OR has_role(auth.uid(), 'admin'::app_role));
