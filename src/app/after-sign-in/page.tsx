"use client";

import { useEffect, useMemo, useRef } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function AfterSignInPage() {
  const router = useRouter();
  const { isLoaded: isAuthLoaded, isSignedIn } = useAuth();
  const { isLoaded: isUserLoaded, user } = useUser();

  const didRedirectRef = useRef(false);

  const role = useMemo(
    () => (user?.publicMetadata?.role as string | undefined) ?? null,
    [user]
  );
  console.log(user)
  useEffect(() => {
    if (!isAuthLoaded || !isUserLoaded) return;

    if (!isSignedIn) {
      router.replace("/signin");
      return;
    }

    if (didRedirectRef.current) return;
    didRedirectRef.current = true;

    if (role === "provider") {
      router.replace("/provider/candidates/all");
      return;
    }

    if (role === "caregiver") {
      router.replace("/vitae/jobs/all");
      return;
    }

    router.replace("/onboarding");
  }, [isAuthLoaded, isUserLoaded, isSignedIn, role, router]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gray-50">
      {/* soft gradient blobs */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-104 w-104 rounded-full bg-indigo-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-112 w-md rounded-full bg-blue-200/40 blur-3xl" />

      {/* card */}
      <div className="relative z-10 mx-4 w-full max-w-sm rounded-2xl border border-gray-200 bg-white/90 p-7 shadow-xl backdrop-blur">
        <div className="flex flex-col items-center text-center">
          {/* logo with spinning ring */}
          <div className="relative">
            <div className="absolute inset-0 -m-3 rounded-full border-2 border-indigo-200 border-t-indigo-600 animate-spin" />
            <Image
              src="https://firebasestorage.googleapis.com/v0/b/exhct2004.appspot.com/o/Kinscare%20Logo.svg?alt=media&token=e0ffb5fe-d0f9-4992-b505-a4180dffe444"
              alt="Kinscare"
              width={56}
              height={56}
              className="relative h-14 w-14"
              priority
            />
          </div>

          {/* short title */}
          <h1 className="mt-4 text-base font-semibold text-gray-900">
            Loading your dashboard
          </h1>

          {/* animated dots */}
          <div className="mt-2 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-bounce [animation-delay:-0.2s]" />
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-bounce [animation-delay:-0.1s]" />
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-bounce" />
          </div>
        </div>

        {/* simple pulsing bar */}
        <div className="mt-6">
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div className="h-full w-full bg-indigo-600/70 animate-pulse" />
          </div>
        </div>

        {/* tiny footer only */}
        <p className="mt-5 text-center text-[11px] text-gray-400">
          Kinscare • Secure login
        </p>
      </div>
    </div>
  );
}
