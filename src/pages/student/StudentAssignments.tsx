import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { FileText, ArrowLeft, Upload, CheckCircle, Clock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Assignment {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  course: {
    title: string;
  };
  submission?: {
    id: string;
    submitted_at: string;
    grade: number | null;
    feedback: string | null;
  };
}

const StudentAssignments = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchAssignments();
    }
  }, [user]);

  const fetchAssignments = async () => {
    try {
      // Get enrolled courses
      const { data: enrollments, error: enrollError } = await supabase
        .from("enrollments")
        .select("course_id")
        .eq("student_id", user?.id);

      if (enrollError) throw enrollError;

      const courseIds = enrollments?.map(e => e.course_id) || [];

      if (courseIds.length === 0) {
        setLoading(false);
        return;
      }

      // Fetch assignments
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from("assignments")
        .select(`
          id,
          title,
          description,
          due_date,
          course_id
        `)
        .in("course_id", courseIds)
        .order("due_date", { ascending: true });

      if (assignmentsError) throw assignmentsError;

      // Fetch submissions
      const { data: submissions } = await supabase
        .from("assignment_submissions")
        .select("*")
        .eq("student_id", user?.id);

      // Fetch course details and merge with submissions
      const assignmentsWithDetails = await Promise.all(
        (assignmentsData || []).map(async (assignment) => {
          const { data: course } = await supabase
            .from("courses")
            .select("title")
            .eq("id", assignment.course_id)
            .single();

          const submission = submissions?.find(s => s.assignment_id === assignment.id);

          return {
            ...assignment,
            course,
            submission,
          };
        })
      );

      setAssignments(assignmentsWithDetails);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      toast({
        title: "Error",
        description: "Failed to load assignments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (assignmentId: string, file: File) => {
    setUploadingFor(assignmentId);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user?.id}/${assignmentId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("course-materials")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("course-materials")
        .getPublicUrl(fileName);

      const { error: submitError } = await supabase
        .from("assignment_submissions")
        .insert({
          assignment_id: assignmentId,
          student_id: user?.id,
          file_url: publicUrl,
        });

      if (submitError) throw submitError;

      toast({
        title: "Success",
        description: "Assignment submitted successfully",
      });

      fetchAssignments();
    } catch (error) {
      console.error("Error submitting assignment:", error);
      toast({
        title: "Error",
        description: "Failed to submit assignment",
        variant: "destructive",
      });
    } finally {
      setUploadingFor(null);
    }
  };

  const getStatus = (assignment: Assignment) => {
    if (assignment.submission) {
      if (assignment.submission.grade !== null) {
        return { label: "Graded", variant: "default" as const, icon: CheckCircle };
      }
      return { label: "Submitted", variant: "secondary" as const, icon: CheckCircle };
    }
    return { label: "Pending", variant: "destructive" as const, icon: Clock };
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-background border-b shadow-soft">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              My Assignments
            </h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : assignments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Assignments</h3>
              <p className="text-muted-foreground text-center mb-6">
                You don't have any assignments yet.
              </p>
              <Button onClick={() => navigate("/courses")}>Browse Courses</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {assignments.map((assignment) => {
              const status = getStatus(assignment);
              const StatusIcon = status.icon;

              return (
                <Card key={assignment.id} className="gradient-card border shadow-medium">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-xl">{assignment.title}</CardTitle>
                          <Badge variant={status.variant}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {status.label}
                          </Badge>
                        </div>
                        <CardDescription>{assignment.course?.title}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {assignment.description && (
                      <p className="text-sm">{assignment.description}</p>
                    )}
                    
                    {assignment.due_date && (
                      <p className="text-sm text-muted-foreground">
                        <strong>Due:</strong> {format(new Date(assignment.due_date), "PPp")}
                      </p>
                    )}

                    {assignment.submission ? (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          Submitted on {format(new Date(assignment.submission.submitted_at), "PPp")}
                        </p>
                        {assignment.submission.grade !== null && (
                          <p className="text-sm font-medium">
                            Grade: {assignment.submission.grade}%
                          </p>
                        )}
                        {assignment.submission.feedback && (
                          <div className="bg-muted p-3 rounded-md">
                            <p className="text-sm font-medium mb-1">Instructor Feedback:</p>
                            <p className="text-sm">{assignment.submission.feedback}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div>
                        <Label htmlFor={`file-${assignment.id}`}>Upload Your Submission</Label>
                        <Input
                          id={`file-${assignment.id}`}
                          type="file"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(assignment.id, file);
                          }}
                          disabled={uploadingFor === assignment.id}
                          className="mt-1"
                        />
                        {uploadingFor === assignment.id && (
                          <p className="text-sm text-muted-foreground mt-2">Uploading...</p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentAssignments;
