import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { SessionsTab } from "@/components/course/SessionsTab";
import { MaterialsTab } from "@/components/course/MaterialsTab";
import { AssignmentsTab } from "@/components/course/AssignmentsTab";
import { EnrolledStudentsTab } from "@/components/course/EnrolledStudentsTab";

const EditCourse = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    category: string;
    delivery_mode: "online" | "offline" | "hybrid";
    duration_hours: number;
    price: number;
    thumbnail_url: string;
    status: string;
    total_sessions: number;
  }>({
    title: "",
    description: "",
    category: "",
    delivery_mode: "online",
    duration_hours: 0,
    price: 0,
    thumbnail_url: "",
    status: "draft",
    total_sessions: 1,
  });

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    try {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      if (data.instructor_id !== user?.id) {
        toast({
          title: "Access Denied",
          description: "You can only edit your own courses",
          variant: "destructive",
        });
        navigate("/dashboard");
        return;
      }

      setFormData(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load course",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase
        .from("courses")
        .update({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          delivery_mode: formData.delivery_mode,
          duration_hours: formData.duration_hours,
          price: formData.price,
          thumbnail_url: formData.thumbnail_url || null,
          total_sessions: formData.total_sessions,
        })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Course updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update course",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <p className="text-muted-foreground">Loading course...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <Tabs defaultValue="details" className="space-y-6">
          <TabsList>
            <TabsTrigger value="details">Course Details</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="materials">Materials</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="students">Enrolled Students</TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <Card className="gradient-card shadow-medium">
              <CardHeader>
                <CardTitle className="text-3xl">Edit Course</CardTitle>
                <CardDescription>
                  Update your course information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Course Title *</Label>
                    <Input
                      id="title"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      required
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Input
                        id="category"
                        required
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="delivery_mode">Delivery Mode *</Label>
                      <Select
                        value={formData.delivery_mode}
                        onValueChange={(value: "online" | "offline" | "hybrid") => setFormData({ ...formData, delivery_mode: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="online">Online</SelectItem>
                          <SelectItem value="offline">Offline</SelectItem>
                          <SelectItem value="hybrid">Hybrid</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="duration_hours">Duration (hours) *</Label>
                      <Input
                        id="duration_hours"
                        type="number"
                        required
                        min="1"
                        value={formData.duration_hours}
                        onChange={(e) => setFormData({ ...formData, duration_hours: parseInt(e.target.value) })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="price">Price ($) *</Label>
                      <Input
                        id="price"
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="total_sessions">Number of Sessions *</Label>
                    <Input
                      id="total_sessions"
                      type="number"
                      required
                      min="1"
                      value={formData.total_sessions}
                      onChange={(e) => setFormData({ ...formData, total_sessions: parseInt(e.target.value) || 1 })}
                    />
                    <p className="text-sm text-muted-foreground">
                      Used to calculate student progress based on attendance
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="thumbnail_url">Thumbnail URL</Label>
                    <Input
                      id="thumbnail_url"
                      type="url"
                      value={formData.thumbnail_url || ""}
                      onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button type="submit" disabled={saving}>
                      <Save className="mr-2 h-4 w-4" />
                      {saving ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate("/dashboard")}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sessions">
            <Card className="gradient-card shadow-medium">
              <CardHeader>
                <CardTitle>Course Sessions</CardTitle>
                <CardDescription>Manage sessions and schedule</CardDescription>
              </CardHeader>
              <CardContent>
                <SessionsTab courseId={id!} isInstructor={true} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="materials">
            <Card className="gradient-card shadow-medium">
              <CardHeader>
                <CardTitle>Course Materials</CardTitle>
                <CardDescription>Upload videos, PDFs, and other resources</CardDescription>
              </CardHeader>
              <CardContent>
                <MaterialsTab courseId={id!} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assignments">
            <Card className="gradient-card shadow-medium">
              <CardHeader>
                <CardTitle>Assignments</CardTitle>
                <CardDescription>Create and manage course assignments</CardDescription>
              </CardHeader>
              <CardContent>
                <AssignmentsTab courseId={id!} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="students">
            <Card className="gradient-card shadow-medium">
              <CardHeader>
                <CardTitle>Enrolled Students</CardTitle>
                <CardDescription>
                  View student enrollment, progress, and attendance tracking
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EnrolledStudentsTab courseId={id!} totalSessions={formData.total_sessions} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EditCourse;
