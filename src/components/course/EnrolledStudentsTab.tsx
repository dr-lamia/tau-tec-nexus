import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Users, Calendar, TrendingUp } from "lucide-react";
import { format } from "date-fns";

interface EnrolledStudent {
  id: string;
  student_id: string;
  enrolled_at: string;
  progress: number;
  full_name: string;
  email: string;
  avatar_url?: string;
  attended_sessions: number;
}

interface EnrolledStudentsTabProps {
  courseId: string;
  totalSessions: number;
}

export const EnrolledStudentsTab = ({ courseId, totalSessions }: EnrolledStudentsTabProps) => {
  const [students, setStudents] = useState<EnrolledStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchEnrolledStudents();
  }, [courseId]);

  const fetchEnrolledStudents = async () => {
    try {
      // Fetch enrollments with profile data
      const { data: enrollments, error: enrollError } = await supabase
        .from("enrollments")
        .select(`
          id,
          student_id,
          enrolled_at,
          progress
        `)
        .eq("course_id", courseId)
        .order("enrolled_at", { ascending: false });

      if (enrollError) throw enrollError;

      // Fetch profile data for each student
      const studentsWithProfiles = await Promise.all(
        (enrollments || []).map(async (enrollment) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, email, avatar_url")
            .eq("id", enrollment.student_id)
            .single();

          // Count attended sessions
          const { count } = await supabase
            .from("session_attendance")
            .select("*", { count: "exact", head: true })
            .eq("student_id", enrollment.student_id)
            .eq("course_id", courseId)
            .eq("attended", true);

          return {
            ...enrollment,
            full_name: profile?.full_name || "Unknown",
            email: profile?.email || "",
            avatar_url: profile?.avatar_url,
            attended_sessions: count || 0,
          };
        })
      );

      setStudents(studentsWithProfiles);
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

  if (loading) {
    return <p className="text-muted-foreground">Loading students...</p>;
  }

  if (students.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No students enrolled yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {students.map((student) => (
          <Card key={student.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-3">
                <div>
                  <h4 className="font-semibold">{student.full_name}</h4>
                  <p className="text-sm text-muted-foreground">{student.email}</p>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Enrolled: {format(new Date(student.enrolled_at), "PP")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Attendance: {student.attended_sessions} / {totalSessions} sessions
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{student.progress}%</span>
                  </div>
                  <Progress value={student.progress} className="h-2" />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
