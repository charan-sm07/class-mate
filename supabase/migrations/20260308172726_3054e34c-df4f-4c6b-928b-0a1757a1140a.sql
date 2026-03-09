
CREATE TABLE public.timetable_slots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
  faculty_id UUID NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  room TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.timetable_slots ENABLE ROW LEVEL SECURITY;

-- Everyone authenticated can read
CREATE POLICY "Timetable readable by authenticated"
ON public.timetable_slots FOR SELECT TO authenticated
USING (true);

-- Admin can manage
CREATE POLICY "Timetable manageable by admin"
ON public.timetable_slots FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'));
