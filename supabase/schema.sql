-- ==============================================================================
-- CampusSphere — Production Database Schema for Supabase (PostgreSQL)
-- Tailored for PCCOE (@pccoer.in Institutional Ecosystem)
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. USERS TABLE (Linked with Supabase Auth)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'Student' CHECK (role IN ('Student', 'Faculty', 'Admin')),
  department TEXT NOT NULL DEFAULT 'Computer Engineering',
  semester INTEGER DEFAULT 1,
  profile_pic_url TEXT,
  bio TEXT DEFAULT '',
  social_links JSONB DEFAULT '{"linkedin":"","github":"","website":""}'::jsonb,
  saved_resources JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index on email & role for fast lookup
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- 3. SUBJECTS TABLE
CREATE TABLE IF NOT EXISTS public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  semester INTEGER NOT NULL CHECK (semester BETWEEN 1 AND 8),
  department TEXT NOT NULL,
  description TEXT DEFAULT '',
  credits INTEGER DEFAULT 3,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subjects_dept_sem ON public.subjects(department, semester);

-- 4. RESOURCES (Study Materials, Notes, PYQs, Lab Manuals)
CREATE TABLE IF NOT EXISTS public.resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  uploaded_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  semester INTEGER NOT NULL CHECK (semester BETWEEN 1 AND 8),
  department TEXT NOT NULL,
  resource_type TEXT NOT NULL DEFAULT 'Notes' CHECK (resource_type IN ('Notes', 'PPT', 'LabManual', 'PYQ', 'Syllabus', 'ReferenceBook', 'Assignment')),
  file_url TEXT NOT NULL,
  file_name TEXT,
  file_size BIGINT DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  average_rating NUMERIC(3, 2) DEFAULT 0.00,
  ratings_count INTEGER DEFAULT 0,
  ratings JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_resources_filters ON public.resources(department, semester, resource_type);
CREATE INDEX IF NOT EXISTS idx_resources_downloads ON public.resources(download_count DESC);

