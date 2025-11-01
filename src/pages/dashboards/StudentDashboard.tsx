import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Calendar, MessageSquare, FileText, LogOut, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface EnrolledCourse {
  id: string;
  course_id: string;
  progress: number;
  enrolled_at: string;
  course: {
    id: string;
    title: string;
    description: string;
    thumbnail_url: string | null;
    instructor: {
      full_name: string;
    };
  };
}

const StudentDashboard = () => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [stats, setStats] = useState({
    enrolled: 0,
    completed: 0,
    assignments: 0,
    avgProgress: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchEnrolledCourses();
    }
  }, [user]);

  const fetchEnrolledCourses = async () => {
    try {
      // Fetch enrollments with course and instructor details
      const { data: enrollments, error: enrollError } = await supabase
        .from("enrollments")
        .select(`
          id,
          course_id,
          progress,
          enrolled_at,
          completed_at
        `)
        .eq("student_id", user?.id);

      if (enrollError) throw enrollError;

      // Fetch course details for each enrollment
      const coursesWithDetails = await Promise.all(
        (enrollments || []).map(async (enrollment) => {
          const { data: course } = await supabase
            .from("courses")
            .select(`
              id,
              title,
              description,
              thumbnail_url,
              instructor_id
            `)
            .eq("id", enrollment.course_id)
            .single();

          const { data: instructor } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", course?.instructor_id)
            .single();

          return {
            ...enrollment,
            course: {
              ...course,
              instructor,
            },
          };
        })
      );

      setEnrolledCourses(coursesWithDetails);

      // Calculate stats
      const completed = enrollments?.filter(e => e.completed_at)?.length || 0;
      const totalProgress = enrollments?.reduce((sum, e) => sum + (e.progress || 0), 0) || 0;
      const avgProgress = enrollments?.length ? Math.round(totalProgress / enrollments.length) : 0;

      // Fetch pending assignments count
      const { data: assignments } = await supabase
        .from("assignments")
        .select("id, course_id")
        .in("course_id", enrollments?.map(e => e.course_id) || []);

      const { data: submissions } = await supabase
        .from("assignment_submissions")
        .select("assignment_id")
        .eq("student_id", user?.id);

      const submittedIds = new Set(submissions?.map(s => s.assignment_id) || []);
      const pendingAssignments = assignments?.filter(a => !submittedIds.has(a.id))?.length || 0;

      setStats({
        enrolled: enrollments?.length || 0,
        completed,
        assignments: pendingAssignments,
        avgProgress,
      });
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast({
        title: "Error",
        description: "Failed to load your courses",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-background border-b shadow-soft">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Student Dashboard
            </h1>
            <Button variant="ghost" onClick={signOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <Card className="gradient-hero text-white border-0 shadow-glow mb-8">
          <CardHeader>
            <CardTitle className="text-3xl text-white">Welcome back, Student!</CardTitle>
            <CardDescription className="text-white/80 text-lg">
              Ready to continue your learning journey?
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="gradient-card border shadow-medium">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Enrolled Courses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{stats.enrolled}</div>
            </CardContent>
          </Card>

          <Card className="gradient-card border shadow-medium">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-secondary">{stats.completed}</div>
            </CardContent>
          </Card>

          <Card className="gradient-card border shadow-medium">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Assignments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">{stats.assignments}</div>
            </CardContent>
          </Card>

          <Card className="gradient-card border shadow-medium">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{stats.avgProgress}%</div>
            </CardContent>
          </Card>
        </div>

        {/* Enrolled Courses */}
        {enrolledCourses.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6">My Courses</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses.map((enrollment) => (
                <Card
                  key={enrollment.id}
                  className="gradient-card border shadow-medium hover:shadow-strong transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                  onClick={() => navigate(`/student/course/${enrollment.course_id}`)}
                >
                  {enrollment.course.thumbnail_url && (
                    <img
                      src={enrollment.course.thumbnail_url}
                      alt={enrollment.course.title}
                      className="w-full h-40 object-cover rounded-t-lg"
                    />
                  )}
                  <CardHeader>
                    <CardTitle className="line-clamp-1">{enrollment.course.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {enrollment.course.description}
                    </CardDescription>
                    <p className="text-sm text-muted-foreground mt-2">
                      Instructor: {enrollment.course.instructor?.full_name}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{enrollment.progress || 0}%</span>
                      </div>
                      <Progress value={enrollment.progress || 0} />
                      <Button className="w-full mt-4" size="sm">
                        Continue Learning
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card 
            className="gradient-card border shadow-medium hover:shadow-strong transition-all duration-300 hover:-translate-y-1 cursor-pointer"
            onClick={() => navigate("/courses")}
          >
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Browse Courses</CardTitle>
              <CardDescription>Explore available courses</CardDescription>
            </CardHeader>
          </Card>

          <Card 
            className="gradient-card border shadow-medium hover:shadow-strong transition-all duration-300 hover:-translate-y-1 cursor-pointer"
            onClick={() => navigate("/student/schedule")}
          >
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-secondary" />
              </div>
              <CardTitle>Schedule</CardTitle>
              <CardDescription>View upcoming sessions</CardDescription>
            </CardHeader>
          </Card>

          <Card 
            className="gradient-card border shadow-medium hover:shadow-strong transition-all duration-300 hover:-translate-y-1 cursor-pointer"
            onClick={() => navigate("/student/discussions")}
          >
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <MessageSquare className="h-6 w-6 text-accent" />
              </div>
              <CardTitle>Discussions</CardTitle>
              <CardDescription>Join course forums</CardDescription>
            </CardHeader>
          </Card>

          <Card 
            className="gradient-card border shadow-medium hover:shadow-strong transition-all duration-300 hover:-translate-y-1 cursor-pointer"
            onClick={() => navigate("/student/assignments")}
          >
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Assignments</CardTitle>
              <CardDescription>Submit and track assignments</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;