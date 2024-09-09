// components/ActivityTracker.js
"use client";
import { useEffect } from "react";
import axios from "axios";

const ActivityTracker = ({ userID }: any) => {
  useEffect(() => {
    if (!userID) return;

    const updateActivity = async () => {
      try {
        await axios.post("/api/track_user/update_user_activity", { userID });
      } catch (error) {
        console.error("Error updating activity:", error);
      }
    };
    const setOffline = () => {
      if (navigator.sendBeacon) {
        const blob = new Blob([JSON.stringify({ userID })], {
          type: "application/json",
        });
        navigator.sendBeacon("/api/track_user/set_offline_status", blob);
      } else {
        axios
          .post("/api/track_user/set_offline_status", { userID })
          .catch((error) =>
            console.error("Error setting user offline:", error)
          );
      }
    };

    updateActivity(); // Call once on mount
    const intervalId = setInterval(updateActivity, 5 * 60 * 1000); // Call every 5 minutes

    // Set user offline when the tab is closed
    window.addEventListener("beforeunload", setOffline);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("beforeunload", setOffline);
    };
  }, [userID]);

  return null;
};

export default ActivityTracker;
