import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Calendar, MessageSquare, FileText, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // TODO: Implement actual logout logic with Supabase
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-background border-b shadow-soft">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Student Dashboard
            </h1>
            <Button variant="ghost" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <Card className="gradient-hero text-white border-0 shadow-glow mb-8">
          <CardHeader>
            <CardTitle className="text-3xl text-white">Welcome back!</CardTitle>
            <CardDescription className="text-white/80 text-lg">
              Ready to continue your learning journey?
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="gradient-card border shadow-medium">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Enrolled Courses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">3</div>
            </CardContent>
          </Card>

          <Card className="gradient-card border shadow-medium">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-secondary">12</div>
            </CardContent>
          </Card>

          <Card className="gradient-card border shadow-medium">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Certificates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">8</div>
            </CardContent>
          </Card>

          <Card className="gradient-card border shadow-medium">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">67%</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="gradient-card border shadow-medium hover:shadow-strong transition-all duration-300 hover:-translate-y-1 cursor-pointer">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>My Courses</CardTitle>
              <CardDescription>View and manage enrolled courses</CardDescription>
            </CardHeader>
          </Card>

          <Card className="gradient-card border shadow-medium hover:shadow-strong transition-all duration-300 hover:-translate-y-1 cursor-pointer">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-secondary" />
              </div>
              <CardTitle>Schedule</CardTitle>
              <CardDescription>View upcoming sessions</CardDescription>
            </CardHeader>
          </Card>

          <Card className="gradient-card border shadow-medium hover:shadow-strong transition-all duration-300 hover:-translate-y-1 cursor-pointer">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <MessageSquare className="h-6 w-6 text-accent" />
              </div>
              <CardTitle>Discussions</CardTitle>
              <CardDescription>Join course forums</CardDescription>
            </CardHeader>
          </Card>

          <Card className="gradient-card border shadow-medium hover:shadow-strong transition-all duration-300 hover:-translate-y-1 cursor-pointer">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Assignments</CardTitle>
              <CardDescription>Submit and track assignments</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Placeholder Message */}
        <Card className="mt-8 border shadow-soft">
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              This is a foundation dashboard. Full course management, scheduling, and interactive features will be implemented next!
            </p>
            <Link to="/">
              <Button variant="outline" className="mt-4">
                Back to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
