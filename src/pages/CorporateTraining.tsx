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
import { Building2, Users, Clock, DollarSign } from "lucide-react";

const CorporateTraining = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    employee_count: "",
    duration_weeks: "",
    delivery_mode: "",
    budget: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Please sign in to submit a training request");
      navigate("/auth");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("company_requests").insert({
        company_id: user.id,
        title: formData.title,
        description: formData.description,
        project_type: "corporate_training",
        employee_count: formData.employee_count ? parseInt(formData.employee_count) : null,
        duration_weeks: formData.duration_weeks ? parseInt(formData.duration_weeks) : null,
        delivery_mode: formData.delivery_mode as any,
        budget: formData.budget ? parseFloat(formData.budget) : null,
      });

      if (error) throw error;

      toast.success("Training request submitted successfully!");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Failed to submit request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const benefits = [
    {
      icon: Building2,
      title: "Customized Programs",
      description: "Tailored training solutions designed specifically for your organization's needs",
    },
    {
      icon: Users,
      title: "Team Development",
      description: "Upskill your entire workforce with collaborative learning experiences",
    },
    {
      icon: Clock,
      title: "Flexible Scheduling",
      description: "Choose between online, offline, or hybrid delivery modes that fit your schedule",
    },
    {
      icon: DollarSign,
      title: "ROI Focused",
      description: "Measurable outcomes and skills that directly impact your business goals",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Corporate Training Solutions</h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Transform your workforce with customized training programs designed to meet your organization's unique needs
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {benefits.map((benefit, index) => (
                <Card key={index} className="gradient-card">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                      <benefit.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{benefit.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{benefit.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="gradient-card">
              <CardHeader>
                <CardTitle>Request Corporate Training</CardTitle>
                <CardDescription>
                  Fill out the form below and our team will contact you to discuss your training needs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Training Program Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Advanced Data Analytics Training"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Training Requirements *</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your training needs, objectives, and any specific topics you'd like covered..."
                      rows={5}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="employee_count">Number of Employees</Label>
                      <Input
                        id="employee_count"
                        type="number"
                        placeholder="e.g., 25"
                        value={formData.employee_count}
                        onChange={(e) => setFormData({ ...formData, employee_count: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="duration_weeks">Preferred Duration (weeks)</Label>
                      <Input
                        id="duration_weeks"
                        type="number"
                        placeholder="e.g., 8"
                        value={formData.duration_weeks}
                        onChange={(e) => setFormData({ ...formData, duration_weeks: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="delivery_mode">Delivery Mode</Label>
                      <Select value={formData.delivery_mode} onValueChange={(value) => setFormData({ ...formData, delivery_mode: value })}>
                        <SelectTrigger id="delivery_mode">
                          <SelectValue placeholder="Select delivery mode" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="online">Online</SelectItem>
                          <SelectItem value="offline">Offline</SelectItem>
                          <SelectItem value="hybrid">Hybrid</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="budget">Budget (USD)</Label>
                      <Input
                        id="budget"
                        type="number"
                        placeholder="e.g., 10000"
                        value={formData.budget}
                        onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                      />
                    </div>
                  </div>

                  <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit Training Request"}
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

export default CorporateTraining;
