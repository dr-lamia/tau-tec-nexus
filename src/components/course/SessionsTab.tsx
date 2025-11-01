import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Calendar, FileText, ClipboardList, Upload, Download } from "lucide-react";
import { format } from "date-fns";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";

interface Session {
  id: string;
  title: string;
  session_date: string;
  duration_minutes: number;
  location?: string;
  zoom_link?: string;
}

interface Material {
  id: string;
  title: string;
  file_url: string;
  file_type: string;
}

interface Assignment {
  id: string;
  title: string;
  description: string;
  due_date: string;
}

interface SessionsTabProps {
  courseId: string;
  isInstructor?: boolean;
}

export const SessionsTab = ({ courseId, isInstructor = false }: SessionsTabProps) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  const [newSession, setNewSession] = useState({
    title: "",
    session_date: "",
    duration_minutes: 60,
    location: "",
    zoom_link: "",
  });
  const [sessionMaterials, setSessionMaterials] = useState<Record<string, Material[]>>({});
  const [sessionAssignments, setSessionAssignments] = useState<Record<string, Assignment[]>>({});
  const [expandedSessions, setExpandedSessions] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchSessions();
  }, [courseId]);

  useEffect(() => {
    if (sessions.length > 0) {
      sessions.forEach(session => {
        fetchSessionMaterials(session.id);
        fetchSessionAssignments(session.id);
      });
    }
  }, [sessions]);

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

  const fetchSessionMaterials = async (sessionId: string) => {
    try {
      const { data, error } = await supabase
        .from("course_materials")
        .select("*")
        .eq("session_id", sessionId);

      if (error) throw error;
      setSessionMaterials(prev => ({ ...prev, [sessionId]: data || [] }));
    } catch (error: any) {
      console.error("Error fetching materials:", error);
    }
  };

  const fetchSessionAssignments = async (sessionId: string) => {
    try {
      const { data, error } = await supabase
        .from("assignments")
        .select("*")
        .eq("session_id", sessionId);

      if (error) throw error;
      setSessionAssignments(prev => ({ ...prev, [sessionId]: data || [] }));
    } catch (error: any) {
      console.error("Error fetching assignments:", error);
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

  const handleUploadMaterial = async (sessionId: string, file: File) => {
    try {
      if (!user) throw new Error("User not authenticated");

      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${courseId}/${sessionId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("course-materials")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("course-materials")
        .getPublicUrl(fileName);

      const { error: dbError } = await supabase
        .from("course_materials")
        .insert({
          course_id: courseId,
          session_id: sessionId,
          title: file.name,
          file_url: publicUrl,
          file_type: fileExt || "unknown",
        });

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "Material uploaded successfully",
      });
      fetchSessionMaterials(sessionId);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleAddAssignment = async (sessionId: string, title: string, description: string, dueDate: string) => {
    try {
      const { error } = await supabase
        .from("assignments")
        .insert({
          course_id: courseId,
          session_id: sessionId,
          title,
          description,
          due_date: dueDate,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Assignment added successfully",
      });
      fetchSessionAssignments(sessionId);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const toggleSession = (sessionId: string) => {
    setExpandedSessions(prev => ({ ...prev, [sessionId]: !prev[sessionId] }));
  };

  if (loading) {
    return <p className="text-muted-foreground">Loading sessions...</p>;
  }

  return (
    <div className="space-y-6">
      {isInstructor && (
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
      )}

      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Scheduled Sessions</h3>
        {sessions.length === 0 ? (
          <p className="text-muted-foreground">No sessions scheduled yet</p>
        ) : (
          sessions.map((session) => (
            <Collapsible
              key={session.id}
              open={expandedSessions[session.id]}
              onOpenChange={() => toggleSession(session.id)}
            >
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <CollapsibleTrigger className="flex-1 text-left">
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
                            onClick={(e) => e.stopPropagation()}
                          >
                            Join Zoom Meeting
                          </a>
                        )}
                      </div>
                    </CollapsibleTrigger>
                    {isInstructor && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteSession(session.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>

                  <CollapsibleContent className="mt-4 space-y-4">
                    {/* Materials Section */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h5 className="font-medium flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Materials
                        </h5>
                        {isInstructor && (
                          <label>
                            <input
                              type="file"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleUploadMaterial(session.id, file);
                              }}
                            />
                            <Button variant="outline" size="sm" asChild>
                              <span>
                                <Upload className="h-4 w-4 mr-2" />
                                Upload
                              </span>
                            </Button>
                          </label>
                        )}
                      </div>
                      {sessionMaterials[session.id]?.length > 0 ? (
                        <div className="space-y-2">
                          {sessionMaterials[session.id].map((material) => (
                            <div key={material.id} className="flex items-center justify-between p-2 border rounded">
                              <span className="text-sm">{material.title}</span>
                              <a href={material.file_url} target="_blank" rel="noopener noreferrer">
                                <Button variant="ghost" size="sm">
                                  <Download className="h-4 w-4" />
                                </Button>
                              </a>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No materials uploaded</p>
                      )}
                    </div>

                    {/* Assignments Section */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h5 className="font-medium flex items-center gap-2">
                          <ClipboardList className="h-4 w-4" />
                          Assignments
                        </h5>
                        {isInstructor && (
                          <AssignmentForm sessionId={session.id} onAdd={handleAddAssignment} />
                        )}
                      </div>
                      {sessionAssignments[session.id]?.length > 0 ? (
                        <div className="space-y-2">
                          {sessionAssignments[session.id].map((assignment) => (
                            <div key={assignment.id} className="p-3 border rounded space-y-1">
                              <p className="font-medium text-sm">{assignment.title}</p>
                              <p className="text-sm text-muted-foreground">{assignment.description}</p>
                              <p className="text-xs text-muted-foreground">
                                Due: {format(new Date(assignment.due_date), "PPP")}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No assignments added</p>
                      )}
                    </div>
                  </CollapsibleContent>
                </CardContent>
              </Card>
            </Collapsible>
          ))
        )}
      </div>
    </div>
  );
};

// Assignment Form Component
const AssignmentForm = ({ sessionId, onAdd }: { sessionId: string; onAdd: (sessionId: string, title: string, description: string, dueDate: string) => void }) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(sessionId, title, description, dueDate);
    setTitle("");
    setDescription("");
    setDueDate("");
    setOpen(false);
  };

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Assignment
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2">
        <form onSubmit={handleSubmit} className="space-y-3 p-3 border rounded">
          <Input
            placeholder="Assignment Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <Textarea
            placeholder="Assignment Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          <Input
            type="datetime-local"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
          />
          <Button type="submit" size="sm">Add</Button>
        </form>
      </CollapsibleContent>
    </Collapsible>
  );
};
