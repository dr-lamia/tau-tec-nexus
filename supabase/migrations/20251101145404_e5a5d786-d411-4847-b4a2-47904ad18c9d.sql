-- Add RLS policy to allow instructors to view enrollments for their courses
CREATE POLICY "Instructors can view enrollments for their courses"
ON enrollments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM courses
    WHERE courses.id = enrollments.course_id
    AND courses.instructor_id = auth.uid()
  )
);