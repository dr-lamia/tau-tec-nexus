import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { CheckSquare, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface Student {
  id: string;
  full_name: string;
  email: string;
  attended: boolean;
  notes: string;
  attendanceId?: string;
}

interface SessionAttendanceDialogProps {
  sessionId: string;
  courseId: string;
  sessionTitle: string;
  sessionDate: string;
  onAttendanceMarked?: () => void;
}

export const SessionAttendanceDialog = ({
  sessionId,
  courseId,
  sessionTitle,
  sessionDate,
  onAttendanceMarked,
}: SessionAttendanceDialogProps) => {
  const [open, setOpen] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchEnrolledStudents();
    }
  }, [open, sessionId]);

  const fetchEnrolledStudents = async () => {
    setLoading(true);
    try {
      // Get all enrolled students
      const { data: enrollments, error: enrollError } = await supabase
        .from("enrollments")
        .select("student_id")
        .eq("course_id", courseId);

      if (enrollError) throw enrollError;

      // Fetch profiles and existing attendance
      const studentsData = await Promise.all(
        (enrollments || []).map(async (enrollment) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, email")
            .eq("id", enrollment.student_id)
            .single();

          const { data: attendance } = await supabase
            .from("session_attendance")
            .select("*")
            .eq("session_id", sessionId)
            .eq("student_id", enrollment.student_id)
            .maybeSingle();

          return {
            id: enrollment.student_id,
            full_name: profile?.full_name || "Unknown",
            email: profile?.email || "",
            attended: attendance?.attended || false,
            notes: attendance?.notes || "",
            attendanceId: attendance?.id,
          };
        })
      );

      setStudents(studentsData);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAttendanceChange = (studentId: string, attended: boolean) => {
    setStudents((prev) =>
      prev.map((student) =>
        student.id === studentId ? { ...student, attended } : student
      )
    );
  };

  const handleNotesChange = (studentId: string, notes: string) => {
    setStudents((prev) =>
      prev.map((student) =>
        student.id === studentId ? { ...student, notes } : student
      )
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Upsert attendance records for all students
      const attendanceRecords = students.map((student) => ({
        session_id: sessionId,
        student_id: student.id,
        course_id: courseId,
        attended: student.attended,
        notes: student.notes || null,
        marked_at: new Date().toISOString(),
      }));

      const { error } = await supabase
        .from("session_attendance")
        .upsert(attendanceRecords, {
          onConflict: "session_id,student_id",
        });

      if (error) throw error;

      const attendedCount = students.filter((s) => s.attended).length;
      toast({
        title: "Attendance Saved",
        description: `Marked ${attendedCount} of ${students.length} students as present`,
      });

      setOpen(false);
      onAttendanceMarked?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const attendedCount = students.filter((s) => s.attended).length;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <CheckSquare className="h-4 w-4 mr-2" />
          Take Attendance
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Take Attendance: {sessionTitle}</DialogTitle>
          <DialogDescription>
            {format(new Date(sessionDate), "PPP 'at' p")} • {attendedCount} / {students.length} present
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : students.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No enrolled students</p>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-sm font-medium">Student</span>
              <span className="text-sm font-medium">Present</span>
            </div>

            {students.map((student) => (
              <div key={student.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium">{student.full_name}</p>
                    <p className="text-sm text-muted-foreground">{student.email}</p>
                  </div>
                  <Checkbox
                    checked={student.attended}
                    onCheckedChange={(checked) =>
                      handleAttendanceChange(student.id, checked as boolean)
                    }
                  />
                </div>
                {student.attended && (
                  <div className="ml-4 space-y-1">
                    <Label htmlFor={`notes-${student.id}`} className="text-xs">
                      Notes (optional)
                    </Label>
                    <Textarea
                      id={`notes-${student.id}`}
                      value={student.notes}
                      onChange={(e) => handleNotesChange(student.id, e.target.value)}
                      placeholder="Add notes about this student's attendance..."
                      className="text-sm"
                      rows={2}
                    />
                  </div>
                )}
              </div>
            ))}

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Attendance"
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
