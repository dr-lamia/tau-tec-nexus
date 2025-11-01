-- Add total_sessions column to courses table
ALTER TABLE courses ADD COLUMN total_sessions integer DEFAULT 1 NOT NULL;
COMMENT ON COLUMN courses.total_sessions IS 'Total number of sessions planned for this course';

-- Create session_attendance table
CREATE TABLE session_attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES course_sessions(id) ON DELETE CASCADE NOT NULL,
  student_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  attended boolean DEFAULT false NOT NULL,
  marked_at timestamp with time zone DEFAULT now() NOT NULL,
  notes text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE(session_id, student_id)
);

CREATE INDEX idx_session_attendance_session ON session_attendance(session_id);
CREATE INDEX idx_session_attendance_student ON session_attendance(student_id);
CREATE INDEX idx_session_attendance_course ON session_attendance(course_id);

COMMENT ON TABLE session_attendance IS 'Tracks student attendance for each course session';

-- Enable RLS for session_attendance
ALTER TABLE session_attendance ENABLE ROW LEVEL SECURITY;

-- Instructors can manage attendance for their courses
CREATE POLICY "Instructors can manage attendance for their courses"
ON session_attendance FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM courses 
    WHERE courses.id = session_attendance.course_id 
    AND courses.instructor_id = auth.uid()
  )
);

-- Students can view their own attendance
CREATE POLICY "Students can view their own attendance"
ON session_attendance FOR SELECT
USING (auth.uid() = student_id);

-- Create automatic progress calculation trigger
CREATE OR REPLACE FUNCTION update_student_progress()
RETURNS TRIGGER AS $$
DECLARE
  total_sessions_count integer;
  attended_sessions_count integer;
  new_progress integer;
BEGIN
  -- Get total sessions for the course
  SELECT total_sessions INTO total_sessions_count
  FROM courses WHERE id = NEW.course_id;
  
  -- Count attended sessions for this student
  SELECT COUNT(*) INTO attended_sessions_count
  FROM session_attendance
  WHERE student_id = NEW.student_id
    AND course_id = NEW.course_id
    AND attended = true;
  
  -- Calculate progress percentage
  IF total_sessions_count > 0 THEN
    new_progress := ROUND((attended_sessions_count::numeric / total_sessions_count::numeric) * 100);
  ELSE
    new_progress := 0;
  END IF;
  
  -- Update enrollment progress
  UPDATE enrollments
  SET progress = new_progress
  WHERE student_id = NEW.student_id
    AND course_id = NEW.course_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_progress_on_attendance
AFTER INSERT OR UPDATE ON session_attendance
FOR EACH ROW
EXECUTE FUNCTION update_student_progress();

COMMENT ON FUNCTION update_student_progress() IS 'Automatically calculates and updates student progress based on attendance';