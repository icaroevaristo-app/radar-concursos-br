import type { Json } from "@/lib/supabase/types";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

type LogAdminActionInput = {
  actorId: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  before?: Json | null;
  after?: Json | null;
};

export async function logAdminAction(supabase: SupabaseClient<Database>, input: LogAdminActionInput) {
  return supabase.from("audit_logs").insert({
    actor_id: input.actorId,
    action: input.action,
    entity_type: input.entityType,
    entity_id: input.entityId ?? null,
    before: input.before ?? null,
    after: input.after ?? null,
  });
}

export function toJson(value: unknown): Json {
  return JSON.parse(JSON.stringify(value)) as Json;
}
