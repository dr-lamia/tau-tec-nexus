import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, BookOpen, Building2, Settings, LogOut, Shield } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useAdminStats } from "@/hooks/useAdminStats";

const AdminDashboard = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { data: stats, isLoading } = useAdminStats();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-slate-900 text-white border-b shadow-soft">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6" />
              <h1 className="text-2xl font-bold">
                Admin Dashboard
              </h1>
            </div>
            <Button variant="ghost" className="text-white hover:text-white hover:bg-white/10" onClick={signOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <Card className="bg-gradient-to-r from-slate-700 to-slate-900 text-white border-0 shadow-glow mb-8">
          <CardHeader>
            <CardTitle className="text-3xl text-white">Administrator Control Panel</CardTitle>
            <CardDescription className="text-white/80 text-lg">
              Full system access and management
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Stats */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card 
            className="gradient-card border shadow-medium hover:shadow-strong transition-all duration-300 cursor-pointer"
            onClick={() => navigate('/admin/analytics')}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-700">{stats?.totalUsers || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">All registered users</p>
            </CardContent>
          </Card>

          <Card 
            className="gradient-card border shadow-medium hover:shadow-strong transition-all duration-300 cursor-pointer"
            onClick={() => navigate('/admin/content')}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Courses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{stats?.totalCourses || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">{stats?.publishedCourses || 0} published</p>
            </CardContent>
          </Card>

          <Card 
            className="gradient-card border shadow-medium hover:shadow-strong transition-all duration-300 cursor-pointer"
            onClick={() => navigate('/admin/requests')}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{stats?.pendingRequests || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Awaiting review</p>
            </CardContent>
          </Card>

          <Card 
            className="gradient-card border shadow-medium hover:shadow-strong transition-all duration-300 cursor-pointer"
            onClick={() => navigate('/admin/finance')}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-secondary">${stats?.totalRevenue.toFixed(2) || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Paid transactions</p>
            </CardContent>
          </Card>
        </div>

        {/* Additional Stats Row */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="gradient-card border shadow-medium">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Enrollments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalEnrollments || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Active student enrollments</p>
            </CardContent>
          </Card>

          <Card 
            className="gradient-card border shadow-medium hover:shadow-strong transition-all duration-300 cursor-pointer"
            onClick={() => navigate('/admin/analytics')}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Instructor Applications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats?.pendingInstructorApps || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Pending approval</p>
            </CardContent>
          </Card>

          <Card 
            className="gradient-card border shadow-medium hover:shadow-strong transition-all duration-300 cursor-pointer"
            onClick={() => navigate('/admin/meetings')}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Scheduled Meetings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">View All</div>
              <p className="text-xs text-muted-foreground mt-1">Manage consultations</p>
            </CardContent>
          </Card>
        </div>

        {/* Management Sections */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card 
            className="gradient-card border shadow-medium hover:shadow-strong transition-all duration-300 hover:-translate-y-1 cursor-pointer"
            onClick={() => navigate('/admin/analytics')}
          >
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-slate-700" />
              </div>
              <CardTitle>User Analytics</CardTitle>
              <CardDescription>View user insights and trends</CardDescription>
            </CardHeader>
          </Card>

          <Card 
            className="gradient-card border shadow-medium hover:shadow-strong transition-all duration-300 hover:-translate-y-1 cursor-pointer"
            onClick={() => navigate('/admin/content')}
          >
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Course Management</CardTitle>
              <CardDescription>Manage and publish courses</CardDescription>
            </CardHeader>
          </Card>

          <Card 
            className="gradient-card border shadow-medium hover:shadow-strong transition-all duration-300 hover:-translate-y-1 cursor-pointer"
            onClick={() => navigate('/admin/requests')}
          >
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center mb-4">
                <Building2 className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle>Corporate Requests</CardTitle>
              <CardDescription>Review and approve requests</CardDescription>
            </CardHeader>
          </Card>

          <Card 
            className="gradient-card border shadow-medium hover:shadow-strong transition-all duration-300 hover:-translate-y-1 cursor-pointer"
            onClick={() => navigate('/admin/finance')}
          >
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4">
                <Settings className="h-6 w-6 text-secondary" />
              </div>
              <CardTitle>Financial Overview</CardTitle>
              <CardDescription>View payments and payouts</CardDescription>
            </CardHeader>
          </Card>

          <Card 
            className="gradient-card border shadow-medium hover:shadow-strong transition-all duration-300 hover:-translate-y-1 cursor-pointer"
            onClick={() => navigate('/admin/audit-logs')}
          >
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-accent" />
              </div>
              <CardTitle>Audit Logs</CardTitle>
              <CardDescription>Monitor system activity</CardDescription>
            </CardHeader>
          </Card>

          <Card 
            className="gradient-card border shadow-medium hover:shadow-strong transition-all duration-300 hover:-translate-y-1 cursor-pointer"
            onClick={() => navigate('/admin/settings')}
          >
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Settings className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Platform Settings</CardTitle>
              <CardDescription>Configure system settings</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;