import { ThemeProvider } from "@/lib/Theme";
import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import Script from "next/script";
import NextTopLoader from "nextjs-toploader";
import { Toaster } from "sonner";
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
import ContextProviders from "@/components/contextProviders/ContextProviders";
import AuthProvider from "@/components/contextProviders/AuthProvider";
import ClientSideWidgets from "@/components/contextProviders/ClientSideWidgets";
import CookieConsentBanner from "@/Utils/CookieConsentBanner";

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
      { url: "/favicon.ico" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
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
      appearance={{
        cssLayerName: "clerk",
      }}
      localization={{
        signUp: {
          start: {
            title: "Create Your KinsCare Account",
            subtitle:
              "Find compassionate, verified caregivers who treat your loved ones like family. Join KinsCare today — where care meets trust.",
          },
        },
        signIn: {
          start: {
            title: "Welcome Back to KinsCare",
            subtitle:
              "Access your caregiver dashboard and continue providing or receiving exceptional care.",
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
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <AuthProvider>
              <Toaster position="top-right" richColors />
               <SpeedInsights />

              <ContextProviders>
                <ClientSideWidgets />
                <CookieConsentBanner />
                {children}
              </ContextProviders>
            </AuthProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
