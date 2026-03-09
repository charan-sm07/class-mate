
-- Create class_sessions table
CREATE TABLE public.class_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id uuid NOT NULL REFERENCES public.subjects(id),
  class_id uuid NOT NULL REFERENCES public.classes(id),
  faculty_id uuid NOT NULL,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  qr_code text,
  qr_expiry timestamptz,
  session_status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.class_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sessions creatable by faculty" ON public.class_sessions FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'faculty'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Sessions readable by authenticated" ON public.class_sessions FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Sessions updatable by faculty" ON public.class_sessions FOR UPDATE TO authenticated
USING (faculty_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

-- Add session_id and face_verified to attendance_records
ALTER TABLE public.attendance_records 
  ADD COLUMN session_id uuid REFERENCES public.class_sessions(id),
  ADD COLUMN face_verified boolean DEFAULT false;

-- Unique constraint: one attendance per student per session
ALTER TABLE public.attendance_records 
  ADD CONSTRAINT unique_student_session UNIQUE (student_id, session_id);

-- Suspicious flags table for proxy detection
CREATE TABLE public.suspicious_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES public.class_sessions(id),
  student_id uuid NOT NULL,
  flag_type text NOT NULL,
  details jsonb,
  resolved boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.suspicious_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Flags readable by admin or faculty" ON public.suspicious_flags FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'faculty'::app_role));

CREATE POLICY "Flags insertable by authenticated" ON public.suspicious_flags FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "Flags updatable by admin" ON public.suspicious_flags FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Enable realtime for class_sessions and suspicious_flags
ALTER PUBLICATION supabase_realtime ADD TABLE public.class_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.suspicious_flags;
