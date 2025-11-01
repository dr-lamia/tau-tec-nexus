import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/home/Footer";
import { Clock, Users, MapPin, Video, BookOpen, ArrowLeft, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  delivery_mode: string;
  duration_hours: number;
  price: number;
  thumbnail_url: string | null;
  instructor: {
    id: string;
    full_name: string;
    email: string;
  };
}

interface Session {
  id: string;
  title: string;
  session_date: string;
  duration_minutes: number;
  location: string | null;
  zoom_link: string | null;
}

const CourseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, userRole } = useAuth();
  const { toast } = useToast();
  const [course, setCourse] = useState<Course | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    if (id) {
      fetchCourseDetails();
      fetchSessions();
      if (user) checkEnrollment();
    }
  }, [id, user]);

  const fetchCourseDetails = async () => {
    try {
      const { data, error } = await supabase
        .from("courses")
        .select(`
          *,
          instructor:profiles!instructor_id(id, full_name, email)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      setCourse(data);
    } catch (error) {
      console.error("Error fetching course:", error);
      toast({
        title: "Error",
        description: "Failed to load course details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSessions = async () => {
    try {
      const { data, error } = await supabase
        .from("course_sessions")
        .select("*")
        .eq("course_id", id)
        .order("session_date", { ascending: true });

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error("Error fetching sessions:", error);
    }
  };

  const checkEnrollment = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("enrollments")
        .select("id")
        .eq("course_id", id)
        .eq("student_id", user.id)
        .single();

      if (!error && data) {
        setIsEnrolled(true);
      }
    } catch (error) {
      // Not enrolled
    }
  };

  const handleEnroll = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    if (userRole !== "student") {
      toast({
        title: "Access Denied",
        description: "Only students can enroll in courses",
        variant: "destructive",
      });
      return;
    }

    setEnrolling(true);
    try {
      const { error } = await supabase
        .from("enrollments")
        .insert({
          course_id: id,
          student_id: user.id,
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "You have successfully enrolled in this course",
      });
      setIsEnrolled(true);
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to enroll in course",
        variant: "destructive",
      });
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30">
        <Navbar />
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-muted-foreground">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-muted/30">
        <Navbar />
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-muted-foreground">Course not found</p>
          <Button onClick={() => navigate("/courses")} className="mt-4">
            Browse Courses
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar />

      <div className="container mx-auto px-4 py-12">
        <Button
          variant="ghost"
          onClick={() => navigate("/courses")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Courses
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {course.thumbnail_url && (
              <div className="rounded-lg overflow-hidden mb-6 shadow-medium">
                <img
                  src={course.thumbnail_url}
                  alt={course.title}
                  className="w-full h-96 object-cover"
                />
              </div>
            )}

            <Card className="gradient-card shadow-medium mb-6">
              <CardHeader>
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="secondary">{course.category}</Badge>
                  <Badge variant={course.delivery_mode === "online" ? "default" : "outline"}>
                    {course.delivery_mode}
                  </Badge>
                </div>
                <CardTitle className="text-3xl">{course.title}</CardTitle>
                <CardDescription className="text-base">
                  Instructor: {course.instructor.full_name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-foreground leading-relaxed">{course.description}</p>
              </CardContent>
            </Card>

            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="sessions">Sessions</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview">
                <Card className="gradient-card shadow-medium">
                  <CardHeader>
                    <CardTitle>Course Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Duration</p>
                        <p className="text-sm text-muted-foreground">{course.duration_hours} hours</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {course.delivery_mode === "online" ? (
                        <Video className="h-5 w-5 text-primary" />
                      ) : (
                        <MapPin className="h-5 w-5 text-primary" />
                      )}
                      <div>
                        <p className="font-medium">Mode</p>
                        <p className="text-sm text-muted-foreground capitalize">{course.delivery_mode}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <BookOpen className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Category</p>
                        <p className="text-sm text-muted-foreground">{course.category}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="sessions">
                <Card className="gradient-card shadow-medium">
                  <CardHeader>
                    <CardTitle>Course Sessions</CardTitle>
                    <CardDescription>
                      {sessions.length} session{sessions.length !== 1 ? "s" : ""} scheduled
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {sessions.length === 0 ? (
                      <p className="text-muted-foreground">No sessions scheduled yet</p>
                    ) : (
                      <div className="space-y-4">
                        {sessions.map((session) => (
                          <div
                            key={session.id}
                            className="flex items-start gap-4 p-4 rounded-lg border bg-card"
                          >
                            <Calendar className="h-5 w-5 text-primary mt-1" />
                            <div className="flex-1">
                              <p className="font-medium">{session.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(session.session_date).toLocaleString()}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Duration: {session.duration_minutes} minutes
                              </p>
                              {session.location && (
                                <p className="text-sm text-muted-foreground">
                                  Location: {session.location}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="gradient-card shadow-medium sticky top-4">
              <CardHeader>
                <CardTitle className="text-3xl text-primary">
                  ${course.price}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEnrolled ? (
                  <>
                    <Badge className="w-full justify-center py-2" variant="secondary">
                      ✓ Enrolled
                    </Badge>
                    <Button
                      className="w-full"
                      onClick={() => navigate("/dashboard")}
                    >
                      Go to Dashboard
                    </Button>
                  </>
                ) : (
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleEnroll}
                    disabled={enrolling}
                  >
                    {enrolling ? "Enrolling..." : "Enroll Now"}
                  </Button>
                )}

                <div className="pt-4 border-t space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Instructor</span>
                    <span className="font-medium">{course.instructor.full_name}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-medium">{course.duration_hours}h</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Sessions</span>
                    <span className="font-medium">{sessions.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CourseDetail;
