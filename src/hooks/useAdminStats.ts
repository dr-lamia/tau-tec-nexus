import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [usersRes, coursesRes, requestsRes, revenueRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('courses').select('id', { count: 'exact', head: true }),
        supabase.from('company_requests').select('id', { count: 'exact' }).eq('status', 'pending'),
        supabase.from('transactions').select('amount').eq('payment_status', 'paid')
      ]);

      const totalRevenue = revenueRes.data?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;

      return {
        totalUsers: usersRes.count || 0,
        totalCourses: coursesRes.count || 0,
        activeRequests: requestsRes.count || 0,
        totalRevenue
      };
    }
  });
}
