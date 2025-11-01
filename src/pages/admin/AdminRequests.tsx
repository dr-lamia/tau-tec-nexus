import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, MessageSquare, Calendar } from "lucide-react";

type RequestStatus = 'pending' | 'in_review' | 'approved' | 'rejected';

export default function AdminRequests() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<RequestStatus | 'all'>('all');
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [adminNotes, setAdminNotes] = useState('');

  const { data: requests, isLoading } = useQuery({
    queryKey: ['admin-requests', statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('company_requests')
        .select(`
          *
        `)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  const updateRequestMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: RequestStatus; notes?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('company_requests')
        .update({
          status,
          admin_notes: notes || null,
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      // Log audit
      await supabase.from('audit_logs').insert({
        actor_id: user?.id,
        action: status === 'approved' ? 'request_approved' : 'request_rejected',
        entity_type: 'company_request',
        entity_id: id,
        details: { status, notes }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-requests'] });
      toast({ title: "Request updated successfully" });
      setSelectedRequest(null);
      setAdminNotes('');
    },
    onError: () => {
      toast({ title: "Failed to update request", variant: "destructive" });
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
          <h1 className="text-3xl font-bold">Company Requests</h1>
          <p className="text-muted-foreground">Review and manage training & AI solution requests</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
      </div>

      <div className="flex gap-4">
        <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
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
          <CardTitle>Requests</CardTitle>
          <CardDescription>Total: {requests?.length || 0} requests</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests?.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">{request.company_id}</TableCell>
                  <TableCell>{request.project_type}</TableCell>
                  <TableCell>{request.title}</TableCell>
                  <TableCell>{getStatusBadge(request.status)}</TableCell>
                  <TableCell>{new Date(request.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedRequest(request);
                              setAdminNotes(request.admin_notes || '');
                            }}
                          >
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>{request.title}</DialogTitle>
                            <DialogDescription>
                              {request.project_type}
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
                            <div>
                              <p className="text-sm font-medium mb-2">Admin Notes</p>
                              <Textarea
                                value={adminNotes}
                                onChange={(e) => setAdminNotes(e.target.value)}
                                placeholder="Add notes for this request..."
                                rows={4}
                              />
                            </div>
                          </div>
                          <DialogFooter className="gap-2">
                            <Button
                              variant="outline"
                              onClick={() => updateRequestMutation.mutate({
                                id: request.id,
                                status: 'rejected',
                                notes: adminNotes
                              })}
                              disabled={updateRequestMutation.isPending}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                            <Button
                              onClick={() => updateRequestMutation.mutate({
                                id: request.id,
                                status: 'approved',
                                notes: adminNotes
                              })}
                              disabled={updateRequestMutation.isPending}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate('/admin/meetings')}
                      >
                        <Calendar className="h-4 w-4" />
                      </Button>
                    </div>
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
