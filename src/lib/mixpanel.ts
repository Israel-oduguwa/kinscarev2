import mixpanel from "mixpanel-browser";
// Initialize Mixpanel with your project token
const mixpanel_token: any = process.env.MIXPANEL_TOKEN;
mixpanel.init(mixpanel_token);

export default mixpanel;
