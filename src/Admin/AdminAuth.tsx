"use client";

import React, { useContext, ReactNode, useEffect } from "react";
import MongoContext from "@/app/MongoContext";
import { useRouter } from "next/navigation";
import DashboardSkeleton from "@/Providers/DashboardSkelenton";
import { identifyUser } from "@/lib/mixpanelUtils"; // Import Mixpanel identification function

interface AdminAuthProps {
  children: ReactNode;
}

function AdminAuth({ children }: AdminAuthProps) {
  const mongoClient: any = useContext(MongoContext);
  const { authenticated, loadingAuth, fetchAndUpdateCustomData, customData } =
    mongoClient;
  const router = useRouter();

  useEffect(() => {
    const handleRedirect = async () => {
      await fetchAndUpdateCustomData();
      
      if (!loadingAuth && !authenticated && customData?.role !== "admin") {
        router.replace("/admin-login"); // Redirect if not authenticated
      }

      // ✅ Identify user in Mixpanel after authentication
      if (authenticated && customData) {
        identifyUser({
          distinct_id: customData.hash, // Unique user ID
          isLoggedIn: true,
          userDetails: {
            $first_name: customData.fname,
            $last_name: customData.lname,
            $email: customData.email,
            role: customData.role,
          },
        });

        // console.log("✅ Identified Caregiver in Mixpanel:", customData.hash);
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

export default AdminAuth;
