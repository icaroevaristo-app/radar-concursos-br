export const funnelEvents = [
  "landing_view",
  "click_create_free_alert",
  "click_view_contests",
  "contest_list_viewed",
  "contest_card_clicked",
  "signup_started",
  "signup_completed",
  "onboarding_completed",
  "contest_viewed",
  "official_link_clicked",
  "preferences_viewed",
  "preferences_updated",
] as const;

export type FunnelEventName = (typeof funnelEvents)[number];

export function isFunnelEventName(value: unknown): value is FunnelEventName {
  return typeof value === "string" && funnelEvents.includes(value as FunnelEventName);
}

export function sanitizeFunnelMetadata(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .filter(([, metadataValue]) => ["string", "number", "boolean"].includes(typeof metadataValue))
      .slice(0, 12),
  );
}
