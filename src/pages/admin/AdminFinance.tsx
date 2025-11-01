import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { DollarSign, TrendingUp, Clock } from "lucide-react";
import { format } from "date-fns";

export default function AdminFinance() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: transactions, isLoading } = useQuery({
    queryKey: ['admin-transactions', statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('transactions')
        .select(`
          *,
          courses(title)
        `)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('payment_status', statusFilter as any);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  const { data: summary } = useQuery({
    queryKey: ['finance-summary'],
    queryFn: async () => {
      const { data } = await supabase.from('transactions').select('amount, payment_status');
      
      const totalRevenue = data?.filter(t => t.payment_status === 'paid')
        .reduce((sum, t) => sum + Number(t.amount), 0) || 0;
      const pendingAmount = data?.filter(t => t.payment_status === 'pending')
        .reduce((sum, t) => sum + Number(t.amount), 0) || 0;
      const failedCount = data?.filter(t => t.payment_status === 'failed').length || 0;

      return { totalRevenue, pendingAmount, failedCount };
    }
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      paid: { variant: "default", label: "Paid", className: "bg-green-600" },
      pending: { variant: "secondary", label: "Pending" },
      failed: { variant: "destructive", label: "Failed" },
      refunded: { variant: "outline", label: "Refunded" }
    };
    const config = variants[status] || variants.pending;
    return <Badge variant={config.variant} className={config.className}>{config.label}</Badge>;
  };

  const payments = transactions?.filter(t => t.transaction_type === 'enrollment_payment');
  const payouts = transactions?.filter(t => t.transaction_type === 'instructor_payout');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Finance Management</h1>
          <p className="text-muted-foreground">Track payments and payouts</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${summary?.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">All-time earnings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${summary?.pendingAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Awaiting processing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Transactions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.failedCount}</div>
            <p className="text-xs text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="payments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="payments">Student Payments</TabsTrigger>
          <TabsTrigger value="payouts">Instructor Payouts</TabsTrigger>
        </TabsList>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Student Payments</CardTitle>
              <CardDescription>Course enrollment payments</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments?.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{transaction.user_id}</TableCell>
                      <TableCell>{transaction.courses?.title || 'N/A'}</TableCell>
                      <TableCell className="font-medium">
                        ${Number(transaction.amount).toFixed(2)} {transaction.currency}
                      </TableCell>
                      <TableCell>{getStatusBadge(transaction.payment_status)}</TableCell>
                      <TableCell className="capitalize">{transaction.payment_method || 'N/A'}</TableCell>
                      <TableCell>{format(new Date(transaction.created_at), 'PP')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payouts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Instructor Payouts</CardTitle>
              <CardDescription>Earnings paid to instructors</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Instructor</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payouts?.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{transaction.user_id}</TableCell>
                      <TableCell>{transaction.courses?.title || 'N/A'}</TableCell>
                      <TableCell className="font-medium">
                        ${Number(transaction.amount).toFixed(2)} {transaction.currency}
                      </TableCell>
                      <TableCell>{getStatusBadge(transaction.payment_status)}</TableCell>
                      <TableCell>{format(new Date(transaction.created_at), 'PP')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
