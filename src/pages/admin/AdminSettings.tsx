import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Settings, Edit } from "lucide-react";

export default function AdminSettings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingSetting, setEditingSetting] = useState<any>(null);
  const [editValue, setEditValue] = useState('');

  const { data: settings, isLoading } = useQuery({
    queryKey: ['platform-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_settings')
        .select('*')
        .order('category');

      if (error) throw error;
      return data;
    }
  });

  const updateSettingMutation = useMutation({
    mutationFn: async ({ id, value }: { id: string; value: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('platform_settings')
        .update({
          setting_value: JSON.parse(value),
          updated_by: user?.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      // Log audit
      await supabase.from('audit_logs').insert({
        actor_id: user?.id,
        action: 'settings_changed',
        entity_type: 'platform_setting',
        entity_id: id,
        details: { setting: editingSetting?.setting_key, new_value: value }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-settings'] });
      toast({ title: "Setting updated successfully" });
      setEditingSetting(null);
      setEditValue('');
    },
    onError: () => {
      toast({ title: "Failed to update setting", variant: "destructive" });
    }
  });

  const groupedSettings = settings?.reduce((acc: any, setting) => {
    if (!acc[setting.category]) {
      acc[setting.category] = [];
    }
    acc[setting.category].push(setting);
    return acc;
  }, {});

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
          <h1 className="text-3xl font-bold">Platform Settings</h1>
          <p className="text-muted-foreground">Configure global platform parameters</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
      </div>

      <div className="grid gap-6">
        {Object.entries(groupedSettings || {}).map(([category, categorySettings]: [string, any]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 capitalize">
                <Settings className="h-5 w-5" />
                {category}
              </CardTitle>
              <CardDescription>Manage {category} configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {categorySettings.map((setting: any) => (
                <div key={setting.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{setting.setting_key.replace(/_/g, ' ').toUpperCase()}</div>
                    <div className="text-sm text-muted-foreground">{setting.description}</div>
                    <div className="text-sm font-mono mt-1">
                      Current: {JSON.stringify(setting.setting_value)}
                    </div>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingSetting(setting);
                          setEditValue(JSON.stringify(setting.setting_value));
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Setting</DialogTitle>
                        <DialogDescription>{setting.description}</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="value">Value (JSON format)</Label>
                          <Textarea
                            id="value"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            placeholder='e.g., "100" or ["option1", "option2"]'
                            rows={4}
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Enter value in JSON format (strings need quotes)
                          </p>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          onClick={() => {
                            try {
                              JSON.parse(editValue); // Validate JSON
                              updateSettingMutation.mutate({
                                id: editingSetting.id,
                                value: editValue
                              });
                            } catch {
                              toast({
                                title: "Invalid JSON format",
                                variant: "destructive"
                              });
                            }
                          }}
                          disabled={updateSettingMutation.isPending}
                        >
                          Save Changes
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
