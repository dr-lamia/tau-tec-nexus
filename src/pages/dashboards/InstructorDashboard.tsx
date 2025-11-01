import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Users, Calendar, BarChart, LogOut, Plus, Edit, Trash2, Eye, FileText, Clock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  delivery_mode: string;
  price: number;
  thumbnail_url: string | null;
}

interface Stats {
  totalCourses: number;
  totalStudents: number;
  upcomingSessions: number;
  pendingSubmissions: number;
}

const InstructorDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalCourses: 0,
    totalStudents: 0,
    upcomingSessions: 0,
    pendingSubmissions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("courses");

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Fetch instructor's courses
      const { data: coursesData, error: coursesError } = await supabase
        .from("courses")
        .select("*")
        .eq("instructor_id", user?.id)
        .order("created_at", { ascending: false });

      if (coursesError) throw coursesError;
      setCourses(coursesData || []);

      // Fetch total students across all courses
      let studentsCount = 0;
      if (coursesData && coursesData.length > 0) {
        const { count } = await supabase
          .from("enrollments")
          .select("*", { count: "exact", head: true })
          .in("course_id", coursesData.map(c => c.id));
        studentsCount = count || 0;
      }

      // Fetch upcoming sessions
      const { count: sessionsCount } = await supabase
        .from("course_sessions")
        .select("*", { count: "exact", head: true })
        .in("course_id", coursesData?.map(c => c.id) || [])
        .gte("session_date", new Date().toISOString());

      // Fetch pending submissions
      const { count: submissionsCount } = await supabase
        .from("assignment_submissions")
        .select("assignment_id, assignments!inner(course_id)", { count: "exact", head: true })
        .in("assignments.course_id", coursesData?.map(c => c.id) || [])
        .is("grade", null);

      setStats({
        totalCourses: coursesData?.length || 0,
        totalStudents: studentsCount || 0,
        upcomingSessions: sessionsCount || 0,
        pendingSubmissions: submissionsCount || 0,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm("Are you sure you want to delete this course?")) return;

    try {
      const { error } = await supabase
        .from("courses")
        .delete()
        .eq("id", courseId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Course deleted successfully",
      });
      fetchDashboardData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete course",
        variant: "destructive",
      });
    }
  };

  const handlePublishCourse = async (courseId: string, currentStatus: string) => {
    const newStatus = currentStatus === "published" ? "draft" : "published";
    
    try {
      const { error } = await supabase
        .from("courses")
        .update({ status: newStatus })
        .eq("id", courseId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Course ${newStatus === "published" ? "published" : "unpublished"} successfully`,
      });
      fetchDashboardData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update course status",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-background border-b shadow-soft">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-secondary">
              Instructor Dashboard
            </h1>
            <div className="flex items-center gap-3">
              <Button variant="hero" onClick={() => navigate("/instructor/courses/create")}>
                <Plus className="mr-2 h-4 w-4" />
                Create Course
              </Button>
              <Button variant="ghost" onClick={signOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <Card className="bg-gradient-to-r from-secondary to-accent text-white border-0 shadow-glow mb-8">
          <CardHeader>
            <CardTitle className="text-3xl text-white">Welcome, Instructor!</CardTitle>
            <CardDescription className="text-white/80 text-lg">
              Manage your courses and inspire students
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card 
            className="gradient-card border shadow-medium cursor-pointer hover:shadow-strong transition-all"
            onClick={() => setActiveTab("courses")}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                My Courses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-secondary">{stats.totalCourses}</div>
            </CardContent>
          </Card>

          <Card 
            className="gradient-card border shadow-medium cursor-pointer hover:shadow-strong transition-all"
            onClick={() => setActiveTab("courses")}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{stats.totalStudents}</div>
            </CardContent>
          </Card>

          <Card 
            className="gradient-card border shadow-medium cursor-pointer hover:shadow-strong transition-all"
            onClick={() => setActiveTab("sessions")}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Upcoming Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">{stats.upcomingSessions}</div>
            </CardContent>
          </Card>

          <Card 
            className="gradient-card border shadow-medium cursor-pointer hover:shadow-strong transition-all"
            onClick={() => setActiveTab("assignments")}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Reviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-secondary">{stats.pendingSubmissions}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
          </TabsList>

          <TabsContent value="courses">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading courses...</p>
              </div>
            ) : courses.length === 0 ? (
              <Card className="gradient-card border shadow-medium">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No courses yet</h3>
                  <p className="text-muted-foreground mb-4">Create your first course to get started</p>
                  <Button onClick={() => navigate("/instructor/courses/create")}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Course
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <Card key={course.id} className="gradient-card border shadow-medium hover:shadow-strong transition-all">
                    {course.thumbnail_url && (
                      <div className="h-40 overflow-hidden rounded-t-lg">
                        <img
                          src={course.thumbnail_url}
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant={course.status === "published" ? "default" : "secondary"}>
                          {course.status}
                        </Badge>
                        <Badge variant="outline">{course.delivery_mode}</Badge>
                      </div>
                      <CardTitle className="line-clamp-1">{course.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {course.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/courses/${course.id}`)}
                        >
                          <Eye className="mr-1 h-3 w-3" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/instructor/courses/edit/${course.id}`)}
                        >
                          <Edit className="mr-1 h-3 w-3" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePublishCourse(course.id, course.status)}
                        >
                          {course.status === "published" ? "Unpublish" : "Publish"}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteCourse(course.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="sessions">
            <Card className="gradient-card border shadow-medium">
              <CardHeader>
                <CardTitle>Upcoming Sessions</CardTitle>
                <CardDescription>Manage sessions for each course in the Edit Course page</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  To schedule and manage sessions, go to any course and click "Edit" to access the Sessions tab.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assignments">
            <Card className="gradient-card border shadow-medium">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Pending Submissions</CardTitle>
                    <CardDescription>Review and grade student assignments</CardDescription>
                  </div>
                  <Button onClick={() => navigate("/instructor/assignments")}>
                    <FileText className="mr-2 h-4 w-4" />
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{stats.pendingSubmissions} submissions awaiting review</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default InstructorDashboard;