import { describe, expect, it } from "vitest";
import { isFunnelEventName, sanitizeFunnelMetadata } from "@/lib/funnel/events";

describe("funnel events", () => {
  it("accepts only known funnel events", () => {
    expect(isFunnelEventName("landing_view")).toBe(true);
    expect(isFunnelEventName("click_create_free_alert")).toBe(true);
    expect(isFunnelEventName("signup_completed")).toBe(true);
    expect(isFunnelEventName("official_link_clicked")).toBe(true);
    expect(isFunnelEventName("preferences_updated")).toBe(true);
    expect(isFunnelEventName("unknown_event")).toBe(false);
  });

  it("keeps only primitive metadata values", () => {
    expect(
      sanitizeFunnelMetadata({
        location: "hero",
        count: 1,
        enabled: true,
        nested: { value: "ignored" },
        list: ["ignored"],
      }),
    ).toEqual({
      location: "hero",
      count: 1,
      enabled: true,
    });
  });
});
