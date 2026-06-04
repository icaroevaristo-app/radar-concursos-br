import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSubscriptionPremium } from "@/lib/subscriptions/status";
import type { SubscriptionRow } from "@/lib/subscriptions/types";
export { getTrialDaysRemaining, isSubscriptionPremium } from "@/lib/subscriptions/status";

export async function getUserSubscription(userId: string) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.from("subscriptions").select("*").eq("user_id", userId).maybeSingle();

  return {
    subscription: data as SubscriptionRow | null,
    error,
  };
}

export async function isUserPremium(userId: string) {
  const { subscription } = await getUserSubscription(userId);
  return isSubscriptionPremium(subscription);
}
