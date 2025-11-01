import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MessageSquare, ArrowLeft, Send } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Discussion {
  id: string;
  title: string;
  content: string;
  created_at: string;
  user: {
    full_name: string;
  };
  course: {
    title: string;
  };
}

const StudentDiscussions = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [newDiscussion, setNewDiscussion] = useState({ title: "", content: "", course_id: "" });
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
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

      // Fetch course details
      const { data: courses } = await supabase
        .from("courses")
        .select("id, title")
        .in("id", courseIds);

      setEnrolledCourses(courses || []);

      // Fetch discussions
      const { data: discussionsData, error: discussionsError } = await supabase
        .from("discussions")
        .select(`
          id,
          title,
          content,
          created_at,
          user_id,
          course_id
        `)
        .in("course_id", courseIds)
        .order("created_at", { ascending: false });

      if (discussionsError) throw discussionsError;

      // Fetch user and course details
      const discussionsWithDetails = await Promise.all(
        (discussionsData || []).map(async (discussion) => {
          const { data: user } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", discussion.user_id)
            .single();

          const { data: course } = await supabase
            .from("courses")
            .select("title")
            .eq("id", discussion.course_id)
            .single();

          return {
            ...discussion,
            user,
            course,
          };
        })
      );

      setDiscussions(discussionsWithDetails);
    } catch (error) {
      console.error("Error fetching discussions:", error);
      toast({
        title: "Error",
        description: "Failed to load discussions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDiscussion = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newDiscussion.title || !newDiscussion.content || !newDiscussion.course_id) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.from("discussions").insert({
        title: newDiscussion.title,
        content: newDiscussion.content,
        course_id: newDiscussion.course_id,
        user_id: user?.id,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Discussion posted successfully",
      });

      setNewDiscussion({ title: "", content: "", course_id: "" });
      fetchData();
    } catch (error) {
      console.error("Error creating discussion:", error);
      toast({
        title: "Error",
        description: "Failed to create discussion",
        variant: "destructive",
      });
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
              Course Discussions
            </h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Create New Discussion */}
        {enrolledCourses.length > 0 && (
          <Card className="gradient-card border shadow-medium mb-8">
            <CardHeader>
              <CardTitle>Start a Discussion</CardTitle>
              <CardDescription>Ask questions or share insights with your classmates</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateDiscussion} className="space-y-4">
                <div>
                  <Label htmlFor="course">Course</Label>
                  <select
                    id="course"
                    className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
                    value={newDiscussion.course_id}
                    onChange={(e) => setNewDiscussion({ ...newDiscussion, course_id: e.target.value })}
                    required
                  >
                    <option value="">Select a course</option>
                    {enrolledCourses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newDiscussion.title}
                    onChange={(e) => setNewDiscussion({ ...newDiscussion, title: e.target.value })}
                    placeholder="What's your question or topic?"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={newDiscussion.content}
                    onChange={(e) => setNewDiscussion({ ...newDiscussion, content: e.target.value })}
                    placeholder="Provide more details..."
                    rows={4}
                    required
                  />
                </div>
                <Button type="submit">
                  <Send className="mr-2 h-4 w-4" />
                  Post Discussion
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Discussions List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : discussions.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Discussions Yet</h3>
              <p className="text-muted-foreground text-center">
                Be the first to start a discussion in your course!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {discussions.map((discussion) => (
              <Card key={discussion.id} className="gradient-card border shadow-medium">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-1">{discussion.title}</CardTitle>
                      <CardDescription>
                        {discussion.course?.title} • Posted by {discussion.user?.full_name} •{" "}
                        {format(new Date(discussion.created_at), "PPp")}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{discussion.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDiscussions;
