"use client";

import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import DashboardSkeleton from "@/Providers/DashboardSkelenton"; // Adjust path if needed
import { useAuthContext } from "@/context/AuthContext";

interface AgentAuthProps {
  children: ReactNode;
}

function AgentAuth({ children }: AgentAuthProps) {
  const router = useRouter();

  const { isLoaded: isAuthLoaded, isSignedIn, sessionClaims } = useAuth();
  const { isLoaded: isUserLoaded, user } = useUser();
  const {
    status,
    isLoading,
    isRefreshing,
    error,
    refreshData,
    userData,
  } = useAuthContext();

  const [isRedirecting, setIsRedirecting] = useState(false);

  // Extract role safely from multiple sources (Clerk public metadata, session claims, backend)
  const role = useMemo(() => {
    const rawRole =
      (user?.publicMetadata?.role as string | undefined) ??
      ((sessionClaims as any)?.metadata?.role as string | undefined) ??
      (userData?.role as string | undefined) ??
      (userData as any)?.auth?.role;

    return rawRole ? String(rawRole).toLowerCase() : null;
  }, [user?.publicMetadata?.role, sessionClaims, userData]);

  const isAgentOrAdmin = role === "agent" || role === "admin";

  // Redirect if signed in but NOT agent/admin
  useEffect(() => {
    if (!isAuthLoaded || !isUserLoaded) return;

    // Kick unauthenticated users to sign-in but avoid an endless skeleton loop
    if (!isSignedIn) {
      setIsRedirecting(true);
      router.replace("/signin?redirect=agent-dashboard");
      return;
    }

    // Signed in → clear any redirecting state set earlier
    if (isRedirecting) {
      setIsRedirecting(false);
    }

    // Signed in but not authorized → show a clear deny state instead of hanging
    if (!isAgentOrAdmin) {
      setIsRedirecting(false);
    }
  }, [
    isAuthLoaded,
    isUserLoaded,
    isSignedIn,
    isAgentOrAdmin,
    isRedirecting,
    router,
  ]);

  // Mixpanel identify (once per session)
  const didIdentifyRef = useRef(false);
  useEffect(() => {
    if (didIdentifyRef.current) return;
    if (!isAgentOrAdmin) return;

    didIdentifyRef.current = true;

    // Example Mixpanel identify (uncomment when ready)
    // identifyUser({
    //   distinct_id: contactData.hash,
    //   isLoggedIn: true,
    //   userDetails: {
    //     $first_name: contactData.fname,
    //     $last_name: contactData.lname,
    //     $email: contactData.email,
    //     role: contactData.role,
    //     complete: contactData.complete,
    //     verified: contactData.payment_verified,
    //   },
    // });
  }, [isAgentOrAdmin]);

  const isClerkLoading = !isAuthLoaded || !isUserLoaded;
  // const waitingForContactData =
  //   isLoading || (status !== "success" && !contactData);

  // Show error state
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-lg text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-100">
            <span className="text-3xl">Warning</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Access Denied</h2>
          <p className="mt-2 text-sm text-gray-600">
            This page is restricted to KinsCare agents and admins only.
          </p>
          <button
            onClick={() => router.push("/signin")}
            className="mt-6 inline-flex items-center rounded-lg bg-indigo-600 px-5 py-3 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  // Show skeleton while loading
  if (isClerkLoading || isRedirecting) {
    return <DashboardSkeleton />;
  }

  // Not signed in → render nothing (middleware should redirect)
  if (!isSignedIn) {
    return null;
  }

  // Authenticated but not authorized → show an explicit denial (prevents infinite skeleton)
  if (isSignedIn && !isAgentOrAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-lg text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
            <span className="text-3xl">!</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Access restricted</h2>
          <p className="mt-2 text-sm text-gray-600">
            This page is only available to KinsCare agents and admins.
          </p>
          <button
            onClick={() => router.push("/signin?redirect=agent-dashboard")}
            className="mt-6 inline-flex items-center rounded-lg bg-indigo-600 px-5 py-3 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Switch account
          </button>
        </div>
      </div>
    );
  }

  // Signed in + correct role → render children
  return (
    <>
      {/* Optional: Show sync banner */}
      {isRefreshing && (
        <div className="sticky top-0 z-50 bg-amber-50 px-4 py-2 text-center text-xs font-medium text-amber-800">
          Syncing agent data...
        </div>
      )}

      {children}
    </>
  );
}

export default AgentAuth;
