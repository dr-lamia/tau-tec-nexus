import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { Eye } from "lucide-react";

export default function CompanyRequestsStatus() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: requests, isLoading } = useQuery({
    queryKey: ['company-requests', statusFilter],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let query = supabase
        .from('company_requests')
        .select('*')
        .eq('company_id', user.id)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter as any);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: { variant: "secondary", label: "Pending" },
      in_review: { variant: "default", label: "In Review" },
      approved: { variant: "default", label: "Approved", className: "bg-green-600" },
      rejected: { variant: "destructive", label: "Rejected" }
    };
    const config = variants[status] || variants.pending;
    return <Badge variant={config.variant} className={config.className}>{config.label}</Badge>;
  };

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
          <h1 className="text-3xl font-bold">Request Status</h1>
          <p className="text-muted-foreground">Track your submitted requests</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
      </div>

      <div className="flex gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Requests</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_review">In Review</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Requests</CardTitle>
          <CardDescription>Total: {requests?.length || 0} requests</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests?.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="capitalize">{request.project_type}</TableCell>
                  <TableCell className="font-medium">{request.title}</TableCell>
                  <TableCell>{getStatusBadge(request.status)}</TableCell>
                  <TableCell>{new Date(request.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>{request.title}</DialogTitle>
                          <DialogDescription>
                            {request.project_type} - Submitted on {new Date(request.created_at).toLocaleDateString()}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm font-medium mb-2">Description</p>
                            <p className="text-sm text-muted-foreground">{request.description}</p>
                          </div>
                          {request.employee_count && (
                            <div>
                              <p className="text-sm font-medium">Employees: {request.employee_count}</p>
                            </div>
                          )}
                          {request.duration_weeks && (
                            <div>
                              <p className="text-sm font-medium">Duration: {request.duration_weeks} weeks</p>
                            </div>
                          )}
                          {request.delivery_mode && (
                            <div>
                              <p className="text-sm font-medium capitalize">
                                Delivery: {request.delivery_mode}
                              </p>
                            </div>
                          )}
                          {request.budget && (
                            <div>
                              <p className="text-sm font-medium">Budget: ${Number(request.budget).toFixed(2)}</p>
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium mb-2">Status</p>
                            {getStatusBadge(request.status)}
                          </div>
                          {request.admin_notes && (
                            <div>
                              <p className="text-sm font-medium mb-2">Admin Notes</p>
                              <p className="text-sm text-muted-foreground">{request.admin_notes}</p>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
