
-- Fix overly permissive INSERT policy on suspicious_flags
DROP POLICY "Flags insertable by authenticated" ON public.suspicious_flags;
CREATE POLICY "Flags insertable by faculty or admin" ON public.suspicious_flags FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'faculty'::app_role) OR has_role(auth.uid(), 'admin'::app_role));
