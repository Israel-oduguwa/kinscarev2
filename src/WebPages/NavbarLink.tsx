"use client";
import React from "react";
// import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
function NavbarLink() {
  //   const router:any = useRouter();
  const pathname = usePathname();
  return (
    <ul className="flex flex-col mt-4 font-medium lg:flex-row lg:space-x-8 lg:mt-0">
      <NavigationMenu>
        <NavigationMenuList className="gap-2">
          <NavigationMenuItem>
            <Link href="/find-jobs" legacyBehavior passHref>
              <NavigationMenuLink active={pathname === "/find-jobs"} className={`${navigationMenuTriggerStyle()} ${pathname !== "/find-jobs" && "bg-transparent"}`}>
                Jobs
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link href="/find-caregivers"  legacyBehavior passHref>
              <NavigationMenuLink active={pathname === "/find-caregivers"} className={`${navigationMenuTriggerStyle()} ${pathname !== "/find-caregiver" && "bg-transparent"}`}>
                Find caregivers
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link href="/subscribe" legacyBehavior passHref>
              <NavigationMenuLink active={pathname === "/subscribe"}  className={`${navigationMenuTriggerStyle()} ${pathname !== "/subscribe" && "bg-transparent"}`}>
                Pricing/plans
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link href="/why-kinscare" legacyBehavior passHref>
              <NavigationMenuLink className={`${navigationMenuTriggerStyle()} ${pathname !== "/why-kinscare" && "bg-transparent"}`}>
                Why kinscare
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </ul>
  );
}

export default NavbarLink;
