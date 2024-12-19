"use client";

import React, { useContext, ReactNode, useEffect } from "react";
import MongoContext from "@/app/MongoContext";
import { useRouter } from "next/navigation";
import DashboardSkeleton from "@/Providers/DashboardSkelenton";


interface ProviderAuthProps {
  children: ReactNode;
}

function ProviderAuth({ children }: ProviderAuthProps) {
  const mongoClient: any = useContext(MongoContext);
  const { authenticated, loadingAuth } = mongoClient;
  const router = useRouter();

  useEffect(() => {
    // Redirect if not authenticated after loading auth state
    if (!loadingAuth && !authenticated) {
      router.replace("/signin"); // Adjust this path based on your app's routing
    }
  }, [loadingAuth, authenticated, router]);

  // Show loading indicator while auth status is being determined
  if (loadingAuth) {
    return (
      <DashboardSkeleton/>
    );
  }

  // Render the protected content if authenticated
  if (authenticated) {
    return <>{children}</>;
  }

  // Return null to prevent rendering content during redirection
  return null;
}

export default ProviderAuth;
