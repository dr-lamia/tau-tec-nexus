import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Download, Calendar, FileText, Video, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string | null;
  instructor: {
    full_name: string;
  };
}

interface Material {
  id: string;
  title: string;
  file_type: string;
  file_url: string;
  uploaded_at: string;
}

interface Session {
  id: string;
  title: string;
  session_date: string;
  duration_minutes: number;
  location: string | null;
  zoom_link: string | null;
}

interface Assignment {
  id: string;
  title: string;
  description: string;
  due_date: string;
  submission?: {
    id: string;
    file_url: string;
    submitted_at: string;
    grade: number | null;
    feedback: string | null;
  };
}

const StudentCourseView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [course, setCourse] = useState<Course | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id && user) {
      checkEnrollmentAndFetch();
    }
  }, [id, user]);

  const checkEnrollmentAndFetch = async () => {
    try {
      // Check enrollment
      const { data: enrollment, error: enrollError } = await supabase
        .from("enrollments")
        .select("progress")
        .eq("course_id", id)
        .eq("student_id", user?.id)
        .single();

      if (enrollError || !enrollment) {
        toast({
          title: "Access Denied",
          description: "You are not enrolled in this course",
          variant: "destructive",
        });
        navigate("/dashboard");
        return;
      }

      setProgress(enrollment.progress || 0);

      // Fetch course details
      const { data: courseData, error: courseError } = await supabase
        .from("courses")
        .select("id, title, description, thumbnail_url, instructor_id")
        .eq("id", id)
        .single();

      if (courseError) throw courseError;

      const { data: instructor } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", courseData.instructor_id)
        .single();

      setCourse({ ...courseData, instructor });

      // Fetch materials
      const { data: materialsData } = await supabase
        .from("course_materials")
        .select("*")
        .eq("course_id", id)
        .order("uploaded_at", { ascending: false });

      setMaterials(materialsData || []);

      // Fetch sessions
      const { data: sessionsData } = await supabase
        .from("course_sessions")
        .select("*")
        .eq("course_id", id)
        .order("session_date", { ascending: true });

      setSessions(sessionsData || []);

      // Fetch assignments with submissions
      const { data: assignmentsData } = await supabase
        .from("assignments")
        .select("*")
        .eq("course_id", id)
        .order("due_date", { ascending: true });

      // Fetch submissions for these assignments
      const assignmentIds = assignmentsData?.map(a => a.id) || [];
      const { data: submissions } = await supabase
        .from("assignment_submissions")
        .select("*")
        .in("assignment_id", assignmentIds)
        .eq("student_id", user?.id);

      const assignmentsWithSubmissions = assignmentsData?.map(assignment => ({
        ...assignment,
        submission: submissions?.find(s => s.assignment_id === assignment.id),
      }));

      setAssignments(assignmentsWithSubmissions || []);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to load course content",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <p className="text-muted-foreground">Loading course...</p>
      </div>
    );
  }

  if (!course) {
    return null;
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-background border-b shadow-soft">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Course Header */}
        <Card className="gradient-hero text-white border-0 shadow-glow mb-8">
          <CardHeader>
            <CardTitle className="text-3xl text-white">{course.title}</CardTitle>
            <CardDescription className="text-white/80 text-lg">
              Instructor: {course.instructor?.full_name}
            </CardDescription>
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-white/80">Your Progress</span>
                <span className="text-sm font-medium text-white">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardHeader>
        </Card>

        {/* Course Content */}
        <Tabs defaultValue="materials" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="materials">Materials</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
          </TabsList>

          <TabsContent value="materials">
            <Card className="gradient-card shadow-medium">
              <CardHeader>
                <CardTitle>Course Materials</CardTitle>
                <CardDescription>Download and access course resources</CardDescription>
              </CardHeader>
              <CardContent>
                {materials.length === 0 ? (
                  <p className="text-muted-foreground">No materials available yet</p>
                ) : (
                  <div className="space-y-3">
                    {materials.map((material) => (
                      <div
                        key={material.id}
                        className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium">{material.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {material.file_type} • {new Date(material.uploaded_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline" asChild>
                          <a href={material.file_url} target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sessions">
            <Card className="gradient-card shadow-medium">
              <CardHeader>
                <CardTitle>Course Sessions</CardTitle>
                <CardDescription>Scheduled sessions and meetings</CardDescription>
              </CardHeader>
              <CardContent>
                {sessions.length === 0 ? (
                  <p className="text-muted-foreground">No sessions scheduled yet</p>
                ) : (
                  <div className="space-y-4">
                    {sessions.map((session) => {
                      const isPast = new Date(session.session_date) < new Date();
                      return (
                        <div
                          key={session.id}
                          className="p-4 rounded-lg border bg-card"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <Calendar className="h-5 w-5 text-primary mt-1" />
                              <div>
                                <p className="font-medium">{session.title}</p>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(session.session_date).toLocaleString()}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Duration: {session.duration_minutes} minutes
                                </p>
                                {session.location && (
                                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                    <MapPin className="h-3 w-3" />
                                    {session.location}
                                  </p>
                                )}
                              </div>
                            </div>
                            {session.zoom_link && !isPast && (
                              <Button size="sm" asChild>
                                <a href={session.zoom_link} target="_blank" rel="noopener noreferrer">
                                  <Video className="h-4 w-4 mr-2" />
                                  Join
                                </a>
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assignments">
            <Card className="gradient-card shadow-medium">
              <CardHeader>
                <CardTitle>Assignments</CardTitle>
                <CardDescription>View and submit your assignments</CardDescription>
              </CardHeader>
              <CardContent>
                {assignments.length === 0 ? (
                  <p className="text-muted-foreground">No assignments yet</p>
                ) : (
                  <div className="space-y-4">
                    {assignments.map((assignment) => {
                      const isOverdue = new Date(assignment.due_date) < new Date();
                      const isSubmitted = !!assignment.submission;
                      return (
                        <div
                          key={assignment.id}
                          className="p-4 rounded-lg border bg-card"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <p className="font-medium">{assignment.title}</p>
                              <p className="text-sm text-muted-foreground mt-1">
                                {assignment.description}
                              </p>
                              <p className="text-sm text-muted-foreground mt-2">
                                Due: {new Date(assignment.due_date).toLocaleString()}
                              </p>
                            </div>
                            <Badge variant={isSubmitted ? "secondary" : isOverdue ? "destructive" : "default"}>
                              {isSubmitted ? "Submitted" : isOverdue ? "Overdue" : "Pending"}
                            </Badge>
                          </div>
                          {assignment.submission && (
                            <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                              <p className="text-sm font-medium mb-1">Your Submission</p>
                              <p className="text-sm text-muted-foreground">
                                Submitted: {new Date(assignment.submission.submitted_at).toLocaleString()}
                              </p>
                              {assignment.submission.grade !== null && (
                                <p className="text-sm text-muted-foreground">
                                  Grade: {assignment.submission.grade}%
                                </p>
                              )}
                              {assignment.submission.feedback && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  Feedback: {assignment.submission.feedback}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StudentCourseView;
