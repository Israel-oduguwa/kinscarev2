import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: false,
  async headers() {
    const cspReportOnly = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:",
      "style-src 'self' 'unsafe-inline' https:",
      "img-src 'self' data: https: blob:",
      "font-src 'self' data: https:",
      "connect-src 'self' https: wss:",
      "frame-src 'self' https:",
      "base-uri 'self'",
      "frame-ancestors 'self'",
      "object-src 'none'",
      "upgrade-insecure-requests",
    ]
      .join("; ");

    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy-Report-Only",
            value: cspReportOnly,
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value:
              "accelerometer=(), camera=(), geolocation=(), gyroscope=(), microphone=(), payment=(), usb=()",
          },
        ],
      },
    ];
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // Allow any domain
      },
    ],
  },
    env: {
    GOOGLE_ANALYTICS_ID: process.env.GOOGLE_ANALYTICS_ID,
    MIXPANEL_TOKEN: process.env.MIXPANEL_TOKEN,
    IPAPI_KEY: process.env.IPAPI_KEY,
    PASSWORD_KEY: process.env.PASSWORD_KEY,
    CUSTOMERIO_API_KEY: process.env.CUSTOMERIO_API_KEY,
    SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
    // For Stripe keys, choose live keys in production and test keys in development:
    STRIPE_PUBLIC_KEY:
      process.env.NODE_ENV === "production"
        ? process.env.STRIPE_PUBLIC_KEY
        : process.env.STRIPE_PUBLIC_KEY,
    STRIPE_SECRET_KEY:
      process.env.NODE_ENV === "production"
        ?process.env.STRIPE_SECRETE_KEY
        :process.env.STRIPE_SECRETE_KEY,
    GTM_KEY: process.env.GTM_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    REALM_ID: process.env.REALM_ID,
    GOOGLE_APP_ID: process.env.GOOGLE_APP_ID,
    FACEBOOK_ID: process.env.FACEBOOK_ID,
    MANDRIL_API: process.env.MANDRIL_API,
    TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
    TWILIO_ACCOUNT_AUTH_TOKEN: process.env.TWILIO_ACCOUNT_AUTH_TOKEN,
    TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER,
    TWILIO_API_KEY: process.env.TWILIO_API_KEY,
    TWILIO_API_SECRET: process.env.TWILIO_API_SECRET,
    TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
    FACEBOOK_BUSSINESS_AUTH: process.env.FACEBOOK_BUSSINESS_AUTH,
    INTERCOM_APP_ID:process.env.INTERCOM_APP_ID,
    NEXT_PUBLIC_KINSCARE_API_URL: process.env.NEXT_PUBLIC_KINSCARE_API_URL,
    KINSCARE_API_URL:process.env.KINSCARE_API_URL,
  },
};

export default nextConfig;
