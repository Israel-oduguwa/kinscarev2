"use client";

import React, { useContext, ReactNode, useEffect } from "react";
import MongoContext from "@/app/MongoContext";
import { useRouter } from "next/navigation";
import DashboardSkeleton from "@/Providers/DashboardSkelenton";

interface CaregiverAuthProps {
  children: ReactNode;
}

function CaregiverAuth({ children }: CaregiverAuthProps) {
  const mongoClient: any = useContext(MongoContext);
  const { authenticated, loadingAuth, fetchAndUpdateCustomData, customData } =
    mongoClient;
  const router = useRouter();

  useEffect(() => {
    // Redirect if not authenticated after loading auth state
    // refresh the customData
    const handleRedirect = async () => {
      await fetchAndUpdateCustomData();
      if (!loadingAuth && !authenticated && customData.role !== "caregiver") {
        router.replace("/signin"); // Adjust this path based on your app's routing
      }
    };
    handleRedirect();
  }, [loadingAuth, authenticated, router]);

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

export default CaregiverAuth;
