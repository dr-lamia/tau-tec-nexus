import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Plus, Copy, Trash2, ExternalLink } from "lucide-react";
import { format } from "date-fns";

export default function AdminMeetings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    meeting_type: 'company_consultation' as const,
    meeting_mode: 'online' as 'online' | 'offline',
    scheduled_at: '',
    duration_minutes: 60,
    zoom_join_url: '',
  });

  const { data: meetings, isLoading } = useQuery({
    queryKey: ['admin-meetings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('meetings')
        .select(`
          *
        `)
        .order('scheduled_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const createMeetingMutation = useMutation({
    mutationFn: async (meetingData: typeof formData) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Create meeting with optional Zoom link
      const { error } = await supabase.from('meetings').insert({
        title: meetingData.title,
        description: meetingData.description,
        meeting_type: meetingData.meeting_type,
        meeting_mode: meetingData.meeting_mode,
        scheduled_at: meetingData.scheduled_at,
        duration_minutes: meetingData.duration_minutes,
        host_id: user?.id,
        zoom_join_url: meetingData.meeting_mode === 'online' ? meetingData.zoom_join_url : null,
      });

      if (error) throw error;

      // Log audit
      await supabase.from('audit_logs').insert({
        actor_id: user?.id,
        action: 'settings_changed',
        entity_type: 'meeting',
        details: { action: 'created', meeting: meetingData.title }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-meetings'] });
      toast({ title: "Meeting created successfully" });
      setIsDialogOpen(false);
      setFormData({
        title: '',
        description: '',
        meeting_type: 'company_consultation',
        meeting_mode: 'online',
        scheduled_at: '',
        duration_minutes: 60,
        zoom_join_url: '',
      });
    },
    onError: () => {
      toast({ title: "Failed to create meeting", variant: "destructive" });
    }
  });

  const deleteMeetingMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('meetings').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-meetings'] });
      toast({ title: "Meeting deleted" });
    }
  });

  const copyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({ title: "Link copied to clipboard" });
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
          <h1 className="text-3xl font-bold">Meetings Management</h1>
          <p className="text-muted-foreground">Schedule and manage Zoom meetings</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Meeting
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Meeting</DialogTitle>
                <DialogDescription>Schedule a new meeting with Zoom integration</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Meeting title"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Meeting description"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="type">Meeting Type</Label>
                  <Select
                    value={formData.meeting_type}
                    onValueChange={(value: any) => setFormData({ ...formData, meeting_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="company_consultation">Company Consultation</SelectItem>
                      <SelectItem value="company_training">Company Training</SelectItem>
                      <SelectItem value="course_session">Course Session</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="mode">Meeting Mode</Label>
                  <Select
                    value={formData.meeting_mode}
                    onValueChange={(value: 'online' | 'offline') => setFormData({ ...formData, meeting_mode: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="online">Online</SelectItem>
                      <SelectItem value="offline">Offline</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formData.meeting_mode === 'online' && (
                  <div>
                    <Label htmlFor="zoom_link">Meeting Link (Zoom, Teams, etc.)</Label>
                    <Input
                      id="zoom_link"
                      type="url"
                      value={formData.zoom_join_url}
                      onChange={(e) => setFormData({ ...formData, zoom_join_url: e.target.value })}
                      placeholder="https://zoom.us/j/..."
                    />
                  </div>
                )}
                <div>
                  <Label htmlFor="scheduled_at">Date & Time</Label>
                  <Input
                    id="scheduled_at"
                    type="datetime-local"
                    value={formData.scheduled_at}
                    onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={() => createMeetingMutation.mutate(formData)}
                  disabled={createMeetingMutation.isPending || !formData.title || !formData.scheduled_at}
                >
                  Create Meeting
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Scheduled Meetings</CardTitle>
          <CardDescription>Total: {meetings?.length || 0} meetings</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Host</TableHead>
                <TableHead>Scheduled</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {meetings?.map((meeting) => (
                <TableRow key={meeting.id}>
                  <TableCell className="font-medium">{meeting.title}</TableCell>
                  <TableCell className="capitalize">{meeting.meeting_type.replace('_', ' ')}</TableCell>
                  <TableCell>{meeting.host_id || 'N/A'}</TableCell>
                  <TableCell>{format(new Date(meeting.scheduled_at), 'PPp')}</TableCell>
                  <TableCell>{meeting.duration_minutes} min</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyLink(meeting.zoom_join_url || '')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(meeting.zoom_join_url || '', '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteMeetingMutation.mutate(meeting.id)}
                      >
                        <Trash2 className="h-4 w-4" />
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
