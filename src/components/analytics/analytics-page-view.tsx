"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { analyticsConfig } from "@/lib/analytics/config";

export function AnalyticsPageView() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;

    if (analyticsConfig.gaMeasurementId && typeof window.gtag === "function") {
      window.gtag("config", analyticsConfig.gaMeasurementId, {
        page_path: pathname,
      });
    }

    if (analyticsConfig.metaPixelId && typeof window.fbq === "function") {
      window.fbq("track", "PageView", {
        page_path: pathname,
      });
    }
  }, [pathname]);

  return null;
}
