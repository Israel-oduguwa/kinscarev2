"use client"
import { useAuthContext } from "@/context/AuthContext";
import { trackEvent } from "@/lib/mixpanelUtils";
import React, { useContext, useEffect } from "react";

function PreviewTrack({referrer_id}:any) {
  const { user, userData }: any = useAuthContext();
  console.log(userData)
  useEffect(() => {
    const mixpanelPayload = {
      name: "Crowd Post",
      user_id: userData.userID,
      referrer_id:userData.userID,
      existing_user:false,
      authenticated: true,
      date: new Date(),
      referee_employee: true,
      step: "preview job",
    };
    trackEvent(contactData?.hash, "Preview", mixpanelPayload);
  }, [userData]);

  return <div></div>;
}

export default PreviewTrack;
