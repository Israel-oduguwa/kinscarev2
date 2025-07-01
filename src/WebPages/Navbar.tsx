"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import NavbarLink from "./NavbarLink";
import MongoContext from "@/app/MongoContext";
import { useContext } from "react";
import CaregiverNavbarRight from "@/Caregivers/CaregiverNavbarRight";
import ProviderNavbarRight from "@/Providers/ProviderNavbarRight";
import Image from "next/image";

function MobileMenu() {
  const pathname = usePathname();
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="inline-flex items-center justify-center p-3 text-gray-500 rounded-md lg:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <Menu size={24} />
        </button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="bg-white dark:bg-gray-900 shadow-xl w-80 px-6 py-12"
      >
        <div className="flex flex-col">
          {/* Navigation Links */}
          <nav className="space-y-4">
            {[
              { href: "/find-jobs", label: "Jobs" },
              { href: "/find-caregivers", label: "Find Caregivers" },
              { href: "/explore", label: "Explore" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-4 py-3  font-medium rounded-md transition-colors ${
                  pathname === link.href
                    ? "text-white bg-blue-500"
                    : "text-gray-800 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="mt-8 space-y-3">
            <Link href="/signin">
              <Button variant="outline" className="w-full mb-6">
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="w-full">Get Started</Button>
            </Link>
          </div>
        </div>

        {/* Close Button */}
        {/* <SheetClose asChild>
          <button className="mt-10 w-full px-4 py-3 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 focus:ring-2 focus:ring-gray-400 focus:outline-none">
            Close Menu
          </button>
        </SheetClose> */}
      </SheetContent>
    </Sheet>
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
            <p className="text-sm font-medium">Kinscare</p>
          </Link>
          {/* Right Section */}
          <div className="hidden lg:flex items-center lg:order-2">
            { userData && userData.role === "caregiver" ? (
              <>
                <CaregiverNavbarRight />
              </>
            ) : (
              <>
                {userData && userData.role === "provider" ? (
                  <>
                    <ProviderNavbarRight />
                  </>
                ) : (
                  <>
                    {" "}
                    <Link href="/signin">
                      <Button
                        variant="ghost"
                        className={`mr-2 py-2 px-4 font-semibold text-sm ${
                          pathname === "/signin"
                            ? "bg-blue-100 text-blue-600"
                            : ""
                        }`}
                      >
                        Sign in
                      </Button>
                    </Link>
                    <Link href="/signup">
                      <Button
                        className={`py-2 px-4 font-semibold text-sm ${
                          pathname === "/signup" ? "bg-blue-500 text-white" : ""
                        }`}
                      >
                        Get started
                      </Button>
                    </Link>
                  </>
                )}
              </>
            )}
          </div>
          {/* Mobile Menu */}
          <div className="lg:hidden flex items-center">
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
