"use client";

import React from "react";
import { useAuthContext } from "@/context/AuthContext";
import { useApiClient } from "@/hooks/useApiClient";
import { useUser } from "@clerk/nextjs";
import TwilioKanbanBoard from "./TwilioKanbanBoard";

function TwilioApplicantsPage() {
 const {userData} = useAuthContext();
  const { user }: any = useUser();
  const { privateApi } = useApiClient();

  const agentId = userData?.userID || user?.id || null;

  return <TwilioKanbanBoard privateApi={privateApi} agentId={agentId} />;
}

export default TwilioApplicantsPage;
