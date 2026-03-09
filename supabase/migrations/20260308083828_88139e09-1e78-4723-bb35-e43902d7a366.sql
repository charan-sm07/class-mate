
-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'faculty', 'student');

-- Create departments table
CREATE TABLE public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create classes table
CREATE TABLE public.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
  year INT NOT NULL,
  section TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  department_id UUID REFERENCES public.departments(id),
  class_id UUID REFERENCES public.classes(id),
  roll_number TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Create subjects table
CREATE TABLE public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
  faculty_id UUID REFERENCES auth.users(id),
  class_id UUID REFERENCES public.classes(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create attendance records table
CREATE TABLE public.attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  marked_by UUID NOT NULL REFERENCES auth.users(id),
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late')),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  qr_verified BOOLEAN DEFAULT false,
  UNIQUE (student_id, subject_id, date)
);

-- Create QR sessions table
CREATE TABLE public.qr_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  faculty_id UUID NOT NULL REFERENCES auth.users(id),
  qr_code TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_sessions ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), NEW.email);
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'student'));
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS Policies

-- Departments: readable by all authenticated, manageable by admin
CREATE POLICY "Departments readable by authenticated" ON public.departments
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Departments manageable by admin" ON public.departments
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Classes: readable by all authenticated, manageable by admin
CREATE POLICY "Classes readable by authenticated" ON public.classes
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Classes manageable by admin" ON public.classes
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Profiles: viewable by authenticated, editable by owner
CREATE POLICY "Profiles viewable by authenticated" ON public.profiles
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Profile created via trigger" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- User roles: viewable by authenticated
CREATE POLICY "Roles viewable by authenticated" ON public.user_roles
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Roles manageable by admin" ON public.user_roles
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Subjects: readable by authenticated, manageable by admin
CREATE POLICY "Subjects readable by authenticated" ON public.subjects
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Subjects manageable by admin" ON public.subjects
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Attendance: readable by faculty/admin or own records, writable by faculty
CREATE POLICY "Attendance readable by faculty or self" ON public.attendance_records
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'faculty') OR
    student_id = auth.uid()
  );
CREATE POLICY "Attendance markable by faculty" ON public.attendance_records
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'faculty') OR
    public.has_role(auth.uid(), 'admin')
  );
CREATE POLICY "Attendance updatable by faculty" ON public.attendance_records
  FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'faculty') OR
    public.has_role(auth.uid(), 'admin')
  );

-- QR sessions: manageable by faculty, readable by students
CREATE POLICY "QR sessions readable by authenticated" ON public.qr_sessions
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "QR sessions creatable by faculty" ON public.qr_sessions
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'faculty') OR
    public.has_role(auth.uid(), 'admin')
  );
CREATE POLICY "QR sessions updatable by faculty" ON public.qr_sessions
  FOR UPDATE TO authenticated
  USING (faculty_id = auth.uid());
