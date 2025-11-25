import { UserButton } from "@clerk/nextjs";
import { Briefcase, MessageCircle } from "lucide-react";
import React from "react";

function AgentNavbarRight() {
  return (
    <div>
      <UserButton
        appearance={{
          elements: {
            // Slightly larger avatar, with subtle border
            avatarBox:
              "h-10 w-10 md:h-11 md:w-11 border border-blue-200 rounded-full",
            // Make the menu a bit wider & nicer
            userButtonPopoverCard:
              "w-72 lg:w-96 rounded-2xl shadow-lg border border-slate-100",
          },
        }}
      >
        <UserButton.MenuItems>
          {/* Your navigation links */}

          <UserButton.Link
            label="All Providers"
            labelIcon={<MessageCircle className="h-4 w-4" />}
            href="/agent/twilio"
          />
          <UserButton.Link
            label="All Jobs"
            labelIcon={<Briefcase className="h-4 w-4" />}
            href="/agent/jobs"
          />
          {/* Default Clerk items (Manage account, Sign out) stay at the bottom automatically */}
        </UserButton.MenuItems>
      </UserButton>
    </div>
  );
}

export default AgentNavbarRight;
