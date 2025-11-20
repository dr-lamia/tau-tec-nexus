import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import StudentDashboard from "./dashboards/StudentDashboard";
import InstructorDashboard from "./dashboards/InstructorDashboard";
import CompanyDashboard from "./dashboards/CompanyDashboard";
import AdminDashboard from "./dashboards/AdminDashboard";

const Dashboard = () => {
  const { userRole, availableRoles, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect to role selection if multiple roles but no selection
  useEffect(() => {
    if (!loading && !userRole && availableRoles.length > 1) {
      console.log("Multiple roles detected, redirecting to role selection");
      navigate("/select-role");
    }
  }, [loading, userRole, availableRoles, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Use the available role if userRole isn't set yet but we have exactly one role
  const roleToUse = userRole || (availableRoles.length === 1 ? availableRoles[0] : null);

  // If no role found, show message
  if (!roleToUse) {
    console.warn("Dashboard: No user role detected");
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">No Role Assigned</h2>
          <p className="text-muted-foreground">Please contact support to get your account set up.</p>
        </div>
      </div>
    );
  }

  console.log("Dashboard: Routing to dashboard for role:", roleToUse);

  // Route to appropriate dashboard based on role
  switch (roleToUse) {
    case "student":
      return <StudentDashboard />;
    case "instructor":
      return <InstructorDashboard />;
    case "company":
      return <CompanyDashboard />;
    case "admin":
      return <AdminDashboard />;
    default:
      return <StudentDashboard />;
  }
};

export default Dashboard;
