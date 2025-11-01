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
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
