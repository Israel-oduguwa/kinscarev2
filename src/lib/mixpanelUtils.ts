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
 * @param {string} distinct_id
 * @param {string} event
 * @param {EventProperties} customValue
 */
export const trackEvent = (distinct_id: string, event: string, customValue: EventProperties = {}): void => {
  mixpanel.track(event, {
    ...customValue,
    distinct_id,
  });
};
