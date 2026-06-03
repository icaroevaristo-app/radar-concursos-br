"use client";

import Link from "next/link";
import { useEffect } from "react";
import type { FunnelEventName } from "@/lib/funnel/events";

type EventMetadata = Record<string, string | number | boolean | null | undefined>;

function sendFunnelEvent(event: FunnelEventName, metadata?: EventMetadata) {
  const payload = JSON.stringify({ event, metadata });

  if (navigator.sendBeacon) {
    navigator.sendBeacon("/api/events", new Blob([payload], { type: "application/json" }));
    return;
  }

  void fetch("/api/events", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: payload,
    keepalive: true,
  });
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
