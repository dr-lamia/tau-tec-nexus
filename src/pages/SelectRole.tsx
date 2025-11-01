import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, Briefcase, Users, Shield } from "lucide-react";

type UserRole = "student" | "instructor" | "company" | "admin";

const roleConfig: Record<UserRole, { icon: React.ElementType; title: string; description: string; color: string }> = {
  student: {
    icon: GraduationCap,
    title: "Student Dashboard",
    description: "Access your courses, assignments, and schedule",
    color: "text-blue-500"
  },
  instructor: {
    icon: Users,
    title: "Instructor Dashboard",
    description: "Manage courses, assignments, and student progress",
    color: "text-purple-500"
  },
  company: {
    icon: Briefcase,
    title: "Company Dashboard",
    description: "Request training programs and track corporate learning",
    color: "text-green-500"
  },
  admin: {
    icon: Shield,
    title: "Admin Dashboard",
    description: "Manage platform settings, users, and system configuration",
    color: "text-red-500"
  }
};

const SelectRole = () => {
  const { user, availableRoles, userRole, selectRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if not logged in
    if (!user) {
      navigate("/auth");
      return;
    }

    // Redirect if role already selected
    if (userRole) {
      navigate("/dashboard");
      return;
    }

    // Redirect if only one role (shouldn't happen, but safety check)
    if (availableRoles.length === 1) {
      selectRole(availableRoles[0]);
      navigate("/dashboard");
      return;
    }

    // Redirect if no roles available
    if (availableRoles.length === 0) {
      navigate("/dashboard");
    }
  }, [user, userRole, availableRoles, navigate, selectRole]);

  const handleRoleSelection = (role: UserRole) => {
    selectRole(role);
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Choose Your Dashboard</h1>
          <p className="text-muted-foreground">
            You have access to multiple roles. Select one to continue.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {availableRoles.map((role) => {
            const config = roleConfig[role];
            const Icon = config.icon;

            return (
              <Card
                key={role}
                className="gradient-card border shadow-medium hover:shadow-strong transition-all cursor-pointer"
                onClick={() => handleRoleSelection(role)}
              >
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-3 rounded-lg bg-muted ${config.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-xl">{config.title}</CardTitle>
                  </div>
                  <CardDescription>{config.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="hero" className="w-full">
                    Continue as {role.charAt(0).toUpperCase() + role.slice(1)}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SelectRole;
