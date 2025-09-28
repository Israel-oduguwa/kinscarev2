"use client";

import { useContext, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ChevronRight, ExternalLink, LogIn, UserPlus } from "lucide-react";

import MongoContext from "@/app/MongoContext";
import CaregiverNavbarRight from "@/Caregivers/CaregiverNavbarRight";
import ProviderNavbarRight from "@/Providers/ProviderNavbarRight";
import NavbarLink from "./NavbarLink";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const menuItems = [
  { label: "Jobs", href: "/find-jobs" },
  { label: "Find Caregivers", href: "/find-caregivers" },
  { label: "Jump Start Hiring", href: "/jumpstart-hiring" },
  { label: "Explore", href: "/explore" },
  { label: "Post Job", href: "/post-job" },
  { label: "Plans & Pricing", href: "/pricing" },
  { label: "Blog", href: "/blog" },
  { label: "Community", href: "/community" },
];

function MobileMenu() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (!pathname) return false;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          aria-label="Open menu"
          className="inline-flex items-center justify-center p-2.5 text-gray-700 rounded-xl lg:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-gray-200 dark:hover:bg-gray-800"
        >
          <Menu size={22} />
        </button>
      </SheetTrigger>

      <SheetContent
        side="left"
        className="bg-white/95 dark:bg-gray-950/95 backdrop-blur-md shadow-2xl w-[18.5rem] p-0 border-0 flex flex-col"
      >
        {/* Header with logo + close */}
        <div className="sticky top-0 flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <Image
              src="https://firebasestorage.googleapis.com/v0/b/exhct2004.appspot.com/o/Kinscare%20Logo.svg?alt=media&token=e0ffb5fe-d0f9-4992-b505-a4180dffe444"
              alt="Kinscare logo"
              width={28}
              height={28}
            />
            <SheetTitle className="text-base font-semibold tracking-tight">
              Menu
            </SheetTitle>
          </div>
         
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          <nav className="px-3 py-4 space-y-1">
            {menuItems.map((link) => {
              const active = isActive(link.href);
              return (
                <SheetClose asChild key={link.href}>
                  <Link
                    href={link.href}
                    className={[
                      "group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                      active
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-gray-800 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
                    ].join(" ")}
                    aria-current={active ? "page" : undefined}
                  >
                    <span className="truncate">{link.label}</span>
                  </Link>
                </SheetClose>
              );
            })}
          </nav>
        </div>

        {/* Auth actions fixed to bottom */}
        <div className="border-t border-gray-200 dark:border-gray-800 px-3 py-4">
          <MobileAuthActions />
        </div>
      </SheetContent>
    </Sheet>
  );
}

function MobileAuthActions() {
  const { userData }: any = useContext(MongoContext);

  if (userData?.role === "caregiver" || userData?.role === "provider") {
    return null;
  }

  return (
    <div className="gap-2 flex flex-col">
      <SheetClose asChild>
        <Link href="/signin">
          <Button
            variant="outline"
            className="w-full justify-center gap-2 rounded-xl"
          >
            <LogIn className="size-4" />
            Sign In
          </Button>
        </Link>
      </SheetClose>
      <SheetClose asChild>
        <Link href="/signup">
          <Button className="w-full justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-700 hover:from-indigo-700 hover:to-violet-800 shadow-md hover:shadow-lg">
            <UserPlus className="size-4" />
            Get Started
          </Button>
        </Link>
      </SheetClose>
    </div>
  );
}


function Navbar() {
  const pathname = usePathname();
  const { userData }: any = useContext(MongoContext);

  const isSignedIn = useMemo(
    () => userData?.role === "caregiver" || userData?.role === "provider",
    [userData]
  );

  return (
    <header>
      <nav className="bg-white/60 z-50 backdrop-blur-md fixed top-0 w-full border-b border-gray-100 px-4 lg:px-6 py-3 transition-all duration-300 dark:bg-gray-800/60">
        <div className="flex flex-wrap justify-between items-center mx-auto max-w-screen-2xl">
          {/* LEFT cluster (mobile signed-in: hamburger + logo) */}
          <div className="flex items-center mr-2 gap-2">
            {/* Hamburger on LEFT only when signed in (match dashboard) */}
            {isSignedIn && (
              <div className="lg:hidden">
                <MobileMenu />
              </div>
            )}

            {/* Logo Section */}
            <Link className="flex items-center" href="/">
              <Image
                className="h-10 w-10"
                src="https://firebasestorage.googleapis.com/v0/b/exhct2004.appspot.com/o/Kinscare%20Logo.svg?alt=media&token=e0ffb5fe-d0f9-4992-b505-a4180dffe444"
                alt="Kinscare logo"
                width={32}
                height={32}
                priority
              />
              <p className="ml-2 text-sm font-medium">KinsCare</p>
            </Link>
          </div>

          {/* Right Section (desktop) */}
          <div className="hidden lg:flex items-center lg:order-2">
            {userData && userData.role === "caregiver" ? (
              <CaregiverNavbarRight />
            ) : userData && userData.role === "provider" ? (
              <ProviderNavbarRight />
            ) : (
              <>
                <Link href="/signin">
                  <Button
                    variant="ghost"
                    className={`mr-2 py-2 px-4 font-semibold text-sm rounded-xl ${
                      pathname === "/signin" ? "bg-indigo-50 text-indigo-700" : "text-gray-700 dark:text-gray-200"
                    }`}
                  >
                    Sign in
                  </Button>
                </Link>
                <Link
                  className="inline-flex items-center justify-center px-5 py-2 text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-700 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:from-indigo-700 hover:to-violet-800 hover:-translate-y-0.5"
                  href="/signup"
                >
                  Get started
                </Link>
              </>
            )}
          </div>

          {/* Mobile top bar: role actions + hamburger (RIGHT only when signed out) */}
          <div className="lg:hidden flex items-center gap-2">
            {userData && userData.role === "caregiver" ? (
              <CaregiverNavbarRight />
            ) : userData && userData.role === "provider" ? (
              <ProviderNavbarRight />
            ) : null}

            {/* Hamburger on RIGHT only when signed out (public pages) */}
            {!isSignedIn && <MobileMenu />}
          </div>

          {/* Navbar Links for Desktop */}
          <div className="hidden justify-between items-center w-full lg:flex lg:w-auto lg:order-1">
            <NavbarLink />
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
