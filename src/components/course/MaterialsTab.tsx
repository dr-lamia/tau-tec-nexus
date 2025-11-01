import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Upload, Trash2, FileText, ExternalLink } from "lucide-react";

interface Material {
  id: string;
  title: string;
  file_url: string;
  file_type: string;
  uploaded_at: string;
}

interface MaterialsTabProps {
  courseId: string;
}

export const MaterialsTab = ({ courseId }: MaterialsTabProps) => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const [newMaterial, setNewMaterial] = useState({
    title: "",
    file: null as File | null,
  });

  useEffect(() => {
    fetchMaterials();
  }, [courseId]);

  const fetchMaterials = async () => {
    try {
      const { data, error } = await supabase
        .from("course_materials")
        .select("*")
        .eq("course_id", courseId)
        .order("uploaded_at", { ascending: false });

      if (error) throw error;
      setMaterials(data || []);
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

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMaterial.file || !user) return;

    setUploading(true);
    try {
      const fileExt = newMaterial.file.name.split(".").pop();
      const fileName = `${user.id}/${courseId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("course-materials")
        .upload(fileName, newMaterial.file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("course-materials")
        .getPublicUrl(fileName);

      const { error: insertError } = await supabase
        .from("course_materials")
        .insert({
          course_id: courseId,
          title: newMaterial.title,
          file_url: publicUrl,
          file_type: newMaterial.file.type,
        });

      if (insertError) throw insertError;

      toast({
        title: "Success",
        description: "Material uploaded successfully",
      });

      setNewMaterial({ title: "", file: null });
      fetchMaterials();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteMaterial = async (materialId: string, fileUrl: string) => {
    try {
      const filePath = fileUrl.split("/course-materials/")[1];
      if (filePath) {
        await supabase.storage.from("course-materials").remove([filePath]);
      }

      const { error } = await supabase
        .from("course_materials")
        .delete()
        .eq("id", materialId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Material deleted successfully",
      });
      fetchMaterials();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <p className="text-muted-foreground">Loading materials...</p>;
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleFileUpload} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="material-title">Material Title *</Label>
          <Input
            id="material-title"
            required
            value={newMaterial.title}
            onChange={(e) => setNewMaterial({ ...newMaterial, title: e.target.value })}
            placeholder="e.g., Lecture Slides - Week 1"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="material-file">File *</Label>
          <Input
            id="material-file"
            type="file"
            required
            onChange={(e) => setNewMaterial({ ...newMaterial, file: e.target.files?.[0] || null })}
            accept=".pdf,.doc,.docx,.ppt,.pptx,.mp4,.mov,.avi"
          />
          <p className="text-sm text-muted-foreground">
            Supported: PDF, DOC, DOCX, PPT, PPTX, MP4, MOV, AVI
          </p>
        </div>

        <Button type="submit" disabled={uploading}>
          <Upload className="mr-2 h-4 w-4" />
          {uploading ? "Uploading..." : "Upload Material"}
        </Button>
      </form>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Course Materials</h3>
        {materials.length === 0 ? (
          <p className="text-muted-foreground">No materials uploaded yet</p>
        ) : (
          materials.map((material) => (
            <Card key={material.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="space-y-1">
                      <h4 className="font-semibold">{material.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        Uploaded: {new Date(material.uploaded_at).toLocaleDateString()}
                      </p>
                      <a
                        href={material.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline flex items-center gap-1"
                      >
                        View File <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteMaterial(material.id, material.file_url)}
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
