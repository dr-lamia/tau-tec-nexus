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
import { BrainCircuit, BarChart3, TrendingUp, Zap, Target, Shield } from "lucide-react";

const AIAnalytics = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration_weeks: "",
    delivery_mode: "",
    budget: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Please sign in to submit a request");
      navigate("/auth");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("company_requests").insert({
        company_id: user.id,
        title: formData.title,
        description: formData.description,
        project_type: "ai_data_analytics",
        duration_weeks: formData.duration_weeks ? parseInt(formData.duration_weeks) : null,
        delivery_mode: formData.delivery_mode as any,
        budget: formData.budget ? parseFloat(formData.budget) : null,
      });

      if (error) throw error;

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
