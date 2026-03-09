-- Allow students to insert their own attendance records (for QR-based attendance)
CREATE POLICY "Students can mark own attendance via QR"
ON public.attendance_records
FOR INSERT
TO authenticated
WITH CHECK (
  student_id = auth.uid() AND qr_verified = true
);