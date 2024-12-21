"use client";

import React, { useContext, useEffect } from "react";
import { usePathname } from "next/navigation";
import MongoContext from "@/app/MongoContext";

function VoiceFlowProvider({ children }: any) {
  const { userData }: any = useContext(MongoContext);
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
      const handleVoiceflowMessage = async (event: MessageEvent) => {
        if (event.origin !== "https://cdn.voiceflow.com") return;

        // Example: Check for specific event payload
        if (event.data?.type ) {
          const { recommendation, userID } = event.data.payload;
          console.log(recommendation, userID)

          // Send recommendation to MongoDB
          // await saveRecommendationToDB({ userID, recommendation });
        }
      };

      // Add event listener
      window.addEventListener("message", handleVoiceflowMessage);

      // Cleanup listener on unmount
      return () => {
        window.removeEventListener("message", handleVoiceflowMessage);
      };
    }
  }, [pathname, userData]);

  // // Function to send recommendation to MongoDB
  // const saveRecommendationToDB = async (data: { userID: string; recommendation: string }) => {
  //   try {
  //     const response = await fetch("/api/recommendation", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify(data),
  //     });

  //     if (!response.ok) {
  //       console.error("Failed to save recommendation:", response.statusText);
  //     }
  //   } catch (error) {
  //     console.error("Error saving recommendation:", error);
  //   }
  // };

  return <>{children}</>;
}

export default VoiceFlowProvider;
