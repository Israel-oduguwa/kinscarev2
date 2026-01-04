"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";

import CaregiverNavbarRight from "@/Caregivers/CaregiverNavbarRight";
import ProviderNavbarRight from "@/Providers/ProviderNavbarRight";

import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuthContext } from "@/context/AuthContext";
import { Menu, X } from "lucide-react";

function ForumDynamicNavbar() {
  
  const {userData} = useAuthContext();
  const role: "caregiver" | "provider" | "guest" = useMemo(() => {
    if (userData?.role === "caregiver") return "caregiver";
    if (userData?.role === "provider") return "provider";
    return "guest";
  }, [userData]);

  return (
    <header className="w-full">
      <nav className="py-3 px-4 lg:px-6 shadow-md bg-white">
        <div className="mx-auto max-w-screen-2xl">
          {/* Row */}
          <div className="flex items-center justify-between">
            {/* LEFT cluster (mobile: hamburger + logo) */}
            <div className="flex items-center gap-2">
              {/* Hamburger: visible on <lg */}
              <div className="lg:hidden">
                <MobileMenu role={role} />
              </div>

              {/* Logo */}
              <Link className="flex items-center" href="/">
                <Image
                  src="https://firebasestorage.googleapis.com/v0/b/exhct2004.appspot.com/o/Kinscare%20Logo.svg?alt=media&token=e0ffb5fe-d0f9-4992-b505-a4180dffe444"
                  alt="Kinscare Logo"
                  width={40}
                  height={40}
                  className="h-8 w-8 sm:h-10 sm:w-10 mr-2"
                  priority
                />
                <p className="text-sm font-medium">Kinscare</p>
              </Link>
            </div>

            {/* CENTER (desktop nav links) */}
            <div className="hidden lg:flex items-center gap-6">
              {role === "caregiver" && (
                <>
                  <NavigationMenu>
                    <NavigationMenuList>
                      <NavigationMenuItem>
                        <Link href="/community">
                          <NavigationMenuLink
                            className={navigationMenuTriggerStyle()}
                          >
                            Discussions
                          </NavigationMenuLink>
                        </Link>
                      </NavigationMenuItem>
                    </NavigationMenuList>
                  </NavigationMenu>
                  <NavigationMenu>
                    <NavigationMenuList>
                      <NavigationMenuItem>
                        <Link href="/community/create">
                          <NavigationMenuLink
                            className={navigationMenuTriggerStyle()}
                          >
                            Create Discussion
                          </NavigationMenuLink>
                        </Link>
                      </NavigationMenuItem>
                    </NavigationMenuList>
                  </NavigationMenu>
                </>
              )}

              {role === "provider" && (
                <>
                  <NavigationMenu>
                    <NavigationMenuList>
                      <NavigationMenuItem>
                        <Link href="/provider/candidates/all">
                          <NavigationMenuLink
                            className={navigationMenuTriggerStyle()}
                          >
                            Find Caregivers
                          </NavigationMenuLink>
                        </Link>
                      </NavigationMenuItem>
                    </NavigationMenuList>
                  </NavigationMenu>

                  <NavigationMenu>
                    <NavigationMenuList>
                      <NavigationMenuItem>
                        <Link href="/provider/job/update/new">
                          <NavigationMenuLink
                            className={navigationMenuTriggerStyle()}
                          >
                            Post Job
                          </NavigationMenuLink>
                        </Link>
                      </NavigationMenuItem>
                    </NavigationMenuList>
                  </NavigationMenu>
                </>
              )}
            </div>

            {/* RIGHT (role widgets) */}
            <div className="flex items-center gap-3">
              {role === "caregiver" && <CaregiverNavbarRight />}
              {role === "provider" && <ProviderNavbarRight />}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}

/* ---------------------------------------------
 * Mobile menu (shadcn Sheet) – mirrors desktop links
 * --------------------------------------------- */
function MobileMenu({ role }: { role: "caregiver" | "provider" | "guest" }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          aria-label="Open menu"
          className="inline-flex items-center justify-center rounded-xl p-2.5 text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <Menu size={22} />
        </button>
      </SheetTrigger>

      <SheetContent
        side="left"
        className="w-[18.5rem] p-0 border-0 bg-white shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-3">
            <Image
              src="https://firebasestorage.googleapis.com/v0/b/exhct2004.appspot.com/o/Kinscare%20Logo.svg?alt=media&token=e0ffb5fe-d0f9-4992-b505-a4180dffe444"
              alt="Kinscare Logo"
              width={28}
              height={28}
              className="h-7 w-7"
              priority
            />
            <span className="text-base font-semibold tracking-tight">Menu</span>
          </div>
          <SheetClose asChild>
            <button
              aria-label="Close menu"
              className="rounded-md p-2 text-gray-500 hover:bg-gray-100"
            >
              <X size={18} />
            </button>
          </SheetClose>
        </div>

        {/* Body (scrollable) */}
        <div className="flex-1 overflow-y-auto px-3 py-4">
          {/* Caregiver links */}
          {role === "caregiver" && (
            <div className="space-y-1">
              <SheetClose asChild>
                <Link
                  href="/community"
                  className="block rounded-xl px-3 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-100"
                >
                  Discussions
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link
                  href="/community/create"
                  className="block rounded-xl px-3 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-100"
                >
                  Create Discussion
                </Link>
              </SheetClose>
            </div>
          )}

          {/* Provider links */}
          {role === "provider" && (
            <div className="space-y-1">
              <SheetClose asChild>
                <Link
                  href="/provider/candidates/all"
                  className="block rounded-xl px-3 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-100"
                >
                  Find Caregivers
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link
                  href="/provider/job/update/new"
                  className="block rounded-xl px-3 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-100"
                >
                  Post Job
                </Link>
              </SheetClose>
            </div>
          )}

          {/* Guest (optional minimal) */}
          {role === "guest" && (
            <div className="space-y-1">
              <SheetClose asChild>
                <Link
                  href="/community"
                  className="block rounded-xl px-3 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-100"
                >
                  Discussions
                </Link>
              </SheetClose>
            </div>
          )}
        </div>

        {/* Footer actions (optional) */}
        <div className="border-t border-gray-200 px-3 py-4">
          {role === "guest" ? (
            <div className="flex gap-2">
              <SheetClose asChild>
                <Link href="/signin" className="w-1/2">
                  <Button variant="outline" className="w-full rounded-xl">
                    Sign In
                  </Button>
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link href="/signup" className="w-1/2">
                  <Button className="w-full rounded-xl">Get Started</Button>
                </Link>
              </SheetClose>
            </div>
          ) : (
            <div className="text-xs text-gray-500 px-1">
              You’re signed in as <span className="font-medium">{role}</span>.
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default ForumDynamicNavbar;
