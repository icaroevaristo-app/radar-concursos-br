import Script from "next/script";
import { analyticsConfig } from "@/lib/analytics/config";
import { AnalyticsPageView } from "@/components/analytics/analytics-page-view";

export function AnalyticsScripts() {
  return (
    <>
      {analyticsConfig.gaMeasurementId ? (
        <>
          <Script
            id="ga4-loader"
            src={`https://www.googletagmanager.com/gtag/js?id=${analyticsConfig.gaMeasurementId}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              window.gtag = window.gtag || gtag;
              gtag('js', new Date());
              gtag('config', '${analyticsConfig.gaMeasurementId}', { send_page_view: false });
            `}
          </Script>
        </>
      ) : null}

      {analyticsConfig.metaPixelId ? (
        <Script id="meta-pixel-init" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${analyticsConfig.metaPixelId}');
          `}
        </Script>
      ) : null}
      <AnalyticsPageView />
    </>
  );
}
