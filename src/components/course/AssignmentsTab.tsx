import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, ClipboardList } from "lucide-react";
import { format } from "date-fns";

interface Assignment {
  id: string;
  title: string;
  description?: string;
  due_date?: string;
  created_at: string;
}

interface AssignmentsTabProps {
  courseId: string;
}

export const AssignmentsTab = ({ courseId }: AssignmentsTabProps) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [newAssignment, setNewAssignment] = useState({
    title: "",
    description: "",
    due_date: "",
  });

  useEffect(() => {
    fetchAssignments();
  }, [courseId]);

  const fetchAssignments = async () => {
    try {
      const { data, error } = await supabase
        .from("assignments")
        .select("*")
        .eq("course_id", courseId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAssignments(data || []);
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

  const handleAddAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from("assignments").insert({
        course_id: courseId,
        title: newAssignment.title,
        description: newAssignment.description || null,
        due_date: newAssignment.due_date || null,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Assignment created successfully",
      });

      setNewAssignment({
        title: "",
        description: "",
        due_date: "",
      });
      fetchAssignments();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    try {
      const { error } = await supabase
        .from("assignments")
        .delete()
        .eq("id", assignmentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Assignment deleted successfully",
      });
      fetchAssignments();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <p className="text-muted-foreground">Loading assignments...</p>;
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleAddAssignment} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="assignment-title">Assignment Title *</Label>
          <Input
            id="assignment-title"
            required
            value={newAssignment.title}
            onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
            placeholder="e.g., Build a React Component"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="assignment-description">Description</Label>
          <Textarea
            id="assignment-description"
            value={newAssignment.description}
            onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
            placeholder="Describe the assignment requirements..."
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="due-date">Due Date</Label>
          <Input
            id="due-date"
            type="datetime-local"
            value={newAssignment.due_date}
            onChange={(e) => setNewAssignment({ ...newAssignment, due_date: e.target.value })}
          />
        </div>

        <Button type="submit">
          <Plus className="mr-2 h-4 w-4" />
          Create Assignment
        </Button>
      </form>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Course Assignments</h3>
        {assignments.length === 0 ? (
          <p className="text-muted-foreground">No assignments created yet</p>
        ) : (
          assignments.map((assignment) => (
            <Card key={assignment.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <ClipboardList className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="space-y-1">
                      <h4 className="font-semibold">{assignment.title}</h4>
                      {assignment.description && (
                        <p className="text-sm text-muted-foreground">{assignment.description}</p>
                      )}
                      {assignment.due_date && (
                        <p className="text-sm text-muted-foreground">
                          Due: {format(new Date(assignment.due_date), "PPP 'at' p")}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteAssignment(assignment.id)}
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
