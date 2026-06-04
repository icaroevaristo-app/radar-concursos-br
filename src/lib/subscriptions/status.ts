import type { SubscriptionRow } from "@/lib/subscriptions/types";

export function isSubscriptionPremium(subscription: Pick<SubscriptionRow, "status" | "trial_end" | "current_period_end"> | null, now = new Date()) {
  if (!subscription) return false;

  if (subscription.status === "trialing") {
    return Boolean(subscription.trial_end && new Date(subscription.trial_end).getTime() > now.getTime());
  }

  if (subscription.status === "active") {
    return !subscription.current_period_end || new Date(subscription.current_period_end).getTime() > now.getTime();
  }

  return false;
}

export function getTrialDaysRemaining(subscription: Pick<SubscriptionRow, "status" | "trial_end"> | null, now = new Date()) {
  if (!subscription?.trial_end || subscription.status !== "trialing") return 0;

  const remainingMs = new Date(subscription.trial_end).getTime() - now.getTime();
  return Math.max(0, Math.ceil(remainingMs / (1000 * 60 * 60 * 24)));
}
