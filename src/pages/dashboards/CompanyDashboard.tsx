import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, TrendingUp, Calendar, Database, LogOut, Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

const CompanyDashboard = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-background border-b shadow-soft">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-orange-600">
              Company Dashboard
            </h1>
            <div className="flex items-center gap-3">
              <Button 
                className="bg-orange-600 hover:bg-orange-700 text-white"
                onClick={() => navigate('/company/new-request')}
              >
                <Plus className="mr-2 h-4 w-4" />
                New Request
              </Button>
              <Button variant="ghost" onClick={signOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 shadow-glow mb-8">
          <CardHeader>
            <CardTitle className="text-3xl text-white">Welcome, Enterprise Partner!</CardTitle>
            <CardDescription className="text-white/80 text-lg">
              Manage training programs and AI analytics projects
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="gradient-card border shadow-medium">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">0</div>
            </CardContent>
          </Card>

          <Card className="gradient-card border shadow-medium">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Completed Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">0</div>
            </CardContent>
          </Card>

          <Card className="gradient-card border shadow-medium">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Employees Trained
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-secondary">0</div>
            </CardContent>
          </Card>

          <Card className="gradient-card border shadow-medium">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Reviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">0</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card 
            className="gradient-card border shadow-medium hover:shadow-strong transition-all duration-300 hover:-translate-y-1 cursor-pointer"
            onClick={() => navigate('/company/new-request')}
          >
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle>Training Requests</CardTitle>
              <CardDescription>Submit training needs</CardDescription>
            </CardHeader>
          </Card>

          <Card 
            className="gradient-card border shadow-medium hover:shadow-strong transition-all duration-300 hover:-translate-y-1 cursor-pointer"
            onClick={() => navigate('/company/new-request')}
          >
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Database className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>AI Projects</CardTitle>
              <CardDescription>Data analytics requests</CardDescription>
            </CardHeader>
          </Card>

          <Card 
            className="gradient-card border shadow-medium hover:shadow-strong transition-all duration-300 hover:-translate-y-1 cursor-pointer"
            onClick={() => navigate('/company/overview')}
          >
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-secondary" />
              </div>
              <CardTitle>Meetings</CardTitle>
              <CardDescription>Schedule consultations</CardDescription>
            </CardHeader>
          </Card>

          <Card 
            className="gradient-card border shadow-medium hover:shadow-strong transition-all duration-300 hover:-translate-y-1 cursor-pointer"
            onClick={() => navigate('/company/requests')}
          >
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-accent" />
              </div>
              <CardTitle>Reports</CardTitle>
              <CardDescription>Download deliverables</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboard;