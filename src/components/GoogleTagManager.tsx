import Script from "next/script";
import { useEffect } from "react";
import TagManager from "react-gtm-module"

const GTM_KEY = "GTM-MS7R3S6H"
const GoogleTagManager = () => {
  useEffect(() => {
    TagManager.initialize({ gtmId: GTM_KEY });
  }, []);

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${process.env.GOOGLE_ANALYTICS_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics-script" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${process.env.GOOGLE_ANALYTICS_ID}', {
            page_path: window.location.pathname,
          });
        `}
      </Script>
    </>
  );
};

export default GoogleTagManager;
