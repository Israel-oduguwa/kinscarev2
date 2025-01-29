import mixpanel from "mixpanel-browser";

// Initialize Mixpanel with your project token
const mixpanel_token: string | undefined = process.env.MIXPANEL_TOKEN;
if (mixpanel_token) {
  mixpanel.init(mixpanel_token, {
    debug: true,
    track_pageview: true,
    persistence: "localStorage",
    session_recording: {
      network: true,
      input: true,
      scroll: true,
      mouse: true,
      clicks: true,
    },
  });

  console.log("Mixpanel initialized with Session Replay enabled");
} else {
  console.error("Mixpanel token is missing!");
}

export default mixpanel;
