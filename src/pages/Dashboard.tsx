import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import StudentDashboard from "./dashboards/StudentDashboard";
import InstructorDashboard from "./dashboards/InstructorDashboard";
import CompanyDashboard from "./dashboards/CompanyDashboard";
import AdminDashboard from "./dashboards/AdminDashboard";

const Dashboard = () => {
  const { userRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Route to appropriate dashboard based on role
  switch (userRole) {
    case "student":
      return <StudentDashboard />;
    case "instructor":
      return <InstructorDashboard />;
    case "company":
      return <CompanyDashboard />;
    case "admin":
      return <AdminDashboard />;
    default:
      // If no role is set, show an error message
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">No Role Assigned</h1>
            <p className="text-muted-foreground mb-4">
              Your account doesn't have a role assigned yet. Please contact support.
            </p>
            <Button onClick={() => window.location.href = "/"}>
              Return to Home
            </Button>
          </div>
        </div>
      );
  }
};

export default Dashboard;
