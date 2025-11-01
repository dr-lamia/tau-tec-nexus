-- Add session_id to course_materials to link materials to specific sessions
ALTER TABLE course_materials
ADD COLUMN session_id uuid REFERENCES course_sessions(id) ON DELETE CASCADE;

-- Add session_id to assignments to link assignments to specific sessions  
ALTER TABLE assignments
ADD COLUMN session_id uuid REFERENCES course_sessions(id) ON DELETE SET NULL;

-- Add index for better query performance
CREATE INDEX idx_course_materials_session_id ON course_materials(session_id);
CREATE INDEX idx_assignments_session_id ON assignments(session_id);