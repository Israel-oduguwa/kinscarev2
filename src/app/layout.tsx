/* eslint-disable @next/next/no-css-tags */
import ChatWidgetUI from "@/ChatWidgets/ChatWidgetUI";
import ContextProviders from "@/components/ContextProviders";
import MongoProvider from "@/components/MongoProvider";
import MixpanelProvider from "@/lib/MixpanelProvider";
import { ThemeProvider } from "@/lib/Theme";
import IntercomProvider from "@/Providers/Utils/IntercomLoader";
import CookieConsentBanner from "@/Utils/CookieConsentBanner";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import localFont from "next/font/local";
import Script from "next/script";
import NextTopLoader from "nextjs-toploader";
import { Toaster } from "sonner";
import "./globals.css";
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const headingFont = localFont({
  src: "./CalSans-SemiBold.woff2",
  display: "swap",
  variable: "--header-font",
});
// const intercomAppId:any = process.env.INTERCOM_APP_ID!;
export const metadata: Metadata = {
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      localization={{
        signUp: {
          start: {
            title: "Create Your Account to join Kinscare",
            subtitle: "",
          },
        },
        signIn: {
          start: {
            title: "Welcome back to KinsCare",
            subtitle: "Sign in to continue your journey.",
          },
        },
      }}
    >
      <html suppressHydrationWarning lang="en">
        <head>
          <Script
            id="google-analytics"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s);j.async=true;j.src="https://sst.kinscare.org/d846jafydtvd.js?"+i;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','2n0=aWQ9R1RNLVdKOVhLVFdM&page=3');`,
            }}
          />
        </head>
        <body className={`${inter.className} ${headingFont.variable}`}>
          <noscript>
            <iframe
              src="https://sst.kinscare.org/ns.html?id=GTM-WJ9XKTWL"
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            ></iframe>
          </noscript>
          <NextTopLoader
            color="#2299DD"
            initialPosition={0.08}
            crawlSpeed={200}
            height={3}
            crawl={true}
            showSpinner={true}
            easing="ease"
            speed={200}
            shadow="0 0 10px #2299DD,0 0 5px #2299DD"
          />
          <MixpanelProvider />
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <MongoProvider>
              <SpeedInsights />
              <Toaster position="top-right" richColors />

              <ContextProviders>
                {" "}
                {/* <VoiceFlowProvider> */}
                <IntercomProvider />
                {/* Run the cookie consent  */}
                <CookieConsentBanner />
                {/* Layout UI */}
                {/* <JumpstartBannerTop ctaHref="/jumpstart" /> */}
                <ChatWidgetUI />
                {children}
                {/* </VoiceFlowProvider> */}
              </ContextProviders>
            </MongoProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
