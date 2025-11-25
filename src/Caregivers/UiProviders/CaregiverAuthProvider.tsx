"use client";

import { ReactNode, useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import DashboardSkeleton from "./DashboardSkeleton";

interface CaregiverAuthProps {
  children: ReactNode;
}

function CaregiverAuth({ children }: CaregiverAuthProps) {
  const { isLoaded: isAuthLoaded, isSignedIn } = useAuth();
  const { isLoaded: isUserLoaded, user } = useUser();
  const router = useRouter();

  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (!isAuthLoaded || !isUserLoaded) return;
    if (!isSignedIn) return; // Unauthenticated: let higher-level auth/middleware handle it

    const role = (user?.publicMetadata?.role as string | undefined) ?? null;

    // If user is signed in but not a caregiver, redirect to provider candidates page
    if (role && role !== "caregiver") {
      setIsRedirecting(true);
      router.replace("/provider/candidates/all");
    }
  }, [isAuthLoaded, isUserLoaded, isSignedIn, user, router]);

  // While loading auth/user or performing a redirect, show skeleton
  if (!isAuthLoaded || !isUserLoaded || isRedirecting) {
    return <DashboardSkeleton />;
  }

  // If not signed in, prevent rendering children (middleware or layout can handle redirect)
  if (!isSignedIn) {
    return null;
  }

  // Signed in AND role is "caregiver" → render protected content
  return <>{children}</>;
}

export default CaregiverAuth;
