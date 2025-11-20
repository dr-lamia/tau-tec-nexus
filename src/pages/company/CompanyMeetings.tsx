import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Clock, Video, MapPin, ExternalLink } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";

const CompanyMeetings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: meetings = [], isLoading } = useQuery({
    queryKey: ['company-meetings', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('meetings')
        .select('*')
        .order('scheduled_at', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const upcomingMeetings = meetings.filter(m => new Date(m.scheduled_at) >= new Date());
  const pastMeetings = meetings.filter(m => new Date(m.scheduled_at) < new Date());

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-background border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Button 
                variant="ghost" 
                onClick={() => navigate('/dashboard')}
                className="mb-2"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <h1 className="text-3xl font-bold text-foreground">Scheduled Meetings</h1>
              <p className="text-muted-foreground mt-1">View all your upcoming and past meetings</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Upcoming Meetings */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Meetings ({upcomingMeetings.length})</CardTitle>
            <CardDescription>Your scheduled meetings</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingMeetings.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No upcoming meetings scheduled.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Mode</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {upcomingMeetings.map((meeting) => (
                    <TableRow key={meeting.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div>{meeting.title}</div>
                          {meeting.description && (
                            <div className="text-sm text-muted-foreground">{meeting.description}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {meeting.meeting_type === 'company_consultation' ? 'Consultation' : 
                           meeting.meeting_type === 'company_training' ? 'Training' : 'Session'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {meeting.meeting_mode === 'online' ? (
                            <>
                              <Video className="h-4 w-4 text-primary" />
                              <span>Online</span>
                            </>
                          ) : (
                            <>
                              <MapPin className="h-4 w-4 text-orange-600" />
                              <span>Offline</span>
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {format(new Date(meeting.scheduled_at), 'MMM dd, yyyy HH:mm')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          {meeting.duration_minutes} min
                        </div>
                      </TableCell>
                      <TableCell>
                        {meeting.meeting_mode === 'online' && meeting.zoom_join_url && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.open(meeting.zoom_join_url!, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Join
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Past Meetings */}
        {pastMeetings.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Past Meetings ({pastMeetings.length})</CardTitle>
              <CardDescription>Your meeting history</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Mode</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Duration</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pastMeetings.map((meeting) => (
                    <TableRow key={meeting.id} className="opacity-60">
                      <TableCell className="font-medium">
                        <div>
                          <div>{meeting.title}</div>
                          {meeting.description && (
                            <div className="text-sm text-muted-foreground">{meeting.description}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {meeting.meeting_type === 'company_consultation' ? 'Consultation' : 
                           meeting.meeting_type === 'company_training' ? 'Training' : 'Session'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {meeting.meeting_mode === 'online' ? (
                            <>
                              <Video className="h-4 w-4 text-primary" />
                              <span>Online</span>
                            </>
                          ) : (
                            <>
                              <MapPin className="h-4 w-4 text-orange-600" />
                              <span>Offline</span>
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {format(new Date(meeting.scheduled_at), 'MMM dd, yyyy HH:mm')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          {meeting.duration_minutes} min
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CompanyMeetings;
