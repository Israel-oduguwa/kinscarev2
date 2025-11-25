import { type ClassValue, clsx } from "clsx";

import { twMerge } from "tailwind-merge";

import { useApiClient } from "@/hooks/useApiClient";

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
    const response = await privateApi.post(
      "/api/v1/auth/crud-operation",
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
    const response = await privateApi.post(
      "/api/v1/auth/crud-operation",
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
