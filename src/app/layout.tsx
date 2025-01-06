import type { Metadata } from "next";
import { Inter, DM_Sans, Montserrat, Outfit } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/lib/Theme";
import { SpeedInsights } from "@vercel/speed-insights/next";
import ActivityTracker from "@/components/ActivityTracker";
import MongoProvider from "@/components/MongoProvider";
import GoogleTagManager from "@/components/GoogleTagManager";
import { Toaster } from "@/components/ui/toaster";
import ContextProviders from "@/components/ContextProviders";
import NextTopLoader from "nextjs-toploader";
import VoiceFlowProvider from "@/Caregivers/UiProviders/VoiceFlowProvider";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        <link
          rel="stylesheet"
          href="//cdn.jsdelivr.net/gh/dmhendricks/bootstrap-grid-css@4.1.3/dist/css/bootstrap-grid.min.css"
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
