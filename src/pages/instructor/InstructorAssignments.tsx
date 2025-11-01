import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, FileText, Download, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface Assignment {
  id: string;
  title: string;
  description: string;
  due_date: string;
  course_id: string;
  courses: {
    title: string;
  };
  submissions: Submission[];
}

interface Submission {
  id: string;
  student_id: string;
  submitted_at: string;
  file_url: string;
  grade: number | null;
  feedback: string | null;
  profiles: {
    full_name: string;
    email: string;
  };
}

const InstructorAssignments = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [gradingSubmission, setGradingSubmission] = useState<string | null>(null);
  const [gradeValues, setGradeValues] = useState<{ [key: string]: { grade: string; feedback: string } }>({});

  useEffect(() => {
    if (user) {
      fetchAssignments();
    }
  }, [user]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);

      // First get instructor's courses
      const { data: coursesData } = await supabase
        .from("courses")
        .select("id")
        .eq("instructor_id", user?.id);

      if (!coursesData || coursesData.length === 0) {
        setAssignments([]);
        return;
      }

      const courseIds = coursesData.map(c => c.id);

      // Fetch assignments with submissions
      const { data: assignmentsData, error } = await supabase
        .from("assignments")
        .select(`
          *,
          courses(title)
        `)
        .in("course_id", courseIds)
        .order("due_date", { ascending: false });

      if (error) throw error;

      // Fetch submissions for each assignment
      const assignmentsWithSubmissions = await Promise.all(
        (assignmentsData || []).map(async (assignment) => {
          const { data: submissions } = await supabase
            .from("assignment_submissions")
            .select("*")
            .eq("assignment_id", assignment.id);

          // Get profiles for each submission
          const submissionsWithProfiles = await Promise.all(
            (submissions || []).map(async (sub) => {
              const { data: profile } = await supabase
                .from("profiles")
                .select("full_name, email")
                .eq("id", sub.student_id)
                .single();
              
              return {
                ...sub,
                profiles: profile || { full_name: "Unknown", email: "" }
              };
            })
          );

          return {
            ...assignment,
            submissions: submissionsWithProfiles
          };
        })
      );

      setAssignments(assignmentsWithSubmissions);
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

  const handleGradeSubmission = async (submissionId: string) => {
    const values = gradeValues[submissionId];
    if (!values || !values.grade) {
      toast({
        title: "Error",
        description: "Please enter a grade",
        variant: "destructive",
      });
      return;
    }

    const grade = parseInt(values.grade);
    if (isNaN(grade) || grade < 0 || grade > 100) {
      toast({
        title: "Error",
        description: "Grade must be between 0 and 100",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("assignment_submissions")
        .update({
          grade: grade,
          feedback: values.feedback || null,
        })
        .eq("id", submissionId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Assignment graded successfully",
      });

      // Refresh data
      fetchAssignments();
      setGradingSubmission(null);
      setGradeValues(prev => {
        const newValues = { ...prev };
        delete newValues[submissionId];
        return newValues;
      });
    } catch (error) {
      console.error("Error grading submission:", error);
      toast({
        title: "Error",
        description: "Failed to grade submission",
        variant: "destructive",
      });
    }
  };

  const pendingAssignments = assignments.map(a => ({
    ...a,
    submissions: a.submissions?.filter(s => s.grade === null) || []
  })).filter(a => a.submissions.length > 0);

  const gradedAssignments = assignments.map(a => ({
    ...a,
    submissions: a.submissions?.filter(s => s.grade !== null) || []
  })).filter(a => a.submissions.length > 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 max-w-6xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Assignment Submissions</h1>
          <p className="text-muted-foreground">
            Review and grade student submissions
          </p>
        </div>

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList>
            <TabsTrigger value="pending">
              Pending ({pendingAssignments.reduce((acc, a) => acc + a.submissions.length, 0)})
            </TabsTrigger>
            <TabsTrigger value="graded">
              Graded ({gradedAssignments.reduce((acc, a) => acc + a.submissions.length, 0)})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-6">
            {pendingAssignments.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">
                    No pending submissions to review
                  </p>
                </CardContent>
              </Card>
            ) : (
              pendingAssignments.map((assignment) => (
                <Card key={assignment.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{assignment.title}</CardTitle>
                        <CardDescription>
                          {assignment.courses.title} • Due: {new Date(assignment.due_date).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <Badge variant="outline">
                        {assignment.submissions.length} pending
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {assignment.submissions.map((submission) => (
                      <div key={submission.id} className="border rounded-lg p-4 space-y-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold">{submission.profiles.full_name}</h4>
                            <p className="text-sm text-muted-foreground">{submission.profiles.email}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              Submitted: {new Date(submission.submitted_at).toLocaleString()}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                          >
                            <a href={submission.file_url} target="_blank" rel="noopener noreferrer">
                              <Download className="h-4 w-4 mr-2" />
                              View Submission
                            </a>
                          </Button>
                        </div>

                        {gradingSubmission === submission.id ? (
                          <div className="space-y-4 pt-4 border-t">
                            <div>
                              <label className="text-sm font-medium mb-2 block">
                                Grade (0-100)
                              </label>
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                placeholder="Enter grade"
                                value={gradeValues[submission.id]?.grade || ""}
                                onChange={(e) => setGradeValues(prev => ({
                                  ...prev,
                                  [submission.id]: {
                                    ...prev[submission.id],
                                    grade: e.target.value
                                  }
                                }))}
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium mb-2 block">
                                Feedback (Optional)
                              </label>
                              <Textarea
                                placeholder="Enter feedback for the student"
                                value={gradeValues[submission.id]?.feedback || ""}
                                onChange={(e) => setGradeValues(prev => ({
                                  ...prev,
                                  [submission.id]: {
                                    ...prev[submission.id],
                                    feedback: e.target.value
                                  }
                                }))}
                                rows={3}
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button onClick={() => handleGradeSubmission(submission.id)}>
                                Submit Grade
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setGradingSubmission(null);
                                  setGradeValues(prev => {
                                    const newValues = { ...prev };
                                    delete newValues[submission.id];
                                    return newValues;
                                  });
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <Button
                            onClick={() => setGradingSubmission(submission.id)}
                            className="w-full"
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Grade This Submission
                          </Button>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="graded" className="space-y-6">
            {gradedAssignments.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">
                    No graded submissions yet
                  </p>
                </CardContent>
              </Card>
            ) : (
              gradedAssignments.map((assignment) => (
                <Card key={assignment.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{assignment.title}</CardTitle>
                        <CardDescription>
                          {assignment.courses.title} • Due: {new Date(assignment.due_date).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {assignment.submissions.length} graded
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {assignment.submissions.map((submission) => (
                      <div key={submission.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-semibold">{submission.profiles.full_name}</h4>
                            <p className="text-sm text-muted-foreground">{submission.profiles.email}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              Submitted: {new Date(submission.submitted_at).toLocaleString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-primary">{submission.grade}%</div>
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                              className="mt-2"
                            >
                              <a href={submission.file_url} target="_blank" rel="noopener noreferrer">
                                <Download className="h-4 w-4 mr-2" />
                                View
                              </a>
                            </Button>
                          </div>
                        </div>
                        {submission.feedback && (
                          <div className="mt-3 pt-3 border-t">
                            <p className="text-sm font-medium mb-1">Feedback:</p>
                            <p className="text-sm text-muted-foreground">{submission.feedback}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default InstructorAssignments;
