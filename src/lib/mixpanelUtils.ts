import { Dict } from "mixpanel-browser";
import mixpanel from "./mixpanel"

interface EventProperties {
  [key: string]: any;
}

interface IdentifyUserProps {
  distinct_id: string;
  isLoggedIn: boolean;
  userDetails?: {
    $first_name?: string;
    $last_name?: string;
    $email?: string;
    [key: string]: any;
  };
}

declare global {
    interface Window {
      gtag?: (...args: any[]) => void;
    }
  }
  
/**
 * Identify a user with Mixpanel
 * @param {IdentifyUserProps} params
 */
export const identifyUser = ({ distinct_id, isLoggedIn, userDetails }: IdentifyUserProps): void => {
  // Set distinct_id for tracking anonymous or logged-in users
  mixpanel.identify(distinct_id);

  if (isLoggedIn && userDetails) {
    // Set user properties for logged-in users
    mixpanel.people.set({
      ...userDetails,
    });
  } else {
    // Track distinct_id only for anonymous users
    mixpanel.people.set({
      distinct_id,
      status: 'anonymous',
    });
  }
};



/**
 * Track events with Mixpanel

 */


  
  type TrackEvent = (
    distinctId: string | undefined,
    eventName: string,
    payload: any
  ) => void;

  
export const trackEvent: TrackEvent = (distinctId, eventName, payload) => {
    console.log(distinctId, eventName, payload)
    if (!distinctId) {
      console.error("Distinct ID is required for Mixpanel tracking.");
      return;
    }
    if (!eventName) {
      console.error("Event name is required for Mixpanel tracking.");
      return;
    }
  
    // Track the event in Mixpanel
    mixpanel.track(eventName, {
      distinct_id: distinctId,
      ...payload,
    });
  
    console.log(`Tracked event: ${eventName} with payload:`, payload);
  
    // Optional: Trigger Google Ads conversion for specific events
    if (eventName === "Sign In") {
      if (typeof window !== "undefined" && window.gtag) {
        window.gtag("event", "conversion", {
          send_to: "AW-11302908567/v0dpCLnB14EaEJfl0o0q", // Replace with your Conversion ID/Label
          value: 1.0, // Optional: Conversion value
          currency: "USD", // Optional: Currency
        });
        console.log("Triggered Google Ads conversion for 'Sign In'.");
      }
    }
  };