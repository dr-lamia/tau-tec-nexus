-- Create role enum (if not exists - using DO block)
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('student', 'instructor', 'company', 'admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.delivery_mode AS ENUM ('online', 'offline', 'hybrid');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.course_status AS ENUM ('draft', 'published', 'archived');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.request_status AS ENUM ('pending', 'in_review', 'approved', 'rejected', 'completed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.project_type AS ENUM ('corporate_training', 'ai_data_analytics');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User roles table (CRITICAL: separate table for security)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Courses table
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  delivery_mode delivery_mode NOT NULL DEFAULT 'online',
  status course_status NOT NULL DEFAULT 'draft',
  price DECIMAL(10,2) DEFAULT 0,
  duration_hours INTEGER,
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Course sessions table
CREATE TABLE IF NOT EXISTS public.course_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  session_date TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  zoom_link TEXT,
  location TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enrollments table
CREATE TABLE IF NOT EXISTS public.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  completed_at TIMESTAMPTZ,
  UNIQUE(student_id, course_id)
);

-- Course materials table
CREATE TABLE IF NOT EXISTS public.course_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Assignments table
CREATE TABLE IF NOT EXISTS public.assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Assignment submissions table
CREATE TABLE IF NOT EXISTS public.assignment_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  file_url TEXT NOT NULL,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  grade INTEGER CHECK (grade >= 0 AND grade <= 100),
  feedback TEXT,
  UNIQUE(assignment_id, student_id)
);

-- Discussion forums table
CREATE TABLE IF NOT EXISTS public.discussions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES public.discussions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Corporate/Company requests table
CREATE TABLE IF NOT EXISTS public.company_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_type project_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  employee_count INTEGER,
  duration_weeks INTEGER,
  delivery_mode delivery_mode,
  status request_status NOT NULL DEFAULT 'pending',
  budget DECIMAL(10,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Project files table (for company uploaded datasets)
CREATE TABLE IF NOT EXISTS public.project_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES public.company_requests(id) ON DELETE CASCADE NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
DO $$ BEGIN
  CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- RLS Policies for user_roles
DO $$ BEGIN
  CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can manage all roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- RLS Policies for courses
DO $$ BEGIN
  CREATE POLICY "Anyone can view published courses" ON public.courses FOR SELECT USING (status = 'published' OR instructor_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Instructors can create courses" ON public.courses FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'instructor') AND auth.uid() = instructor_id);
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Instructors can update own courses" ON public.courses FOR UPDATE USING (auth.uid() = instructor_id OR public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Instructors can delete own courses" ON public.courses FOR DELETE USING (auth.uid() = instructor_id OR public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- RLS Policies for course_sessions
DO $$ BEGIN
  CREATE POLICY "Users can view sessions of accessible courses" ON public.course_sessions FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND (status = 'published' OR instructor_id = auth.uid()))
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Instructors can manage own course sessions" ON public.course_sessions FOR ALL USING (
    EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND instructor_id = auth.uid())
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- RLS Policies for enrollments
DO $$ BEGIN
  CREATE POLICY "Students can view own enrollments" ON public.enrollments FOR SELECT USING (auth.uid() = student_id OR public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Students can enroll in courses" ON public.enrollments FOR INSERT WITH CHECK (auth.uid() = student_id AND public.has_role(auth.uid(), 'student'));
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Students can update own enrollment progress" ON public.enrollments FOR UPDATE USING (auth.uid() = student_id);
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- RLS Policies for course_materials
DO $$ BEGIN
  CREATE POLICY "Enrolled students and instructors can view materials" ON public.course_materials FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.enrollments WHERE course_id = course_materials.course_id AND student_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.courses WHERE id = course_materials.course_id AND instructor_id = auth.uid())
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Instructors can manage materials" ON public.course_materials FOR ALL USING (
    EXISTS (SELECT 1 FROM public.courses WHERE id = course_materials.course_id AND instructor_id = auth.uid())
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- RLS Policies for assignments
DO $$ BEGIN
  CREATE POLICY "Enrolled students and instructors can view assignments" ON public.assignments FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.enrollments WHERE course_id = assignments.course_id AND student_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.courses WHERE id = assignments.course_id AND instructor_id = auth.uid())
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Instructors can manage assignments" ON public.assignments FOR ALL USING (
    EXISTS (SELECT 1 FROM public.courses WHERE id = assignments.course_id AND instructor_id = auth.uid())
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- RLS Policies for assignment_submissions
DO $$ BEGIN
  CREATE POLICY "Students can view own submissions" ON public.assignment_submissions FOR SELECT USING (
    auth.uid() = student_id OR 
    EXISTS (SELECT 1 FROM public.assignments a JOIN public.courses c ON a.course_id = c.id WHERE a.id = assignment_id AND c.instructor_id = auth.uid())
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Students can submit assignments" ON public.assignment_submissions FOR INSERT WITH CHECK (auth.uid() = student_id);
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Instructors can grade submissions" ON public.assignment_submissions FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.assignments a JOIN public.courses c ON a.course_id = c.id WHERE a.id = assignment_id AND c.instructor_id = auth.uid())
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- RLS Policies for discussions
DO $$ BEGIN
  CREATE POLICY "Enrolled users can view discussions" ON public.discussions FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.enrollments WHERE course_id = discussions.course_id AND student_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.courses WHERE id = discussions.course_id AND instructor_id = auth.uid())
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Enrolled users can create discussions" ON public.discussions FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.enrollments WHERE course_id = discussions.course_id AND student_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.courses WHERE id = discussions.course_id AND instructor_id = auth.uid())
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- RLS Policies for company_requests
DO $$ BEGIN
  CREATE POLICY "Companies can view own requests" ON public.company_requests FOR SELECT USING (auth.uid() = company_id OR public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Companies can create requests" ON public.company_requests FOR INSERT WITH CHECK (auth.uid() = company_id AND public.has_role(auth.uid(), 'company'));
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can update requests" ON public.company_requests FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- RLS Policies for project_files
DO $$ BEGIN
  CREATE POLICY "Companies and admins can view project files" ON public.project_files FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.company_requests WHERE id = request_id AND (company_id = auth.uid() OR public.has_role(auth.uid(), 'admin')))
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Companies can upload project files" ON public.project_files FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.company_requests WHERE id = request_id AND company_id = auth.uid())
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- RLS Policies for notifications
DO $$ BEGIN
  CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Trigger function for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers (drop if exists first)
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_courses_updated_at ON public.courses;
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON public.courses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_company_requests_updated_at ON public.company_requests;
CREATE TRIGGER update_company_requests_updated_at BEFORE UPDATE ON public.company_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();