import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Calendar } from "lucide-react";
import { format } from "date-fns";

interface Session {
  id: string;
  title: string;
  session_date: string;
  duration_minutes: number;
  location?: string;
  zoom_link?: string;
}

interface SessionsTabProps {
  courseId: string;
}

export const SessionsTab = ({ courseId }: SessionsTabProps) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [newSession, setNewSession] = useState({
    title: "",
    session_date: "",
    duration_minutes: 60,
    location: "",
    zoom_link: "",
  });

  useEffect(() => {
    fetchSessions();
  }, [courseId]);

  const fetchSessions = async () => {
    try {
      const { data, error } = await supabase
        .from("course_sessions")
        .select("*")
        .eq("course_id", courseId)
        .order("session_date", { ascending: true });

      if (error) throw error;
      setSessions(data || []);
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

  const handleAddSession = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from("course_sessions").insert({
        course_id: courseId,
        ...newSession,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Session added successfully",
      });

      setNewSession({
        title: "",
        session_date: "",
        duration_minutes: 60,
        location: "",
        zoom_link: "",
      });
      fetchSessions();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from("course_sessions")
        .delete()
        .eq("id", sessionId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Session deleted successfully",
      });
      fetchSessions();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <p className="text-muted-foreground">Loading sessions...</p>;
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleAddSession} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="session-title">Session Title *</Label>
          <Input
            id="session-title"
            required
            value={newSession.title}
            onChange={(e) => setNewSession({ ...newSession, title: e.target.value })}
            placeholder="e.g., Introduction to React"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="session-date">Date & Time *</Label>
            <Input
              id="session-date"
              type="datetime-local"
              required
              value={newSession.session_date}
              onChange={(e) => setNewSession({ ...newSession, session_date: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Duration (minutes) *</Label>
            <Input
              id="duration"
              type="number"
              required
              min="15"
              value={newSession.duration_minutes}
              onChange={(e) => setNewSession({ ...newSession, duration_minutes: parseInt(e.target.value) })}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="location">Location (for offline)</Label>
            <Input
              id="location"
              value={newSession.location}
              onChange={(e) => setNewSession({ ...newSession, location: e.target.value })}
              placeholder="e.g., Room 101"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="zoom-link">Zoom Link (for online)</Label>
            <Input
              id="zoom-link"
              type="url"
              value={newSession.zoom_link}
              onChange={(e) => setNewSession({ ...newSession, zoom_link: e.target.value })}
              placeholder="https://zoom.us/j/..."
            />
          </div>
        </div>

        <Button type="submit">
          <Plus className="mr-2 h-4 w-4" />
          Add Session
        </Button>
      </form>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Scheduled Sessions</h3>
        {sessions.length === 0 ? (
          <p className="text-muted-foreground">No sessions scheduled yet</p>
        ) : (
          sessions.map((session) => (
            <Card key={session.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h4 className="font-semibold">{session.title}</h4>
                    <div className="flex items-center text-sm text-muted-foreground gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {format(new Date(session.session_date), "PPP 'at' p")} ({session.duration_minutes} min)
                      </span>
                    </div>
                    {session.location && (
                      <p className="text-sm text-muted-foreground">Location: {session.location}</p>
                    )}
                    {session.zoom_link && (
                      <a
                        href={session.zoom_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        Join Zoom Meeting
                      </a>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteSession(session.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
