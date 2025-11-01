import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Video, Clock, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Session {
  id: string;
  title: string;
  session_date: string;
  duration_minutes: number;
  location: string | null;
  zoom_link: string | null;
  course: {
    title: string;
  };
}

const StudentSchedule = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSessions();
    }
  }, [user]);

  const fetchSessions = async () => {
    try {
      // Get enrolled course IDs
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

      // Fetch sessions for enrolled courses
      const { data: sessionsData, error: sessionsError } = await supabase
        .from("course_sessions")
        .select(`
          id,
          title,
          session_date,
          duration_minutes,
          location,
          zoom_link,
          course_id
        `)
        .in("course_id", courseIds)
        .gte("session_date", new Date().toISOString())
        .order("session_date", { ascending: true });

      if (sessionsError) throw sessionsError;

      // Fetch course titles
      const sessionsWithCourses = await Promise.all(
        (sessionsData || []).map(async (session) => {
          const { data: course } = await supabase
            .from("courses")
            .select("title")
            .eq("id", session.course_id)
            .single();

          return {
            ...session,
            course,
          };
        })
      );

      setSessions(sessionsWithCourses);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      toast({
        title: "Error",
        description: "Failed to load schedule",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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
              My Schedule
            </h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : sessions.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Upcoming Sessions</h3>
              <p className="text-muted-foreground text-center mb-6">
                You don't have any scheduled sessions yet.
              </p>
              <Button onClick={() => navigate("/courses")}>Browse Courses</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <Card key={session.id} className="gradient-card border shadow-medium">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{session.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{session.course?.title}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span>{format(new Date(session.session_date), "PPP")}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-primary" />
                      <span>
                        {format(new Date(session.session_date), "p")} ({session.duration_minutes} min)
                      </span>
                    </div>
                    {session.location && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-secondary" />
                        <span>{session.location}</span>
                      </div>
                    )}
                    {session.zoom_link && (
                      <div className="flex items-center gap-2">
                        <Video className="h-4 w-4 text-accent" />
                        <a
                          href={session.zoom_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-accent hover:underline"
                        >
                          Join Zoom Meeting
                        </a>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentSchedule;
