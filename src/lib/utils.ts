import { type ClassValue, clsx } from "clsx";
import { User } from "realm-web";
import { twMerge } from "tailwind-merge";

import axios from "axios";

interface UserCustomData {
  userID?: string;
  email?: string;
  [key: string]: any;
}

export const fetchUserData = async (
  userID: string,
  email: string
): Promise<UserCustomData | null> => {
  const payload = {
    collectionName: "users",
    operation: "findOne",
    filter: {
      userID,
      "auth.email": email,
    },
  };

  try {
    const response = await axios.post(
      "https://api.kinscare.org/api/v1/auth/crud-operation",
      payload
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
};

export const fetchContactsData = async (
  userID: string,
  email: string
): Promise<UserCustomData | null> => {
  const payload = {
    collectionName: "contacts",
    operation: "findOne",
    filter: {
      userID,
       email,
    },
  };

  try {
    const response = await axios.post(
      "https://api.kinscare.org/api/v1/auth/crud-operation",
      payload
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const isAnon = (
  user: User<
    Realm.DefaultFunctionsFactory & Realm.BaseFunctionsFactory,
    { [x: string]: unknown },
    Realm.DefaultUserProfileData
  >
) => {
  return !user || user?.identities[0]?.providerType === "anon-user";
};

// mixpanel Utilities
import mixpanel from "./mixpanel";
// import Router from "next/router";
import { Dict } from "mixpanel-browser";

//  The inside events fired
export const trackEvents = (
  distinct_id: any,
  event: string,
  customValue: Dict | undefined
) => {
  mixpanel.track(event, {
    ...customValue,
    distinct_id,
  });
};

type DateInput = string | Date;

export function isTrialActive(trialStartDate: DateInput, trialEndDate: DateInput): boolean {
  try {
    // Parse input dates to JavaScript Date objects
    const startDate = new Date(trialStartDate);
    const endDate = new Date(trialEndDate);
    const currentDate = new Date();

    // Check for invalid dates
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      console.error("Invalid date format provided.");
      return false;
    }

    // Determine if the current date is within the trial period
    return currentDate >= startDate && currentDate <= endDate;
  } catch (error) {
    console.error("Error determining trial status:", error);
    return false;
  }
}

export const   convertISODateToNormal = (isoString: string | number | Date) => {
  const date = new Date(isoString);
  const options:any = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString(undefined, options); 
}