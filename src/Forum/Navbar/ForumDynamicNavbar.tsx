"use client";
import MongoContext from "@/app/MongoContext";
import React, { useContext } from "react";
import ForumNavbar from "./ForumNavbar";
import CaregiverNavbar from "@/Caregivers/CaregiverNavbar";
import ProviderNavbar from "@/Providers/ProviderNavbar";
import CaregiverNavbarRight from "@/Caregivers/CaregiverNavbarRight";
import Link from "next/link";
import ProviderNavbarRight from "@/Providers/ProviderNavbarRight";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

function ForumDynamicNavbar() {
  const { userData }: any = useContext(MongoContext);

  return (
    <>
      {userData?.role === "caregiver" ? (
        <header>
          <nav className=" py-3 px-4 lg:px-6 shadow-md">
            <div className="flex flex-wrap justify-between items-center mx-auto max-w-screen-2xl">
              {/* Logo */}
              <Link className="flex items-center" href="/">
                <img
                  className="h-8 sm:h-10 mr-2"
                  src="https://firebasestorage.googleapis.com/v0/b/exhct2004.appspot.com/o/Kinscare%20Logo.svg?alt=media&token=e0ffb5fe-d0f9-4992-b505-a4180dffe444"
                  alt="Kinscare Logo"
                />
                <p className="text-sm font-medium">Kinscare</p>
              </Link>
              <div className="hidden lg:flex items-center space-x-6">
                <NavigationMenu>
                  <NavigationMenuList>
                    <NavigationMenuItem>
                      <Link
                        href="/community"
                        legacyBehavior
                        passHref
                      >
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
                      <Link
                        href="/community/create"
                        legacyBehavior
                        passHref
                      >
                        <NavigationMenuLink
                          className={navigationMenuTriggerStyle()}
                        >
                          Create Discussion
                        </NavigationMenuLink>
                      </Link>
                    </NavigationMenuItem>
                  </NavigationMenuList>
                </NavigationMenu>
              </div>
              {/* Right Section for Caregiver */}
              <div className="flex items-center space-x-3">
                <CaregiverNavbarRight />
              </div>
            </div>
          </nav>
        </header>
      ) : (
        <header>
          <nav className="py-3 px-4 lg:px-6 shadow-md">
            <div className="flex flex-wrap justify-between items-center mx-auto max-w-screen-2xl">
              {/* Logo */}
              <Link className="flex items-center" href="/">
                <img
                  className="h-8 sm:h-10 mr-2"
                  src="https://firebasestorage.googleapis.com/v0/b/exhct2004.appspot.com/o/Kinscare%20Logo.svg?alt=media&token=e0ffb5fe-d0f9-4992-b505-a4180dffe444"
                  alt="Kinscare Logo"
                />
                <p className="text-sm font-medium">Kinscare</p>
              </Link>

              {/* Navigation Links */}
              {userData && userData.role === "provider" && (
                <div className="hidden lg:flex items-center space-x-6">
                  <NavigationMenu>
                    <NavigationMenuList>
                      <NavigationMenuItem>
                        <Link
                          href="/provider/candidates/all"
                          legacyBehavior
                          passHref
                        >
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
                        <Link
                          href="/provider/job/update/new"
                          legacyBehavior
                          passHref
                        >
                          <NavigationMenuLink
                            className={navigationMenuTriggerStyle()}
                          >
                            Post Job
                          </NavigationMenuLink>
                        </Link>
                      </NavigationMenuItem>
                    </NavigationMenuList>
                  </NavigationMenu>
                </div>
              )}

              {/* Right Section for Providers */}
              <div className="flex items-center space-x-4">
                <ProviderNavbarRight />
              </div>

              {/* Hamburger Menu for Small Screens */}
              <div className="lg:hidden">{/* <MobileMenu /> */}</div>
            </div>
          </nav>
        </header>
      )}
    </>
  );
}

export default ForumDynamicNavbar;
