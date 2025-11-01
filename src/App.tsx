import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import CreateCourse from "./pages/instructor/CreateCourse";
import EditCourse from "./pages/instructor/EditCourse";
import InstructorAssignments from "./pages/instructor/InstructorAssignments";
import StudentCourseView from "./pages/student/StudentCourseView";
import StudentSchedule from "./pages/student/StudentSchedule";
import StudentDiscussions from "./pages/student/StudentDiscussions";
import StudentAssignments from "./pages/student/StudentAssignments";
import CorporateTraining from "./pages/CorporateTraining";
import AIAnalytics from "./pages/AIAnalytics";
import Instructors from "./pages/Instructors";
import InstructorApplication from "./pages/InstructorApplication";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminRequests from "./pages/admin/AdminRequests";
import AdminMeetings from "./pages/admin/AdminMeetings";
import AdminFinance from "./pages/admin/AdminFinance";
import AdminContentOverride from "./pages/admin/AdminContentOverride";
import AdminAuditLogs from "./pages/admin/AdminAuditLogs";
import AdminSettings from "./pages/admin/AdminSettings";
import CompanyOverview from "./pages/company/CompanyOverview";
import CompanyNewRequest from "./pages/company/CompanyNewRequest";
import CompanyRequestsStatus from "./pages/company/CompanyRequestsStatus";
import SelectRole from "./pages/SelectRole";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/:id" element={<CourseDetail />} />
            <Route 
              path="/select-role"
              element={
                <ProtectedRoute>
                  <SelectRole />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/instructor/courses/create" 
              element={
                <ProtectedRoute>
                  <CreateCourse />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/instructor/courses/edit/:id" 
              element={
                <ProtectedRoute>
                  <EditCourse />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/instructor/assignments" 
              element={
                <ProtectedRoute allowedRoles={["instructor"]}>
                  <InstructorAssignments />
                </ProtectedRoute>
              } 
            />
            <Route
              path="/student/course/:id" 
              element={
                <ProtectedRoute>
                  <StudentCourseView />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/student/schedule" 
              element={
                <ProtectedRoute>
                  <StudentSchedule />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/student/discussions" 
              element={
                <ProtectedRoute>
                  <StudentDiscussions />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/student/assignments" 
              element={
                <ProtectedRoute>
                  <StudentAssignments />
                </ProtectedRoute>
              } 
            />
            <Route path="/corporate-training" element={<CorporateTraining />} />
            <Route path="/ai-analytics" element={<AIAnalytics />} />
            <Route path="/instructors" element={<Instructors />} />
            <Route path="/become-instructor" element={<InstructorApplication />} />
            
            {/* Admin Routes */}
            <Route 
              path="/admin/analytics" 
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminAnalytics />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/requests" 
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminRequests />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/meetings" 
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminMeetings />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/finance" 
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminFinance />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/content" 
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminContentOverride />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/audit-logs" 
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminAuditLogs />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/settings" 
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminSettings />
                </ProtectedRoute>
              } 
            />
            
            {/* Company Routes */}
            <Route 
              path="/company/overview" 
              element={
                <ProtectedRoute allowedRoles={["company"]}>
                  <CompanyOverview />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/company/new-request" 
              element={
                <ProtectedRoute allowedRoles={["company"]}>
                  <CompanyNewRequest />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/company/requests" 
              element={
                <ProtectedRoute allowedRoles={["company"]}>
                  <CompanyRequestsStatus />
                </ProtectedRoute>
              } 
            />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
