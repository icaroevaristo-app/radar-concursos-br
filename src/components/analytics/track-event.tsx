"use client";

import Link from "next/link";
import { useEffect } from "react";
import { analyticsConfig } from "@/lib/analytics/config";
import type { FunnelEventName } from "@/lib/funnel/events";

type EventMetadata = Record<string, string | number | boolean | null | undefined>;

declare global {
  interface Window {
    fbq?: (command: string, event: string, parameters?: Record<string, unknown>) => void;
    gtag?: (command: string, event: string, parameters?: Record<string, unknown>) => void;
  }
}

const metaEventNames: Partial<Record<FunnelEventName, string>> = {
  click_create_free_alert: "Lead",
  signup_completed: "CompleteRegistration",
  onboarding_completed: "CompleteRegistration",
  official_link_clicked: "Contact",
};

function sendGoogleAnalyticsEvent(event: FunnelEventName, metadata?: EventMetadata) {
  if (!analyticsConfig.gaMeasurementId || typeof window.gtag !== "function") {
    return;
  }

  window.gtag("event", event, {
    event_category: "funnel",
    ...metadata,
  });
}

function sendMetaPixelEvent(event: FunnelEventName, metadata?: EventMetadata) {
  if (!analyticsConfig.metaPixelId || typeof window.fbq !== "function") {
    return;
  }

  const metaEvent = metaEventNames[event] ?? "trackCustom";

  if (metaEvent === "trackCustom") {
    window.fbq("trackCustom", event, metadata);
    return;
  }

  window.fbq("track", metaEvent, metadata);
}

export function sendFunnelEvent(event: FunnelEventName, metadata?: EventMetadata) {
  const payload = JSON.stringify({ event, metadata });

  if (navigator.sendBeacon) {
    navigator.sendBeacon("/api/events", new Blob([payload], { type: "application/json" }));
  } else {
    void fetch("/api/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: payload,
      keepalive: true,
    });
  }

  sendGoogleAnalyticsEvent(event, metadata);
  sendMetaPixelEvent(event, metadata);
}

export function TrackEventOnMount({ event, metadata }: { event: FunnelEventName; metadata?: EventMetadata }) {
  useEffect(() => {
    sendFunnelEvent(event, metadata);
  }, [event, metadata]);

  return null;
}

type TrackedLinkProps = {
  children: React.ReactNode;
  className?: string;
  event: FunnelEventName;
  href: string;
  metadata?: EventMetadata;
  target?: string;
};

export function TrackedLink({ children, className, event, href, metadata, target }: TrackedLinkProps) {
  return (
    <Link
      className={className}
      href={href}
      onClick={() => sendFunnelEvent(event, metadata)}
      target={target}
    >
      {children}
    </Link>
  );
}
