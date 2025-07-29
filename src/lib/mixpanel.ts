// import mixpanel from "mixpanel-browser";

// // Initialize Mixpanel with your project token
// const mixpanel_token: string | undefined = process.env.MIXPANEL_TOKEN;
// if (mixpanel_token) {
//   mixpanel.init(mixpanel_token, {
//     autocapture:true
//     // debug: true,
//     // track_pageview: true,
//     // persistence: "localStorage",
//     // session_recording: {
//     //   network: true,
//     //   input: true,
//     //   scroll: true,
//     //   mouse: true,
//     //   clicks: true,
//     // },
//   });

//   // console.log("Mixpanel initialized with Session Replay enabled");
// } else {
//   console.error("Mixpanel token is missing!");
// }

// export default mixpanel;

import mixpanel from "mixpanel-browser";

const MIXPANEL_TOKEN = process.env.MIXPANEL_TOKEN;

export const initMixpanel = () => {
  if (!MIXPANEL_TOKEN) {
    console.warn("Mixpanel token is missing! Check your .env file.");
    return;
  }

  mixpanel.init(MIXPANEL_TOKEN, {
    autocapture: true,
    track_pageview: true,
    persistence: "localStorage",
    record_sessions_percent: 20,
    record_heatmap_data: true   // Enable Heatmap data collection
  });
  // mixpanel.start_session_recording();
};
export { mixpanel };
