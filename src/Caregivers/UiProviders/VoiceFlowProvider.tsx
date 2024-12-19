"use client";

import React, { useContext, useEffect } from "react";
import { usePathname } from "next/navigation";
import MongoContext from "@/app/MongoContext";

// there are 2 screnerios for when users are logged in and not
function VoiceFlowProvider({ children }: any) {
  const { userData }: any = useContext(MongoContext);
  console.log(userData);
  const pathname = usePathname();

  useEffect(() => {
    if (userData.complete && userData.role === "caregiver") {
      // Inject the Voiceflow script
      (function (d, t) {
        const v = d.createElement(t),
          s = d.getElementsByTagName(t)[0];
        v.onload = function () {
          window.voiceflow.chat
            .load({
              verify: { projectID: "6717a6c73a30d3122f94d79e" },
              url: "https://general-runtime.voiceflow.com",
              versionID: "production",
            })
            .then(() => {
              setTimeout(() => {
                window.voiceflow.chat.proactive.clear(); // Clear previous messages
                window.voiceflow.chat.proactive.push({
                  type: "text",
                  payload: {
                    message:
                      "🎯 Looking to boost your career? Let's find the right path for you!",
                  },
                });
                window.voiceflow.chat.proactive.push({
                  type: "text",
                  payload: {
                    message:
                      "💡 Click the chat to explore top programs and tips!",
                  },
                });
              }, 3000);
            });
        };
        v.src = "https://cdn.voiceflow.com/widget/bundle.mjs";
        v.type = "text/javascript";
        s.parentNode.insertBefore(v, s);
      })(document, "script");

      // Listen for Voiceflow messages
      const handleVoiceflowMessage = (event: MessageEvent) => {
        // console.log("event data", event.data)
        if (event.origin !== "https://cdn.voiceflow.com") return; // Ensure the message is from Voiceflow

        // Example: Check for a specific event or payload structure
        if (event.data?.type === "recommendation") {
          const { recommendation, userID } = event.data.payload;

          // Save the recommendation to the database
          // fetch("/api/save-recommendation", {
          //   method: "POST",
          //   headers: {
          //     "Content-Type": "application/json",
          //   },
          //   body: JSON.stringify({ userID, recommendation }),
          // })
          //   .then((res) => res.json())
          //   .then((data) => {
          //     console.log("Recommendation saved successfully:", data);
          //   })
          //   .catch((error) => {
          //     console.error("Error saving recommendation:", error);
          //   });
        }
      };

      window.addEventListener("message", handleVoiceflowMessage);

      // Cleanup listener on unmount
      return () => {
        window.removeEventListener("message", handleVoiceflowMessage);
      };
    }
  }, [pathname, userData]);

  return <>{children}</>;
}

export default VoiceFlowProvider;
