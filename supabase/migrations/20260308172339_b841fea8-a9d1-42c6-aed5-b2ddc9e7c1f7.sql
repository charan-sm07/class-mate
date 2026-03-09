
-- Create leave_requests table
CREATE TABLE public.leave_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  subject_id UUID REFERENCES public.subjects(id) NOT NULL,
  class_id UUID REFERENCES public.classes(id) NOT NULL,
  leave_date DATE NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  reviewed_by UUID,
  review_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;

-- Students can insert their own leave requests
CREATE POLICY "Students can create own leave requests"
ON public.leave_requests FOR INSERT TO authenticated
WITH CHECK (student_id = auth.uid() AND has_role(auth.uid(), 'student'));

-- Students can view their own leave requests
CREATE POLICY "Students can view own leave requests"
ON public.leave_requests FOR SELECT TO authenticated
USING (student_id = auth.uid());

-- Faculty and admin can view all leave requests
CREATE POLICY "Faculty can view leave requests"
ON public.leave_requests FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'faculty') OR has_role(auth.uid(), 'admin'));

-- Faculty and admin can update leave requests (approve/reject)
CREATE POLICY "Faculty can update leave requests"
ON public.leave_requests FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'faculty') OR has_role(auth.uid(), 'admin'));

-- Add updated_at trigger
CREATE TRIGGER update_leave_requests_updated_at
  BEFORE UPDATE ON public.leave_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
