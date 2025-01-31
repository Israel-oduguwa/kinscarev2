import VoiceFlowProvider from "@/Caregivers/UiProviders/VoiceFlowProvider";
import ContextProviders from "@/components/ContextProviders";
import MongoProvider from "@/components/MongoProvider";
import { Toaster } from "@/components/ui/toaster";
import { initializeGTM } from "@/lib/gtm";
import { ThemeProvider } from "@/lib/Theme";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import Script from "next/script";
import NextTopLoader from "nextjs-toploader";
import "./globals.css";
import { Metadata } from "next";
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
  // const gtmId = "GTM-MS7zR3S6H" //process.env.NEXT_PUBLIC_GTM_ID; // Add GTM ID in .env.local
  // // Initialize GTM dynamically
  // if (typeof window !== 'undefined' && gtmId) {
  //   initializeGTM(gtmId);
  // }
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        <link
          rel="stylesheet"
          href="//cdn.jsdelivr.net/gh/dmhendricks/bootstrap-grid-css@4.1.3/dist/css/bootstrap-grid.min.css"
        />
        <Script
          strategy="afterInteractive" // Ensures script loads after the page is interactive
          src="https://www.googletagmanager.com/gtag/js?id=AW-11302908567"
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'AW-11302908567');
            `,
          }}
        />
      </head>
      <body className={`${inter.className} ${headingFont.variable}`}>
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
          <MongoProvider>
            <SpeedInsights />
            <Toaster />
            <VoiceFlowProvider>
              <ContextProviders>{children}</ContextProviders>
            </VoiceFlowProvider>
          </MongoProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

// https://shadcn-ui-blocks.vercel.app/#marketing
