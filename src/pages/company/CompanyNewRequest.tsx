import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { GraduationCap, Brain, ArrowLeft } from "lucide-react";

type ProjectType = 'training' | 'ai_solution';

export default function CompanyNewRequest() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState<'select' | 'form'>('select');
  const [projectType, setProjectType] = useState<ProjectType>('training');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    employee_count: '',
    duration_weeks: '',
    delivery_mode: 'online' as const,
    budget: ''
  });

  const createRequestMutation = useMutation({
    mutationFn: async (data: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('company_requests').insert({
        company_id: user.id,
        project_type: projectType === 'training' ? 'corporate_training' : 'ai_data_analytics',
        title: data.title,
        description: data.description,
        employee_count: data.employee_count ? parseInt(data.employee_count) : null,
        duration_weeks: data.duration_weeks ? parseInt(data.duration_weeks) : null,
        delivery_mode: data.delivery_mode,
        budget: data.budget ? parseFloat(data.budget) : null
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Request submitted successfully" });
      navigate('/company/requests');
    },
    onError: () => {
      toast({ title: "Failed to submit request", variant: "destructive" });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createRequestMutation.mutate(formData);
  };

  if (step === 'select') {
    return (
      <div className="container mx-auto p-6">
        <Button variant="ghost" onClick={() => navigate('/company/overview')} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Select Project Type</h1>
          <p className="text-muted-foreground">Choose the type of request you'd like to submit</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
          <Card
            className="cursor-pointer hover:shadow-lg transition-all hover:border-orange-500"
            onClick={() => {
              setProjectType('training');
              setStep('form');
            }}
          >
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-orange-100 flex items-center justify-center">
                <GraduationCap className="h-8 w-8 text-orange-600" />
              </div>
              <CardTitle>Corporate Training</CardTitle>
              <CardDescription>
                Request customized training programs for your employees
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Tailored curriculum</li>
                <li>• Online or in-person delivery</li>
                <li>• Flexible scheduling</li>
                <li>• Progress tracking</li>
              </ul>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-all hover:border-orange-500"
            onClick={() => {
              setProjectType('ai_solution');
              setStep('form');
            }}
          >
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-orange-100 flex items-center justify-center">
                <Brain className="h-8 w-8 text-orange-600" />
              </div>
              <CardTitle>AI Data Analytics</CardTitle>
              <CardDescription>
                Get AI-powered insights and custom data solutions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Data analysis & modeling</li>
                <li>• Custom AI solutions</li>
                <li>• Predictive analytics</li>
                <li>• Actionable reports</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Button variant="ghost" onClick={() => setStep('select')} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>
            {projectType === 'training' ? 'Corporate Training Request' : 'AI Solution Request'}
          </CardTitle>
          <CardDescription>
            Fill out the form below to submit your request
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Project Title</Label>
              <Input
                id="title"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Brief title for your project"
              />
            </div>

            <div>
              <Label htmlFor="description">
                {projectType === 'training' ? 'Training Description' : 'Problem Statement'}
              </Label>
              <Textarea
                id="description"
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={
                  projectType === 'training'
                    ? 'Describe your training needs and objectives...'
                    : 'Describe the problem you want to solve...'
                }
                rows={5}
              />
            </div>

            {projectType === 'training' && (
              <>
                <div>
                  <Label htmlFor="employee_count">Number of Employees</Label>
                  <Input
                    id="employee_count"
                    type="number"
                    value={formData.employee_count}
                    onChange={(e) => setFormData({ ...formData, employee_count: e.target.value })}
                    placeholder="How many employees will participate?"
                  />
                </div>

                <div>
                  <Label htmlFor="duration_weeks">Duration (weeks)</Label>
                  <Input
                    id="duration_weeks"
                    type="number"
                    value={formData.duration_weeks}
                    onChange={(e) => setFormData({ ...formData, duration_weeks: e.target.value })}
                    placeholder="Expected duration in weeks"
                  />
                </div>

                <div>
                  <Label htmlFor="delivery_mode">Delivery Mode</Label>
                  <Select
                    value={formData.delivery_mode}
                    onValueChange={(value: any) => setFormData({ ...formData, delivery_mode: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="online">Online</SelectItem>
                      <SelectItem value="offline">In-Person</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <div>
              <Label htmlFor="budget">Budget (Optional)</Label>
              <Input
                id="budget"
                type="number"
                step="0.01"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                placeholder="Expected budget in USD"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={createRequestMutation.isPending} className="flex-1">
                Submit Request
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/company/overview')}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
