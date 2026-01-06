"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";
import { useAuthContext } from "@/context/AuthContext";

const IntercomProvider = () => {
  const pathname = usePathname();
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const { userData }: any = useAuthContext();
  const appId = process.env.INTERCOM_APP_ID;

  // Determine if Intercom should be active
  const role = userData?.role || userData?.settings?.role;
  const isSignedInUser = Boolean(userData?.userID || role);
  const isLeadPage =
    pathname.startsWith("/jumpstart-hiring") ||
    pathname.startsWith("/post-job") ||
    pathname.startsWith("/find-caregivers") ||
    pathname.startsWith("/pricing");
  const shouldLoadIntercom = Boolean(appId) && (isSignedInUser || isLeadPage);
  // console.log(userData);
  // Manage Intercom boot/shutdown when conditions or script status change
  // console.log(pathname)
  useEffect(() => {
    if (
      scriptLoaded &&
      typeof window.Intercom === "function" &&
      shouldLoadIntercom
    ) {
      window.Intercom("boot", {
        app_id: appId || "",
        hide_default_launcher: true, // 👈 THIS hides the widget!
        user_id: userData?.userID ?? undefined,
        name:
          userData?.fname || userData?.lname
            ? `${userData.fname ?? ""} ${userData.lname ?? ""}`.trim()
            : undefined,
        email: userData?.auth?.email ?? undefined,
        phone: userData?.auth?.tel,
        // user_hash:userData?.hash,
        
        avatar: userData?.profileImage
          ? { type: "avatar", image_url: userData.profileImage }
          : undefined,
        created_at: userData?.createdAt
          ? Math.floor(new Date(userData.createdAt).getTime() / 1000)
          : undefined,
        alignment: "right",
        horizontal_padding: 20,
        vertical_padding: 20,
        custom_attributes: { role: userData?.role ?? undefined },
      });
    //   window.Intercom(
    //     "showNewMessage",
    //     "Report issues here or via WhatsApp at +1234567890!"
    //   );
    } else if (window.Intercom) {
      window.Intercom("shutdown");
    }
  }, [shouldLoadIntercom, scriptLoaded, userData, appId]);

  if (!shouldLoadIntercom) return null;

  return (
    <Script
      id="intercom-script"
      strategy="lazyOnload"
      src={`https://widget.intercom.io/widget/${appId}`}
      onLoad={() => setScriptLoaded(true)}
    />
  );
};

export default IntercomProvider;
