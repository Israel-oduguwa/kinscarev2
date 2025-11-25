// // middleware.ts or proxy.ts
// import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
// import { NextResponse } from "next/server";

// // High-level: which routes are protected at all (auth + onboarding + RBAC)
// const isProtectedRoute = createRouteMatcher([
//   "/admin(.*)",
//   "/agent(.*)",
//   "/vitae(.*)",
//   "/provider(.*)",
//   // add other protected app sections here
// ]);

// // Fine-grained matchers for role-based access
// const isProviderRoute = createRouteMatcher(["/provider(.*)"]);
// const isCaregiverRoute = createRouteMatcher(["/vitae(.*)"]);
// const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
// const isAgentRoute = createRouteMatcher(["/agent(.*)"]);

// export default clerkMiddleware(async (auth, req) => {
//   const { userId, sessionClaims }: any = auth();
//   const pathname = req.nextUrl.pathname;

//   // 0) If not logged in OR the route is not in our protected set → do nothing
//   if (!userId || !isProtectedRoute(req)) {
//     return NextResponse.next();
//   }

//   // 1) Pull metadata from Clerk session claims
//   const publicMetadata = (sessionClaims?.publicMetadata ?? {}) as Record<
//     string,
//     unknown
//   >;

//   const onboardingComplete =
//     publicMetadata.onboardingComplete === true ||
//     publicMetadata.onboardingComplete === "true";

//   // Role is expected to be written at signup into publicMetadata.role
//   const role = (publicMetadata.role as string | undefined) ?? undefined;

//   // 2) Compute whether this is a "fresh" session (e.g. first 10 seconds)
//   //    Use `iat` (issued-at) from the JWT so we don't fight with webhooks
//   const iatSeconds =
//     typeof sessionClaims?.iat === "number"
//       ? sessionClaims.iat
//       : sessionClaims?.iat
//       ? Number(sessionClaims.iat)
//       : null;

//   const iatMs = iatSeconds ? iatSeconds * 1000 : null;
//   const now = Date.now();
//   const isFreshSession =
//     iatMs !== null ? now - iatMs < 10_000 /* 10 seconds */ : false;

//   // 3) Always allow the onboarding page itself
//   if (pathname.startsWith("/onboarding")) {
//     return NextResponse.next();
//   }

//   // 4) Onboarding not complete, but session is fresh → trust webhook to catch up
//   if (!onboardingComplete && isFreshSession) {
//     return NextResponse.next();
//   }

//   // 5) Onboarding not complete & session is "old" → force onboarding
//   if (!onboardingComplete) {
//     const url = new URL("/onboarding", req.url);
//     return NextResponse.redirect(url);
//   }

//   // 🔐 From this point, user is:
//   // - authenticated
//   // - on a protected route
//   // - onboardingComplete === true

//   // 6) If role is missing, treat as unauthorized and push to a safe page
//   if (!role) {
//     const url = new URL("/", req.url); // you can change this to "/onboarding" or "/forbidden"
//     return NextResponse.redirect(url);
//   }
//   console.log(role)
//   // 7) Role-based access control (RBAC)

//   // PROVIDER: only /provider/**
//   if (isProviderRoute(req)) {
//     if (role !== "provider") {
//       const url = new URL("/", req.url);
//       return NextResponse.redirect(url);
//     }
//     return NextResponse.next();
//   }

//   // CAREGIVER: only /vitae/**
//   if (isCaregiverRoute(req)) {
//     if (role !== "caregiver") {
//       const url = new URL("/", req.url);
//       return NextResponse.redirect(url);
//     }
//     return NextResponse.next();
//   }

//   // ADMIN: only /admin/** and /agent/**
//   if (isAdminRoute(req) || isAgentRoute(req)) {
//     if (role !== "admin") {
//       const url = new URL("/", req.url);
//       return NextResponse.redirect(url);
//     }
//     return NextResponse.next();
//   }

