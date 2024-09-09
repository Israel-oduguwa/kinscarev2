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
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <MongoProvider>
            <SpeedInsights />
            <Toaster /> 
            <ContextProviders>{children}</ContextProviders>
          </MongoProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
