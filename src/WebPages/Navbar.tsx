"use client";

import { useContext } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

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
          className="inline-flex items-center justify-center p-3 text-gray-600 rounded-md lg:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          <Menu size={24} />
        </button>
      </SheetTrigger>

      <SheetContent
        side="left"
        className="bg-white dark:bg-gray-950 shadow-xl w-80 px-6 py-6 sm:px-7 sm:py-8"
      >
        <SheetHeader className="mb-4">
          <SheetTitle className="text-base font-semibold tracking-tight text-gray-900 dark:text-gray-100">
            Menu
          </SheetTitle>
        </SheetHeader>

        <div className="flex h-full flex-col">
          {/* Navigation Links */}
          <nav className="space-y-1">
            {menuItems.map((link) => {
              const active = isActive(link.href);
              return (
                <SheetClose asChild key={link.href}>
                  <Link
                    href={link.href}
                    className={[
                      "block rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                      active
                        ? "bg-blue-600 text-white"
                        : "text-gray-800 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
                    ].join(" ")}
                    aria-current={active ? "page" : undefined}
                  >
                    {link.label}
                  </Link>
                </SheetClose>
              );
            })}
          </nav>

          {/* Divider */}
          <div className="my-6 h-px w-full bg-gray-200 dark:bg-gray-800" />

          {/* Actions (only show when user is not authenticated) */}
          <MobileAuthActions />
        </div>
      </SheetContent>
    </Sheet>
  );
}

/**
 * Separate component to decide if Sign In / Get Started should be shown inside the Sheet.
 * If user is logged in (caregiver/provider), we hide these to avoid redundancy.
 */
function MobileAuthActions() {
  const { userData }: any = useContext(MongoContext);

  if (userData?.role === "caregiver" || userData?.role === "provider") {
    return null;
  }

  return (
    <div className="gap-3 flex flex-col">
      <SheetClose asChild>
        <Link href="/signin">
          <Button variant="outline" className="w-full">
            Sign In
          </Button>
        </Link>
      </SheetClose>
      <SheetClose asChild>
        <Link href="/signup">
          <Button className="w-full">Get Started</Button>
        </Link>
      </SheetClose>
    </div>
  );
}

function Navbar() {
  const pathname = usePathname();
  const { userData }: any = useContext(MongoContext);

  return (
    <header>
      <nav className="bg-white/60 z-50 backdrop-blur-md fixed top-0 w-full border-b border-gray-100 px-4 lg:px-6 py-3 transition-all duration-300 dark:bg-gray-800/60">
        <div className="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl">
          {/* Logo Section */}
          <Link className="flex items-center mr-2" href="/">
            <Image
              className="h-8 pr-1 sm:h-9"
              src="https://firebasestorage.googleapis.com/v0/b/exhct2004.appspot.com/o/Kinscare%20Logo.svg?alt=media&token=e0ffb5fe-d0f9-4992-b505-a4180dffe444"
              alt="Kinscare logo"
              width={50}
              height={50}
            />
            <p className="text-sm font-medium">KinsCare</p>
          </Link>

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
                    className={`mr-2 py-2 px-4 font-semibold text-sm ${
                      pathname === "/signin" ? "bg-blue-100 text-blue-600" : ""
                    }`}
                  >
                    Sign in
                  </Button>
                </Link>
                <Link
                  className="inline-flex items-center justify-center px-6 py-2 text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-700 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:from-indigo-700 hover:to-violet-800 hover:-translate-y-1"
                  href="/signup"
                >
                  Get started
                </Link>
              </>
            )}
          </div>

          {/* Mobile top bar: role actions + hamburger */}
          <div className="lg:hidden flex items-center gap-2">
            {userData && userData.role === "caregiver" ? (
              <CaregiverNavbarRight />
            ) : userData && userData.role === "provider" ? (
              <ProviderNavbarRight />
            ) : null}
            <MobileMenu />
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
