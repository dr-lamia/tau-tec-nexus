import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/home/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { BrainCircuit, BarChart3, TrendingUp, Zap, Target, Shield, Upload, X } from "lucide-react";

const AIAnalytics = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration_weeks: "",
    delivery_mode: "",
    budget: "",
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setUploadedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Please sign in to submit a request");
      navigate("/auth");
      return;
    }

    setIsSubmitting(true);
    try {
      // Check if user has company role
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'company');

      // If user doesn't have company role, add it
      if (!roles || roles.length === 0) {
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({ user_id: user.id, role: 'company' });
        
        if (roleError) {
          toast.error("Unable to set up company account. Please contact support.");
          return;
        }
      }

      // Submit the request
      const { data: requestData, error } = await supabase
        .from("company_requests")
        .insert({
          company_id: user.id,
          title: formData.title,
          description: formData.description,
          project_type: "ai_data_analytics",
          duration_weeks: formData.duration_weeks ? parseInt(formData.duration_weeks) : null,
          delivery_mode: formData.delivery_mode as any,
          budget: formData.budget ? parseFloat(formData.budget) : null,
        })
        .select()
        .single();

      if (error) throw error;

      // Upload files if any
      if (uploadedFiles.length > 0 && requestData) {
        for (const file of uploadedFiles) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${user.id}/${requestData.id}/${Date.now()}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('company-data-files')
            .upload(fileName, file);

          if (uploadError) {
            console.error('File upload error:', uploadError);
            continue;
          }

          // Save file metadata
          await supabase.from('company_request_files').insert({
            request_id: requestData.id,
            file_name: file.name,
            file_path: fileName,
            file_size: file.size,
            mime_type: file.type,
            uploaded_by: user.id,
          });
        }
      }

      toast.success("Request submitted successfully! We'll contact you soon.");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Failed to submit request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const services = [
    {
      icon: BrainCircuit,
      title: "AI Solutions",
      description: "Custom AI models and machine learning solutions tailored to your business needs",
    },
    {
      icon: BarChart3,
      title: "Data Analytics",
      description: "Transform raw data into actionable insights with advanced analytics",
    },
    {
      icon: TrendingUp,
      title: "Predictive Analytics",
      description: "Forecast trends and make data-driven decisions with predictive models",
    },
    {
      icon: Zap,
      title: "Automation",
      description: "Automate repetitive tasks and optimize workflows with AI",
    },
    {
      icon: Target,
      title: "Business Intelligence",
      description: "Real-time dashboards and reporting for better decision-making",
    },
    {
      icon: Shield,
      title: "Data Security",
      description: "Enterprise-grade security and compliance for your data",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">AI & Data Analytics Solutions</h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Leverage cutting-edge AI and data analytics to transform your business and gain competitive advantage
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
              {services.map((service, index) => (
                <Card key={index} className="gradient-card">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-3">
                      <service.icon className="h-6 w-6 text-accent" />
                    </div>
                    <CardTitle className="text-lg">{service.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{service.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mb-16">
              <Card className="gradient-card">
                <CardHeader>
                  <CardTitle>Our Approach</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      1
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Discovery & Assessment</h3>
                      <p className="text-muted-foreground">We analyze your business needs and data infrastructure</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      2
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Strategy & Planning</h3>
                      <p className="text-muted-foreground">Develop a customized AI and analytics roadmap</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      3
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Implementation</h3>
                      <p className="text-muted-foreground">Deploy AI models and analytics solutions</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      4
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Optimization & Support</h3>
                      <p className="text-muted-foreground">Continuous monitoring and improvement of your systems</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="gradient-card">
              <CardHeader>
                <CardTitle>Request AI & Analytics Consultation</CardTitle>
                <CardDescription>
                  Tell us about your project and we'll help you leverage AI and data analytics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Project Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Customer Churn Prediction System"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Project Description *</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your AI/analytics needs, business challenges, and expected outcomes..."
                      rows={5}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="duration_weeks">Project Duration (weeks)</Label>
                      <Input
                        id="duration_weeks"
                        type="number"
                        placeholder="e.g., 12"
                        value={formData.duration_weeks}
                        onChange={(e) => setFormData({ ...formData, duration_weeks: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="delivery_mode">Service Type</Label>
                      <Select value={formData.delivery_mode} onValueChange={(value) => setFormData({ ...formData, delivery_mode: value })}>
                        <SelectTrigger id="delivery_mode">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="online">Remote</SelectItem>
                          <SelectItem value="offline">On-site</SelectItem>
                          <SelectItem value="hybrid">Hybrid</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="budget">Budget (USD)</Label>
                      <Input
                        id="budget"
                        type="number"
                        placeholder="e.g., 50000"
                        value={formData.budget}
                        onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="files">Upload Data Files (optional)</Label>
                    <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                      <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                      <Label htmlFor="files" className="cursor-pointer">
                        <span className="text-primary hover:underline">Click to upload</span>
                        <span className="text-muted-foreground"> or drag and drop</span>
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">CSV, Excel, JSON, PDF files accepted</p>
                      <Input
                        id="files"
                        type="file"
                        multiple
                        className="hidden"
                        onChange={handleFileChange}
                        accept=".csv,.xlsx,.xls,.json,.pdf,.txt"
                      />
                    </div>
                    
                    {uploadedFiles.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {uploadedFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                            <span className="text-sm truncate flex-1">{file.name}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit Request"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AIAnalytics;
