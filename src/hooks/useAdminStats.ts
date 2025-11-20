import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [
        usersRes, 
        coursesRes, 
        pendingRequestsRes, 
        instructorAppsRes,
        enrollmentsRes,
        revenueRes,
        publishedCoursesRes
      ] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('courses').select('id', { count: 'exact', head: true }),
        supabase.from('company_requests').select('id', { count: 'exact' }).eq('status', 'pending'),
        supabase.from('instructor_applications').select('id', { count: 'exact' }).eq('status', 'pending'),
        supabase.from('enrollments').select('id', { count: 'exact', head: true }),
        supabase.from('transactions').select('amount').eq('payment_status', 'paid'),
        supabase.from('courses').select('id', { count: 'exact', head: true }).eq('status', 'published')
      ]);

      const totalRevenue = revenueRes.data?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;

      return {
        totalUsers: usersRes.count || 0,
        totalCourses: coursesRes.count || 0,
        publishedCourses: publishedCoursesRes.count || 0,
        pendingRequests: pendingRequestsRes.count || 0,
        pendingInstructorApps: instructorAppsRes.count || 0,
        totalEnrollments: enrollmentsRes.count || 0,
        totalRevenue
      };
    }
  });
}
