/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useContext, ReactNode, useEffect } from "react";
import MongoContext from "@/app/MongoContext";
import { useRouter } from "next/navigation";
import mixpanel from "@/lib/mixpanel";
import { identifyUser } from "@/lib/mixpanelUtils"; // Import your identify function
import DashboardSkeleton from "@/Providers/DashboardSkelenton";

interface AgentAuthProps {
  children: ReactNode;
}

function AgentAuth({ children }: AgentAuthProps) {
  const mongoClient: any = useContext(MongoContext);
  const { authenticated, loadingAuth, fetchAndUpdateCustomData, customData } =
    mongoClient;
  const router = useRouter();

  useEffect(() => {
    const handleRedirect = async () => {
      await fetchAndUpdateCustomData();

      if (!loadingAuth && !authenticated && customData.role !== "agent") {
        router.replace("/agent/signin"); // Redirect if not authenticated
      }

      // ✅ Identify user in Mixpanel after authentication
      if (authenticated && customData) {
        identifyUser({
          distinct_id: customData.hash, // Unique user ID
          isLoggedIn: true,
          userDetails: {
            $first_name: customData.fname,
            $last_name: customData.lname,
            complete:customData.complete,
            verified:customData.payment_verified,
            $email: customData.email,
            role: customData.role,
          },
        });

        // console.log("✅ Identified user in Mixpanel:", customData.hash);
      }
    };

    handleRedirect();
  }, [loadingAuth, authenticated,  router]);

  // Show loading indicator while auth status is being determined
  if (loadingAuth) {
    return <DashboardSkeleton />;
  }

  // Render the protected content if authenticated
  if (authenticated) {
    return <>{children}</>;
  }

  // Return null to prevent rendering content during redirection
  return null;
}

export default AgentAuth;
