import "server-only";

import { hydrateContestsByIds } from "@/lib/contests/queries";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSubscriptionPremium } from "@/lib/subscriptions/status";
import { createWhatsAppLink, hasBasicWhatsAppMatch, isLikelyValidWhatsAppPhone } from "@/lib/whatsapp/helpers";
import type { SubscriptionRow } from "@/lib/subscriptions/types";
import type { ContestRow, ProfileRow, UserPreferenceRow } from "@/types/contest";
import type { WhatsAppAlertRow } from "@/lib/whatsapp/types";

export type AdminWhatsAppAlertRow = WhatsAppAlertRow & {
  contest: Pick<ContestRow, "id" | "title" | "city" | "state"> | null;
  profile: Pick<ProfileRow, "id" | "full_name" | "email"> | null;
  whatsappUrl: string | null;
};

export async function getAdminWhatsAppAlerts() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.from("whatsapp_alerts").select("*").order("created_at", { ascending: false }).limit(100);
  const alerts = (data ?? []) as WhatsAppAlertRow[];
  const userIds = [...new Set(alerts.map((alert) => alert.user_id))];
  const contestIds = [...new Set(alerts.map((alert) => alert.contest_id))];

  const [{ data: profiles }, { data: contests }] = await Promise.all([
    userIds.length ? supabase.from("profiles").select("id, full_name, email").in("id", userIds) : Promise.resolve({ data: [] }),
    contestIds.length ? supabase.from("contests").select("id, title, city, state").in("id", contestIds) : Promise.resolve({ data: [] }),
  ]);

  const profilesById = new Map((profiles ?? []).map((profile) => [profile.id, profile]));
  const contestsById = new Map((contests ?? []).map((contest) => [contest.id, contest]));

  return {
    alerts: alerts.map((alert) => ({
      ...alert,
      profile: profilesById.get(alert.user_id) ?? null,
      contest: contestsById.get(alert.contest_id) ?? null,
      whatsappUrl: createWhatsAppLink(alert.phone, alert.message),
    })) as AdminWhatsAppAlertRow[],
    error,
  };
}

export async function getWhatsAppContestOptions() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("contests")
    .select("*")
    .eq("publication_status", "published")
    .in("status", ["open", "upcoming"])
    .order("created_at", { ascending: false });

  return { contests: (data ?? []) as ContestRow[], error };
}

export async function getWhatsAppEligiblePreview(contestId: string | null) {
  if (!contestId) {
    return {
      contest: null,
      eligibleUsers: [] as Array<{ userId: string; name: string; email: string | null; phone: string }>,
      existingCount: 0,
    };
  }

  const supabase = await createServerSupabaseClient();
  const [contest] = await hydrateContestsByIds([contestId]);

  if (!contest) {
    return { contest: null, eligibleUsers: [], existingCount: 0 };
  }

  const [{ data: subscriptions }, { data: existingAlerts }] = await Promise.all([
    supabase.from("subscriptions").select("*").in("status", ["trialing", "active"]),
    supabase.from("whatsapp_alerts").select("user_id").eq("contest_id", contestId),
  ]);

  const premiumUserIds = ((subscriptions ?? []) as SubscriptionRow[])
    .filter((subscription) => isSubscriptionPremium(subscription))
    .map((subscription) => subscription.user_id);
  const existingUserIds = new Set((existingAlerts ?? []).map((alert) => alert.user_id));

  if (!premiumUserIds.length) {
    return { contest, eligibleUsers: [], existingCount: existingUserIds.size };
  }

  const [{ data: profiles }, { data: preferences }] = await Promise.all([
    supabase.from("profiles").select("id, full_name, email, city, state, education_level").in("id", premiumUserIds),
    supabase.from("user_preferences").select("*").in("user_id", premiumUserIds).eq("whatsapp_opt_in", true),
  ]);

  const profilesById = new Map(((profiles ?? []) as ProfileRow[]).map((profile) => [profile.id, profile]));
  const eligibleUsers = ((preferences ?? []) as UserPreferenceRow[])
    .filter((preference) => !existingUserIds.has(preference.user_id))
    .filter((preference) => isLikelyValidWhatsAppPhone(preference.whatsapp_phone))
    .filter((preference) => hasBasicWhatsAppMatch(contest, profilesById.get(preference.user_id) ?? null, preference))
    .map((preference) => {
      const profile = profilesById.get(preference.user_id);
      return {
        userId: preference.user_id,
        name: profile?.full_name ?? profile?.email ?? preference.user_id,
        email: profile?.email ?? null,
        phone: preference.whatsapp_phone ?? "",
      };
    });

  return { contest, eligibleUsers, existingCount: existingUserIds.size };
}
