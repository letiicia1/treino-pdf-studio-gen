-- Drop the existing overly permissive policies
DROP POLICY IF EXISTS "Students are viewable by everyone" ON public.students;
DROP POLICY IF EXISTS "Students can be inserted by everyone" ON public.students;
DROP POLICY IF EXISTS "Students can be updated by everyone" ON public.students;
DROP POLICY IF EXISTS "Students can be deleted by everyone" ON public.students;

DROP POLICY IF EXISTS "Student workouts are viewable by everyone" ON public.student_workouts;
DROP POLICY IF EXISTS "Student workouts can be inserted by everyone" ON public.student_workouts;
DROP POLICY IF EXISTS "Student workouts can be updated by everyone" ON public.student_workouts;
DROP POLICY IF EXISTS "Student workouts can be deleted by everyone" ON public.student_workouts;

-- Create secure RLS policies for students table
-- Only authenticated users can view students
CREATE POLICY "Authenticated users can view students" 
ON public.students 
FOR SELECT 
TO authenticated
USING (true);

-- Only authenticated users can create students
CREATE POLICY "Authenticated users can create students" 
ON public.students 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Only authenticated users can update students
CREATE POLICY "Authenticated users can update students" 
ON public.students 
FOR UPDATE 
TO authenticated
USING (true);

-- Only authenticated users can delete students
CREATE POLICY "Authenticated users can delete students" 
ON public.students 
FOR DELETE 
TO authenticated
USING (true);

-- Create secure RLS policies for student_workouts table
-- Only authenticated users can view student workouts
CREATE POLICY "Authenticated users can view student workouts" 
ON public.student_workouts 
FOR SELECT 
TO authenticated
USING (true);

-- Only authenticated users can create student workouts
CREATE POLICY "Authenticated users can create student workouts" 
ON public.student_workouts 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Only authenticated users can update student workouts
CREATE POLICY "Authenticated users can update student workouts" 
ON public.student_workouts 
FOR UPDATE 
TO authenticated
USING (true);

-- Only authenticated users can delete student workouts
CREATE POLICY "Authenticated users can delete student workouts" 
ON public.student_workouts 
FOR DELETE 
TO authenticated
USING (true);