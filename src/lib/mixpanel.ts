import mixpanel from "mixpanel-browser";
// Initialize Mixpanel with your project token
const mixpanel_token: any = process.env.MIXPANEL_TOKEN;
mixpanel.init(mixpanel_token, {
  debug: true,
  track_pageview: true,
  persistence: "localStorage",
});

export default mixpanel;
