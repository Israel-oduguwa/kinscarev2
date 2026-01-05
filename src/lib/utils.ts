import { type ClassValue, clsx } from "clsx";

import { twMerge } from "tailwind-merge";

import axios, { type AxiosInstance } from "axios";

interface UserCustomData {
  userID?: string;
  email?: string;
  [key: string]: any;
}

const DEFAULT_API_BASE_URL = "https://jrp7pe2xhj.us-east-1.awsapprunner.com";

const getDefaultApiClient = () =>
  axios.create({
    baseURL: DEFAULT_API_BASE_URL,
  });

export function fetchUserData(
  privateApi: AxiosInstance,
  userID: string,
  email: string
): Promise<UserCustomData | null>;
export function fetchUserData(
  userID: string,
  email: string
): Promise<UserCustomData | null>;
export async function fetchUserData(
  apiOrUserID: AxiosInstance | string,
  userIDOrEmail: string,
  maybeEmail?: string
): Promise<UserCustomData | null> {
  const isClient =
    typeof apiOrUserID !== "string" && typeof apiOrUserID?.post === "function";
  const privateApi = isClient ? apiOrUserID : getDefaultApiClient();
  const userID = isClient ? userIDOrEmail : apiOrUserID;
  const email = isClient ? maybeEmail : userIDOrEmail;
  const payload = {
    collectionName: "users",
    operation: "findOne",
    filter: {
      userID,
      "auth.email": email,
    },
  };

  try {
    const response = await privateApi.post(
      "/api/v1/auth/crud-operation",
      payload
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
}

export function fetchContactsData(
  privateApi: AxiosInstance,
  userID: string,
  email: string
): Promise<UserCustomData | null>;
export function fetchContactsData(
  userID: string,
  email: string
): Promise<UserCustomData | null>;
export async function fetchContactsData(
  apiOrUserID: AxiosInstance | string,
  userIDOrEmail: string,
  maybeEmail?: string
): Promise<UserCustomData | null> {
  const isClient =
    typeof apiOrUserID !== "string" && typeof apiOrUserID?.post === "function";
  const privateApi = isClient ? apiOrUserID : getDefaultApiClient();
  const userID = isClient ? userIDOrEmail : apiOrUserID;
  const email = isClient ? maybeEmail : userIDOrEmail;
  const payload = {
    collectionName: "contacts",
    operation: "findOne",
    filter: {
      userID,
       email,
    },
  };

  try {
    const response = await privateApi.post(
      "/api/v1/auth/crud-operation",
      payload
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching contact data:", error);
    return null;
  }
}



export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// get the accessToken 
export async function getValidAccessTokenFromContext(user:any) {
  if (!user) throw new Error("User not logged in");
  await user.refreshAccessToken();
  return user.accessToken;
}

// mixpanel Utilities
import { mixpanel } from "./mixpanel";
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

export const updateMixpanelProfile = (
  properties: Dict | undefined
) => {
  if (!properties) return;

  mixpanel.people.set({
    ...properties,
  });

  // console.log("✅ Updated user profile in Mixpanel:", properties);
};
type DateInput = string | Date;

export function isTrialActive(trialStartDate: DateInput, trialEndDate: DateInput): boolean {
  try {
    // Parse input dates to JavaScript Date objects
    const startDate = trialStartDate ? new Date(trialStartDate) : null;
    const endDate = trialEndDate ? new Date(trialEndDate) : null;
    const currentDate = new Date();

    // Check for invalid dates
    if (!startDate || !endDate || isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
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

export function getChatAccess(contact: any) {
  const trialActive =
    contact?.trial === true &&
    contact?.trial_expired !== true &&
    (!contact?.trial_end_date ||
      new Date(contact.trial_end_date) >= new Date());

  const trialExpiredLegacy =
    contact?.trial === "expired" ||
    contact?.trial_status === "expired" ||
    contact?.trial_expired === true;

  const subscriptionActive =
    ["active", "trialing", "complete", "paid", "authorized"].includes(
      `${contact?.subscription_status || ""}`.toLowerCase()
    ) &&
    (!contact?.subscription_end_date ||
      new Date(contact.subscription_end_date) >= new Date());

  const canChat = trialActive || subscriptionActive;

  return {
    trialActive,
    trialExpiredLegacy,
    subscriptionActive,
    canChat,
  };
}

export const   convertISODateToNormal = (isoString: string | number | Date) => {
  const date = new Date(isoString);
  const options:any = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString(undefined, options); 
}

export function truncateHtml(html: string, maxLength: number, ellipsis = '...'): string {
  let currentLength = 0;
  const div = document.createElement('div');
  div.innerHTML = html;

  const truncateNode = (node: ChildNode): boolean => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || '';
      if (currentLength + text.length > maxLength) {
        node.textContent = text.slice(0, maxLength - currentLength) + ellipsis;
        return true; // Truncation complete
      }
      currentLength += text.length;
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const childNodes = Array.from(node.childNodes);
      for (const child of childNodes) {
        if (truncateNode(child)) {
          // If truncated inside a child node, remove remaining siblings
          while (node.lastChild && node.lastChild !== child) {
            node.removeChild(node.lastChild);
          }
          return true;
        }
      }
    }
    return false;
  };

  truncateNode(div);
  return div.innerHTML;
}