//   // 8) For any other protected route that slips through, default allow.
//   //    (If you later add more role zones, handle them above this line.)
//   return NextResponse.next();
// });

// export const config = {
//   matcher: [
//     // Apply middleware to all app routes, but skip static assets, Next internals, and webhooks
//     "/((?!_next|favicon.ico|api/webhooks).*)",
//   ],
// };


// middleware.ts or proxy.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// 1) High-level: which routes require auth + onboarding + RBAC
const isProtectedRoute = createRouteMatcher([
  "/admin(.*)",
  "/agent(.*)",
  "/vitae(.*)",
  "/provider(.*)",
  // add other protected app sections here if needed
]);

// 2) Fine-grained matchers for role-based access
const isProviderRoute = createRouteMatcher(["/provider(.*)"]);
const isCaregiverRoute = createRouteMatcher(["/vitae(.*)"]);
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
const isAgentRoute = createRouteMatcher(["/agent(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims }:any = auth();
  const pathname = req.nextUrl.pathname;

  // Always let webhooks bypass middleware
  if (pathname.startsWith("/api/webhooks")) {
    return NextResponse.next();
  }

  // 0) If not logged in OR route is not in our protected set → do nothing
  if (!userId || !isProtectedRoute(req)) {
    return NextResponse.next();
  }

  // 1) Pull metadata from Clerk session claims (configured via session token claims)
  const metadata = (sessionClaims?.metadata ?? {}) as {
    role?: "admin" | "provider" | "caregiver" | string;
    onboardingComplete?: boolean | "true" | "false";
    [key: string]: unknown;
  };

  const onboardingComplete =
    metadata.onboardingComplete === true ||
    metadata.onboardingComplete === "true";

  const role = metadata.role as "admin" | "provider" | "caregiver" | undefined;

  // 2) Compute whether this is a "fresh" session (first 10 seconds)
  const iatSeconds =
    typeof sessionClaims?.iat === "number"
      ? sessionClaims.iat
      : sessionClaims?.iat
      ? Number(sessionClaims.iat)
      : null;

  const iatMs = iatSeconds ? iatSeconds * 1000 : null;
  const now = Date.now();
  const isFreshSession =
    iatMs !== null ? now - iatMs < 10_000 /* 10 seconds */ : false;

  // 3) Always allow the onboarding page itself
  if (pathname.startsWith("/onboarding")) {
    return NextResponse.next();
  }

  // 4) Onboarding not complete, but session is fresh → trust webhook to catch up
  if (!onboardingComplete && isFreshSession) {
    return NextResponse.next();
  }

  // 5) Onboarding not complete & session is "old" → force onboarding
  if (!onboardingComplete) {
    const url = new URL("/onboarding", req.url);
    return NextResponse.redirect(url);
  }

  // 🔐 From this point, user is:
  // - authenticated
  // - on a protected route
  // - onboardingComplete === true

  // 6) If role is missing, treat as unauthorized and push to a safe page
  if (!role) {
    const url = new URL("/", req.url); // or "/forbidden" or "/onboarding"
    return NextResponse.redirect(url);
  }

  // 7) Role-based access control (RBAC)

  // PROVIDER: only /provider/**
  if (isProviderRoute(req)) {
    if (role !== "provider") {
      const url = new URL("/", req.url);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // CAREGIVER: only /vitae/**
  if (isCaregiverRoute(req)) {
    if (role !== "caregiver") {
      const url = new URL("/", req.url);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // ADMIN: only /admin/** and /agent/**
  if (isAdminRoute(req) || isAgentRoute(req)) {
    console.log(role)
    if (role !== "admin") {
      const url = new URL("/", req.url);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // 8) For any other protected route that slips through, default allow.
  //    (If you later add more role zones, handle them above.)
  return NextResponse.next();
});

// 9) Matcher config based on Clerk's RBAC guide (enterprise-style)
export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