-- 5. FORUM POSTS (Senior-Junior Discussions & Technical Q&A)
CREATE TABLE IF NOT EXISTS public.forum_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  author_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL DEFAULT 'General' CHECK (category IN ('Placements', 'Internships', 'Coding', 'Projects', 'Exams', 'General')),
  tags JSONB DEFAULT '[]'::jsonb,
  upvotes JSONB DEFAULT '[]'::jsonb,
  upvotes_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  best_answer_id UUID,
  status TEXT DEFAULT 'Open' CHECK (status IN ('Open', 'Resolved', 'Closed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_forum_posts_category ON public.forum_posts(category);
CREATE INDEX IF NOT EXISTS idx_forum_posts_created ON public.forum_posts(created_at DESC);

-- 6. FORUM COMMENTS & REPLIES
CREATE TABLE IF NOT EXISTS public.forum_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  author_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_comment_id UUID REFERENCES public.forum_comments(id) ON DELETE CASCADE,
  upvotes JSONB DEFAULT '[]'::jsonb,
  upvotes_count INTEGER DEFAULT 0,
  is_best_answer BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_forum_comments_post ON public.forum_comments(post_id);

-- Foreign key for best answer in forum_posts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_forum_posts_best_answer'
  ) THEN
    ALTER TABLE public.forum_posts
      ADD CONSTRAINT fk_forum_posts_best_answer
      FOREIGN KEY (best_answer_id) REFERENCES public.forum_comments(id)
      ON DELETE SET NULL;
  END IF;
END $$;

-- 7. NOTICES & ACADEMIC CIRCULARS
CREATE TABLE IF NOT EXISTS public.notices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Department' CHECK (category IN ('Exams', 'Placements', 'Department', 'Workshops', 'Clubs', 'Holidays')),
  target_audience TEXT DEFAULT 'All' CHECK (target_audience IN ('All', 'Students', 'Faculty', 'FinalYear')),
  department TEXT DEFAULT 'All',
  pinned BOOLEAN DEFAULT FALSE,
  attachment_url TEXT,
  attachment_name TEXT,
  author_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notices_pinned ON public.notices(pinned DESC, created_at DESC);

-- 8. PLACEMENT DRIVES & ALUMNI EXPERIENCES
CREATE TABLE IF NOT EXISTS public.placements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  logo_url TEXT,
  roles JSONB DEFAULT '[]'::jsonb,
  ctc TEXT NOT NULL,
  min_cgpa NUMERIC(3, 2) DEFAULT 0.00,
  eligible_branches JSONB DEFAULT '[]'::jsonb,
  deadline TIMESTAMPTZ,
  status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Upcoming', 'Closed')),
  apply_url TEXT,
  interview_experiences JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_placements_status ON public.placements(status);

-- 9. SIMULATION MODULE RUN RECORDS
CREATE TABLE IF NOT EXISTS public.simulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  views INTEGER DEFAULT 0,
  runs INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- Row Level Security (RLS) Configuration
-- ==============================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.placements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulations ENABLE ROW LEVEL SECURITY;

-- Read policies: public reads for academic resources
CREATE POLICY "Allow public read access to users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Allow public read access to subjects" ON public.subjects FOR SELECT USING (true);
CREATE POLICY "Allow public read access to resources" ON public.resources FOR SELECT USING (true);
CREATE POLICY "Allow public read access to forum_posts" ON public.forum_posts FOR SELECT USING (true);
CREATE POLICY "Allow public read access to forum_comments" ON public.forum_comments FOR SELECT USING (true);
CREATE POLICY "Allow public read access to notices" ON public.notices FOR SELECT USING (true);
CREATE POLICY "Allow public read access to placements" ON public.placements FOR SELECT USING (true);
CREATE POLICY "Allow public read access to simulations" ON public.simulations FOR SELECT USING (true);

-- Authenticated modifications (service role or authenticated users)
CREATE POLICY "Allow auth users update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Allow auth users insert resources" ON public.resources FOR INSERT WITH CHECK (auth.uid() = uploaded_by);
CREATE POLICY "Allow auth users insert forum posts" ON public.forum_posts FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Allow auth users insert comments" ON public.forum_comments FOR INSERT WITH CHECK (auth.uid() = author_id);

-- ==============================================================================
-- Google OAuth Domain Guard Trigger for @pccoer.in
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  allowed_domain text := 'pccoer.in';
  user_email text;
BEGIN
  user_email := lower(new.email);

  -- Reject any non-pccoer.in domain signups
  IF NOT (user_email LIKE '%@' || allowed_domain) THEN
    RAISE EXCEPTION 'Access denied. Only @% accounts are permitted.', allowed_domain;
  END IF;

  -- Create public user profile row
  INSERT INTO public.users (id, name, email, role, department, semester, profile_pic_url)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    user_email,
    'Student',
    'Computer Engineering',
    1,
    COALESCE(new.raw_user_meta_data->>'avatar_url', 'https://api.dicebear.com/7.x/avataaars/svg?seed=' || encode(new.id::text::bytea, 'base64'))
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users (Supabase managed auth table)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- Initial Seed Dataset (PCCOE Engineering Courses & Resources)
-- ==============================================================================

-- 1. Demo Users
INSERT INTO public.users (id, name, email, role, department, semester, bio, profile_pic_url)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'Aarav Patel', 'aarav.patel@pccoer.in', 'Student', 'Computer Engineering', 6, 'Full Stack Developer & Competitive Programmer at PCCOE.', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80'),
  ('00000000-0000-0000-0000-000000000002', 'Prof. Rajesh Sharma', 'prof.sharma@pccoer.in', 'Faculty', 'Computer Engineering', 1, 'Professor of Computer Engineering & Systems at PCCOE.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'),
  ('00000000-0000-0000-0000-000000000003', 'Dr. Alok Verma', 'admin@pccoer.in', 'Admin', 'Administration', 1, 'Dean of Academic Computing & Administration at PCCOE.', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80')
ON CONFLICT (id) DO NOTHING;

-- 2. Subjects
INSERT INTO public.subjects (id, title, code, semester, department, description, credits)
VALUES
  ('10000000-0000-0000-0000-000000000001', 'Data Structures & Algorithms', 'CS301', 3, 'Computer Engineering', 'Linear & non-linear structures, algorithmic complexity, tree and graph traversals.', 4),
  ('10000000-0000-0000-0000-000000000002', 'Operating Systems', 'CS402', 4, 'Computer Engineering', 'Process management, concurrency, CPU scheduling, memory management and file systems.', 4),
  ('10000000-0000-0000-0000-000000000003', 'Database Management Systems', 'CS403', 4, 'Computer Engineering', 'Relational algebra, SQL, normalization, transaction processing, indexing and ACID.', 3),
  ('10000000-0000-0000-0000-000000000004', 'Computer Networks', 'CS501', 5, 'Computer Engineering', 'OSI model, TCP/IP, IP addressing, CIDR subnetting, routing protocols and socket programming.', 3),
  ('10000000-0000-0000-0000-000000000005', 'Digital Electronics & Logic Design', 'CS201', 2, 'Computer Engineering', 'Boolean algebra, logic gates, combinational circuits, sequential circuits and flip-flops.', 3)
ON CONFLICT (id) DO NOTHING;

-- 3. Resources
INSERT INTO public.resources (id, title, description, subject_id, uploaded_by, semester, department, resource_type, file_url, download_count, average_rating, ratings_count)
VALUES
  ('20000000-0000-0000-0000-000000000001', 'DSA Complete Handwritten Lecture Notes (Units 1-6)', 'Comprehensive handwritten notes covering arrays, stacks, queues, trees, and dynamic programming.', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 3, 'Computer Engineering', 'Notes', 'https://example.com/dsa-notes.pdf', 342, 4.9, 28),
  ('20000000-0000-0000-0000-000000000002', 'Operating Systems Solved Previous Year Question Papers (2020-2025)', 'Solved university exam questions covering CPU scheduling, Banker algorithm, and page replacement.', '10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 4, 'Computer Engineering', 'PYQ', 'https://example.com/os-pyq.pdf', 521, 4.8, 42),
  ('20000000-0000-0000-0000-000000000003', 'Database Management Systems Laboratory Manual (MySQL & MongoDB)', 'Official laboratory manual with 10 practical experiments and complete query solutions.', '10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002', 4, 'Computer Engineering', 'LabManual', 'https://example.com/dbms-lab.pdf', 189, 4.7, 19),
  ('20000000-0000-0000-0000-000000000004', 'Computer Networks Subnetting & CIDR Quick Reference Guide', 'Cheat sheet for calculating network addresses, broadcast addresses, and usable IP ranges.', '10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000002', 5, 'Computer Engineering', 'Notes', 'https://example.com/cn-cidr.pdf', 276, 5.0, 31)
ON CONFLICT (id) DO NOTHING;

-- 4. Discussion Forum Posts
INSERT INTO public.forum_posts (id, title, body, author_id, category, tags, upvotes_count, comments_count, views_count, status)
VALUES
  ('30000000-0000-0000-0000-000000000001', 'How to prepare for Microsoft IDC On-Campus SDE Drive?', 'Microsoft is visiting next month for 4th year and 3rd year interns. What topics in DSA and OS should we focus heavily on?', '00000000-0000-0000-0000-000000000001', 'Placements', '["Microsoft", "Interview", "DSA"]'::jsonb, 18, 3, 240, 'Resolved'),
  ('30000000-0000-0000-0000-000000000002', 'Quick trick to remember CPU Scheduling Turnaround and Waiting times?', 'Always confusing TAT = CT - AT and WT = TAT - BT during exam numericals. Any easy visual method?', '00000000-0000-0000-0000-000000000001', 'Exams', '["OS", "Scheduling", "Semester4"]'::jsonb, 9, 2, 115, 'Open')
ON CONFLICT (id) DO NOTHING;

-- 5. Notices
INSERT INTO public.notices (id, title, content, category, target_audience, department, pinned, author_id)
VALUES
  ('40000000-0000-0000-0000-000000000001', 'Mid-Semester Examination Schedule — Even Semester 2026', 'The In-Sem assessments will commence from November 10th. Timetables have been uploaded to each department notice board.', 'Exams', 'Students', 'All', true, '00000000-0000-0000-0000-000000000003'),
  ('40000000-0000-0000-0000-000000000002', 'Microsoft & Barclays Campus Placement Drives Commencing', 'Eligible students with CGPA >= 7.5 are requested to register on the T&P portal before October 25th.', 'Placements', 'Students', 'Computer Engineering', true, '00000000-0000-0000-0000-000000000003')
ON CONFLICT (id) DO NOTHING;

-- 6. Placements
INSERT INTO public.placements (id, company_name, logo_url, roles, ctc, min_cgpa, eligible_branches, deadline, status, apply_url)
VALUES
  ('50000000-0000-0000-0000-000000000001', 'Microsoft IDC', 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg', '["Software Engineer", "Cloud Engineer"]'::jsonb, '18-44 LPA', 7.50, '["Computer Engineering", "Information Technology", "AI & Data Science"]'::jsonb, NOW() + INTERVAL '20 days', 'Active', 'https://careers.microsoft.com'),
  ('50000000-0000-0000-0000-000000000002', 'Barclays Global', 'https://upload.wikimedia.org/wikipedia/en/thumb/7/7b/Barclays_logo.svg/320px-Barclays_logo.svg.png', '["Technology Analyst", "Graduate Engineer Trainee"]'::jsonb, '12-16 LPA', 7.00, '["Computer Engineering", "Information Technology", "Electronics & Telecommunication"]'::jsonb, NOW() + INTERVAL '14 days', 'Active', 'https://barclays.com/careers')
ON CONFLICT (id) DO NOTHING;

-- 7. Simulations
INSERT INTO public.simulations (id, slug, title, category, description, views, runs)
VALUES
  ('60000000-0000-0000-0000-000000000001', 'sorting-algorithms', 'DSA Sorting Visualizer', 'Data Structures', 'Interactive step-by-step sorting algorithms with comparison and swap metrics.', 1420, 890),
  ('60000000-0000-0000-0000-000000000002', 'cpu-scheduling', 'OS CPU Scheduling Simulator', 'Operating Systems', 'Real-time Gantt timeline for FCFS, SJF, Round Robin and Priority scheduling.', 1830, 1120),
  ('60000000-0000-0000-0000-000000000003', 'logic-gates', 'Digital Logic Gates Simulator', 'Electronics', 'Interactive binary switches, truth tables and combinational half-adder circuit.', 960, 610),
  ('60000000-0000-0000-0000-000000000004', 'packet-routing', 'Network CIDR & Subnet Calculator', 'Networking', 'Calculate network address, broadcast address, wildcard mask, and usable host range.', 1150, 740)
ON CONFLICT (id) DO NOTHING;
