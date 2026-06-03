export const funnelEvents = [
  "landing_view",
  "click_create_free_alert",
  "click_view_contests",
  "signup_started",
  "onboarding_completed",
  "contest_viewed",
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
