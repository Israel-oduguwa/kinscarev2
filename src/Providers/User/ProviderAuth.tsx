"use client";

import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import DashboardSkeleton from "../DashboardSkelenton";
import { useAuthContext } from "@/context/AuthContext";

interface ProviderAuthProps {
  children: ReactNode;
}

function ProviderAuth({ children }: ProviderAuthProps) {
  const router = useRouter();

  const { isLoaded: isAuthLoaded, isSignedIn } = useAuth();
  const { isLoaded: isUserLoaded, user } = useUser();

  const {
    contactData,
    status,
    isLoading,
    isRefreshing,
    error,
    refreshData,
  } = useAuthContext();

  const [isRedirecting, setIsRedirecting] = useState(false);

  const role = useMemo(
    () => (user?.publicMetadata?.role as string | undefined) ?? null,
    [user]
  );

  useEffect(() => {
    if (!isAuthLoaded || !isUserLoaded) return;
    if (!isSignedIn) return;

    if (!role || role !== "provider") {
      setIsRedirecting(true);
      router.replace("/vitae/jobs/all");
    }
  }, [isAuthLoaded, isUserLoaded, isSignedIn, role, router]);

  // Mixpanel identify once
  const didIdentifyRef = useRef(false);
  useEffect(() => {
    if (!contactData || didIdentifyRef.current) return;
    didIdentifyRef.current = true;

    // identifyUser({...})
  }, [contactData]);

  const isClerkLoading = !isAuthLoaded || !isUserLoaded;

  // ✅ ERROR FIRST (prevents infinite skeleton)
  if (error) {
    return (
      <div className="flex min-h-[60vh] w-full items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            Couldn’t load your dashboard
          </h2>
          <p className="mt-2 text-sm text-rose-600">{error}</p>

          <button
            onClick={() => refreshData()}
            className="mt-4 inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const waitingForInit =
    isLoading || (status !== "success" && !contactData);

  if (isClerkLoading || isRedirecting || waitingForInit) {
    return <DashboardSkeleton />;
  }

  if (!isSignedIn) return null;

  return (
    <>
      {isRefreshing ? (
        <div className="sticky top-0 z-50 w-full bg-amber-50 px-3 py-2 text-center text-xs text-amber-700">
          Syncing your account…
        </div>
      ) : null}

      {children}
    </>
  );
}

export default ProviderAuth;
