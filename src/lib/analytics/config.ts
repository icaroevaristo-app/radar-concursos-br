export const analyticsConfig = {
  gaMeasurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "",
  metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID || "",
};

export function isGoogleAnalyticsEnabled() {
  return Boolean(analyticsConfig.gaMeasurementId);
}

export function isMetaPixelEnabled() {
  return Boolean(analyticsConfig.metaPixelId);
}
