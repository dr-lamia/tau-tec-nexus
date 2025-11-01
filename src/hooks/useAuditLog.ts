import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface AuditLogEntry {
  action: string;
  entity_type: string;
  entity_id?: string;
  details?: any;
  ip_address?: string;
}

export function useAuditLog() {
  return useMutation({
    mutationFn: async (entry: AuditLogEntry) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase.from('audit_logs').insert({
        actor_id: user?.id || null,
        action: entry.action as any,
        entity_type: entry.entity_type,
        entity_id: entry.entity_id || null,
        details: entry.details || null,
        ip_address: entry.ip_address || null
      });

      if (error) throw error;
    }
  });
}
