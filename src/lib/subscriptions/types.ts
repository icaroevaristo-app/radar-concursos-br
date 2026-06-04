import type { Database } from "@/lib/supabase/types";

export type SubscriptionRow = Database["public"]["Tables"]["subscriptions"]["Row"];
export type SubscriptionStatus = SubscriptionRow["status"];
