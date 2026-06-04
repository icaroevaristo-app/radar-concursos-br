import { describe, expect, it } from "vitest";
import { getTrialDaysRemaining, isSubscriptionPremium } from "@/lib/subscriptions/status";

const now = new Date("2026-06-04T12:00:00.000Z");

describe("subscription status", () => {
  it("treats active subscription without period end as premium", () => {
    expect(
      isSubscriptionPremium(
        {
          status: "active",
          trial_end: null,
          current_period_end: null,
        },
        now,
      ),
    ).toBe(true);
  });

  it("treats active subscription with future period end as premium", () => {
    expect(
      isSubscriptionPremium(
        {
          status: "active",
          trial_end: null,
          current_period_end: "2026-07-04T12:00:00.000Z",
        },
        now,
      ),
    ).toBe(true);
  });

  it("treats active subscription with expired period end as non-premium", () => {
    expect(
      isSubscriptionPremium(
        {
          status: "active",
          trial_end: null,
          current_period_end: "2026-06-03T12:00:00.000Z",
        },
        now,
      ),
    ).toBe(false);
  });

  it("treats trialing subscription with future trial end as premium", () => {
    expect(
      isSubscriptionPremium(
        {
          status: "trialing",
          trial_end: "2026-06-11T12:00:00.000Z",
          current_period_end: null,
        },
        now,
      ),
    ).toBe(true);
  });

  it("treats expired trial as non-premium", () => {
    expect(
      isSubscriptionPremium(
        {
          status: "trialing",
          trial_end: "2026-06-03T12:00:00.000Z",
          current_period_end: null,
        },
        now,
      ),
    ).toBe(false);
  });

  it("returns remaining trial days rounded up", () => {
    expect(getTrialDaysRemaining({ status: "trialing", trial_end: "2026-06-06T11:00:00.000Z" }, now)).toBe(2);
  });
});
