"use client";

import { useEffect, useState, useContext } from "react";
import { usePathname, } from "next/navigation";
import Script from "next/script";
import MongoContext from "@/app/MongoContext";

const IntercomProvider = () => {
  const pathname = usePathname();
  const { userData }: any = useContext(MongoContext);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Determine if Intercom should be active
  const shouldLoadIntercom = true // userData?.role === "provider" && pathname !== "/";
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
        app_id: process.env.INTERCOM_APP_ID || "YOUR_APP_ID",
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
  }, [shouldLoadIntercom, scriptLoaded, userData]);

  return (
    <Script
      id="intercom-script"
      strategy="afterInteractive"
      src={`https://widget.intercom.io/widget/${process.env.INTERCOM_APP_ID || "YOUR_APP_ID"}`}
      onLoad={() => setScriptLoaded(true)}
    />
  );
};

export default IntercomProvider;
