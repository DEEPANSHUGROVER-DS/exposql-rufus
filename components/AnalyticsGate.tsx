"use client";

import Script from "next/script";
import { useCookieConsent } from "./CookieConsent";

/**
 * Gate for third-party analytics. Only mounts the GA4 / GTM script tags when:
 *   1. The user has consented to the "analytics" category, AND
 *   2. The relevant env var is set at build time.
 *
 * Today nothing is wired in (no GA4_ID env set), so this renders nothing.
 * When you add `NEXT_PUBLIC_GA4_ID` (or `NEXT_PUBLIC_GTM_ID`) to Vercel, the
 * scripts start loading — but ONLY for visitors who clicked "Accept all" or
 * toggled Analytics on. Visitors who rejected, or whose browser sent
 * Global Privacy Control, never trigger a network call.
 */
export function AnalyticsGate() {
  const { consent } = useCookieConsent();
  const ga4 = process.env.NEXT_PUBLIC_GA4_ID;
  const gtm = process.env.NEXT_PUBLIC_GTM_ID;

  if (!consent.analytics) return null;
  if (!ga4 && !gtm) return null;

  return (
    <>
      {ga4 && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${ga4}`} strategy="afterInteractive" />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${ga4}', { anonymize_ip: true });
            `}
          </Script>
        </>
      )}
      {gtm && (
        <Script id="gtm-init" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${gtm}');
          `}
        </Script>
      )}
    </>
  );
}
