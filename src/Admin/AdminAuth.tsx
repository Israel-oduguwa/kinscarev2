"use client";

import { ReactNode, useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import AuthContext, { useAuthContext } from "@/context/AuthContext";
import DashboardSkeleton from "@/Providers/DashboardSkelenton";

interface CaregiverAuthProps {
  children: ReactNode;
}

function AdminAuth({ children }: CaregiverAuthProps) {
  const { isLoaded: isAuthLoaded, isSignedIn } = useAuth();
  const { isLoaded: isUserLoaded, user }:any = useUser();
  const { contactData } = useAuthContext();
  const router = useRouter();

  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (!isAuthLoaded || !isUserLoaded) return;
    if (!isSignedIn) return; // Unauthenticated: let higher-level auth/middleware handle it

    const role = (user?.publicMetadata?.role as string | undefined) ?? null;

    // If user is signed in but not a caregiver, redirect to provider candidates page
    // console.log(user?.primaryEmailAddress.emailAddress)
    if (
      (role && role !== "admin") ||
      user?.primaryEmailAddress.emailAddress !== "oduguwa.israel22@gmail.com"
    ) {
      setIsRedirecting(true);
      router.replace("/");
    } else {
    }
  }, [isAuthLoaded, isUserLoaded, isSignedIn, user, router]);

  // While loading auth/user or performing a redirect, show skeleton
  if (!isAuthLoaded || !isUserLoaded || isRedirecting || !contactData) {
    return <DashboardSkeleton />;
  }

  // If not signed in, prevent rendering children (middleware or layout can handle redirect)
  if (!isSignedIn) {
    return null;
  }

  // Signed in AND role is "caregiver" → render protected content
  return <>{children}</>;
}

export default AdminAuth;

//  identifyUser({
//           distinct_id: contactData.hash, // Unique user ID
//           isLoggedIn: true,
//           userDetails: {
//             $first_name: contactData.fname,
//             $last_name: contactData.lname,
//             complete:contactData.complete,
//             verified:contactData.payment_verified,
//             $email: contactData.email,
//             role: contactData.role,
//           },
//         });
