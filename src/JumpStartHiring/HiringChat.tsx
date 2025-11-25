"use client";
import React from "react";

function HiringChat() {
  const handleOpenHiringChat = () => {
    if (typeof window !== "undefined" && window.Intercom) {
      // 1. Set custom attributes (for hiring context)
      window.Intercom("update", {
        custom_attributes: {
          section: "dashboard-hiring",
          conversation_source: "dashboard-hiring-chat",
        }
      });
      // 2. Open chat with pre-filled message
      window.Intercom("showNewMessage", "Hi, I need help hiring a caregiver.");
    } else {
      alert("Chat is loading. Please try again in a moment!");
    }
  };

  return (
    <button
      type="button"
      className="inline-block mt-1 text-indigo-700 font-semibold hover:underline transition"
      onClick={handleOpenHiringChat}
      aria-label="Chat with a Hiring Advisor"
    >
      Chat with a Hiring Advisor
    </button>
  );
}

export default HiringChat;
