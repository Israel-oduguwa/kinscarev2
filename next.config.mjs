/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    eslint: {
        // Warning: This allows production builds to successfully complete even if
        // your project has ESLint errors.
        ignoreDuringBuilds: true,
    },
    typescript: {
        // !! WARN !!
        // Dangerously allow production builds to successfully complete even if
        // your project has type errors.
        // !! WARN !!
        ignoreBuildErrors: true,
    },
    // images: {
    //     domains: ['firebasestorage.googleapis.com'],
    // },
    images: {
        remotePatterns: [
          {
            protocol: "https",
            hostname: "**", // Allow any domain
          },
        ],
      },
    env: {
        GOOGLE_ANALYTICS_ID: "G-Y94DN6XWN3",
        MIXPANEL_TOKEN:"cd4c57a1381072532607d8bad65b9c00",
        IPAPI_KEY:"b4edc01b56d1f59a053bd88eba5a2c73",
        PASSWORD_KEY:"kinscareisaonlineregistryofcaregiversandproviderswith500000+usersandmillionsinrevenue",
        CUSTOMERIO_API_KEY: "597b44bb3e15827eb48573406022562f",
        SENDGRID_API_KEY:
            "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",
        STRIPE_PUBLIC_TEST_KEY:"pk_test_51KzQg6AoahxG9SLGESpHVcOxWL1PpnsEpvFusy1BdQ1iXLlNHZLjuzvpBmuZGUg798rnTimYfDCsRqMHBOvUrTse00GRInaoCZ",
        STRIPE_TEST_SECRETE:
            "sk_test_51KzQg6AoahxG9SLGLdejdNMSzoo1JZI7qA83sjiyrCTSeVcbsA5ShNbD7tan14k22Go2j2gx8hAt7i1Wi8s7vfr400V9OnGrof",
        STRIPE_SECRETE_KEY:
            "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",
        STRIPE_PUBLIC_KEY:
            "pk_live_51KzQg6AoahxG9SLGENCmds3Uw8twUl8m7hgZuSCRF3rk0eFirMjSqGu3epWZF7u4dpJqcGHOkt1akvpjUziVCyyN00LtijfRyQ",
        GTM_KEY: "GTM-WJ9XKTWL",//"GTM-M8V38DH",
        STRIPE_WEBHOOK_SECRET: "whsec_iqGUatggNxsKbDQbntpEYpGMXYxtsJVo",
        REALM_ID: "zororo-realm-oqesd",
        GOOGLE_APP_ID:
            "101882100979-8joqqf0h0lkd46tgelnooacjkia3h28t.apps.googleusercontent.com",
        FACEBOOK_ID: "765188364849485",
        MANDRIL_API: "md-9AUkHc-t1N_o8LFGZ9YK0Q",
        TWILIO_ACCOUNT_SID: "ACf74503b1d79d4249214a626c95f3c7b2",
        TWILIO_ACCOUNT_AUTH_TOKEN: "35fea1036f93945a92f915bfad682307",
        TWILIO_PHONE_NUMBER: "12063097500",
        TWILIO_API_KEY: "SKdfadda41e726e64f4d666c43055769a3",
        TWILIO_API_SECRET: "iBomnvXKIDExGmztKlL5njhHuGQTx4OK",
        TWILIO_AUTH_TOKEN: "35fea1036f93945a92f915bfad682307",
        FACEBOOK_BUSSINESS_AUTH:
            "EAAJNvSPoatABO5TTzlCiReobZBjBVs3fpWtY9ueWlZC2hzyDEgAbQSpNg1hKt5nuxEnclt7Y5nkLWDTh4vBEHP10eCdUFTBLxwDLOQzufz6x2AIs1AZC7QlZAz21IfkslM2DhlW7Q9IgIL8vVPt3dRvCJ6ddtlU5tNVF9n3HxiRZBx1IRp3LPl1KRBkDC7HoF4AZDZD",
    },
};

export default nextConfig;
