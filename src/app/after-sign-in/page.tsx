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
  const onboardingComplete = useMemo(
    () => user?.publicMetadata?.onboardingComplete === true,
    [user]
  );

  const routeByRole = useMemo(
    () =>
      (r: string | null) => {
        if (r === "admin") {
          router.replace("/agent/twilio");
          return true;
        }
        if (r === "caregiver" || r === "provider") {
          router.replace("/vitae/jobs/all");
          return true;
        }
        return false;
      },
    [router]
  );
  // console.log(user)
  useEffect(() => {
    if (!isAuthLoaded || !isUserLoaded) return;

    if (!isSignedIn) {
      router.replace("/signin");
      return;
    }

    if (didRedirectRef.current) return;
    didRedirectRef.current = true;

    // Route based on public metadata role when onboarding is done
    if (onboardingComplete && routeByRole(role)) return;

    router.replace("/onboarding");
  }, [isAuthLoaded, isUserLoaded, isSignedIn, onboardingComplete, role, routeByRole, router]);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50">
      {/* Logo top-left */}
      <div className="absolute top-6 left-6 z-20 flex items-center gap-2 text-sm font-semibold text-slate-700">
        <Image
          src="https://firebasestorage.googleapis.com/v0/b/exhct2004.appspot.com/o/Kinscare%20Logo.svg?alt=media&token=e0ffb5fe-d0f9-4992-b505-a4180dffe444"
          alt="Kinscare"
          width={36}
          height={36}
          className="h-9 w-9"
          priority
        />
        <span>Kinscare</span>
      </div>

      {/* soft gradient blobs */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-64 w-64 rounded-full bg-indigo-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl" />

      {/* center content */}
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-slate-200/80 bg-white/90 shadow-xl backdrop-blur">
          {/* header / progress */}
          <div className="h-1 w-full overflow-hidden bg-slate-100">
            <div className="h-full w-full bg-gradient-to-r from-indigo-500 via-sky-500 to-cyan-400 animate-[progress_1.6s_ease_infinite]" />
          </div>

          <div className="p-8">
            <div className="flex items-center gap-4">
              <div className="relative inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 ring-1 ring-slate-100">
                <div className="absolute inset-0 rounded-2xl border-2 border-indigo-200 border-t-indigo-600 animate-spin" />
                <Image
                  src="https://firebasestorage.googleapis.com/v0/b/exhct2004.appspot.com/o/Kinscare%20Logo.svg?alt=media&token=e0ffb5fe-d0f9-4992-b505-a4180dffe444"
                  alt="Kinscare"
                  width={40}
                  height={40}
                  className="relative h-10 w-10"
                  priority
                />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Hold tight</p>
                <h1 className="text-lg font-semibold text-slate-900">
                  Loading your dashboard
                </h1>
              </div>
            </div>

            {/* skeleton rows */}
            <div className="mt-6 space-y-3">
              <div className="h-4 w-3/4 animate-pulse rounded-full bg-slate-200" />
              <div className="h-4 w-5/6 animate-pulse rounded-full bg-slate-200" />
              <div className="h-4 w-2/3 animate-pulse rounded-full bg-slate-200" />
            </div>

            {/* animated dots */}
            <div className="mt-6 flex items-center gap-1.5 text-slate-500">
              <span className="h-2 w-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:-0.2s]" />
              <span className="h-2 w-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:-0.1s]" />
              <span className="h-2 w-2 rounded-full bg-indigo-600 animate-bounce" />
              <span className="ml-2 text-xs font-medium">Setting things up…</span>
            </div>
          </div>

          <div className="border-t border-slate-100 bg-slate-50/70 px-8 py-4 text-xs text-slate-500">
            Your role is detected automatically so we can take you to the right dashboard.
          </div>
        </div>
      </div>
    </div>
  );
}
