"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

function NavbarLink() {
  const pathname = usePathname();

  // Define your menu items in a small array so it’s easier to maintain
  const menuItems = [
    { label: "Jobs", href: "/find-jobs" },
    { label: "Find Caregivers", href: "/find-caregivers" },
    { label: "Jump Start Hiring", href: "/jumpstart-hiring" },
    { label: "Explore", href: "/explore" },
    { label: "Plans & Pricing", href: "/pricing" },
    { label: "Blog", href: "/blog" },
    { label: "Community", href: "/community" },
  ];

  return (
    <NavigationMenu>
      <NavigationMenuList className="flex flex-col mt-4 font-medium lg:flex-row lg:space-x-3 lg:mt-0">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <NavigationMenuItem key={item.href}>
              {/* 
                Use `asChild` so that the NavigationMenuLink simply passes its behavior down to Link.
                We then apply our own conditional className to indicate “active” vs “inactive.” 
              */}
              <NavigationMenuLink asChild>
                <Link
                  href={item.href}
                  className={`
                    ${navigationMenuTriggerStyle()} 
                    ${!isActive ? "bg-transparent" : ""}
                  `}
                >
                  {item.label}
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          );
        })}
      </NavigationMenuList>
    </NavigationMenu>
  );
}

export default NavbarLink;
