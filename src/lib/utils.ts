import { type ClassValue, clsx } from "clsx";
import { User } from "realm-web";
import { twMerge } from "tailwind-merge";

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
import mixpanel from "./mixpanel"
import Router from "next/router";
import { Dict } from "mixpanel-browser";

//  The inside events fired 
export const trackEvents = (distinct_id: any, event: string, customValue: Dict | undefined) =>{
mixpanel.track(event, {
  ...customValue, 
  distinct_id
});
}