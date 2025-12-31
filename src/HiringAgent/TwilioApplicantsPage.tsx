"use client";

import React from "react";
import { useAuthContext } from "@/context/AuthContext";
import { useApiClient } from "@/hooks/useApiClient";
import { useUser } from "@clerk/nextjs";
import TwilioKanbanBoard from "./TwilioKanbanBoard";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

function TwilioApplicantsPage() {
 const {userData} = useAuthContext();
  const { user }: any = useUser();
  const { privateApi } = useApiClient();
  const router = useRouter();
  const [isNavigating, setIsNavigating] = React.useState(false);

  const agentId = userData?.userID || user?.id || null;

  const handleAddLead = () => {
    setIsNavigating(true);
    router.push("/agent/twilio/add-provider");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <Button
          onClick={handleAddLead}
          disabled={isNavigating}
          className="flex items-center gap-2"
        >
          {isNavigating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          {isNavigating ? "Opening..." : "Add provider"}
        </Button>
      </div>
      <TwilioKanbanBoard privateApi={privateApi} agentId={agentId} />
    </div>
  );
}

export default TwilioApplicantsPage;
