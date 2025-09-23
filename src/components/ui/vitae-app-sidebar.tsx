"use client";
import * as React from "react";
import {
  AudioWaveform,
  BriefcaseBusiness,
  BriefcaseMedical,
  ChevronRight,
  GalleryVerticalEnd,
  Map,
  PieChart,
  SearchCheck,
  BookOpen,
  User2Icon,
  Speech,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import Link from "next/link";
import CaregiverNavbarRight from "@/Caregivers/CaregiverNavbarRight";
import { usePathname } from "next/navigation";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "./navigation-menu";
import Image from "next/image";

/**
 * Small helpers for stateful styles & a11y
 */
const itemClasses = (active: boolean) =>
  [
    "font-semibold antialiased py-5",
    "[&>svg]:w-5 [&>svg]:h-5",
    "transition-colors duration-150",
    active
      ? "bg-blue-100 text-blue-700 hover:bg-blue-200 hover:text-blue-800"
      : "text-gray-700 hover:text-gray-900 hover:bg-gray-50",
  ].join(" ");

const subItemClasses = (active: boolean) =>
  [
    "py-3 pl-3 pr-2 rounded-md",
    "transition-colors duration-150",
    active
      ? "bg-blue-50 text-blue-700 border-l-4 border-blue-600"
      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
  ].join(" ");

export function AppSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const data = {
    user: {
      name: "shadcn",
      email: "m@example.com",
      avatar: "/avatars/shadcn.jpg",
    },
    teams: [
      { name: "Acme Inc", logo: GalleryVerticalEnd, plan: "Enterprise" },
      { name: "Acme Corp.", logo: AudioWaveform, plan: "Startup" },
      { name: "Evil Corp.", logo: GalleryVerticalEnd, plan: "Free" },
    ],
    navMain: [
      {
        title: "Refer + Make $.",
        url: "/vitae/crowd-post", // base bucket
        icon: BriefcaseBusiness,
        isActive: false,
        items: [
          {
            title: "New",
            url: "/vitae/crowd-post/update/new",
          },
          {
            title: "Your referrals",
            url: "/vitae/referrals",
          },
        ],
      },
    ],
    projects: [
      { name: "Design Engineering", url: "#", icon: PieChart },
      { name: "Sales & Marketing", url: "#", icon: PieChart },
      { name: "Travel", url: "#", icon: Map },
    ],
  };

  /** Robust active checks (top-level & nested) */
  const isCurrent = (url: string) => pathname === url;
  const startsWith = (url: string) =>
    pathname === url || pathname.startsWith(`${url}/`);

  const findJobsActive = isCurrent("/vitae/jobs/all");
  const savedJobsActive = isCurrent("/vitae/favorites");
  const appliedJobsActive = isCurrent("/vitae/applied-jobs");
  const careerPlanActive = isCurrent("/vitae/career-plan");
  const updateResumeActive = isCurrent("/vitae/update");
  const crowdPostActive = startsWith("/vitae/crowd-post") || isCurrent("/vitae/referrals");

  /** For collapsible: auto open when a child is active */
  const isSectionOpen = (sectionUrl: string, items?: { url: string }[]) => {
    if (startsWith(sectionUrl)) return true;
    return (items || []).some((i) => startsWith(i.url));
  };

  return (
    <SidebarProvider>
      <Sidebar variant="sidebar" collapsible="icon">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <Link className="flex items-center mr-2 mt-2" href="/" aria-label="Go to Kinscare Home">
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <div className="flex items-center justify-center">
                    <Image
                      width={40}
                      height={40}
                      className="h-6 pr-1 sm:h-8"
                      src="https://firebasestorage.googleapis.com/v0/b/exhct2004.appspot.com/o/Kinscare%20Logo.svg?alt=media&token=e0ffb5fe-d0f9-4992-b505-a4180dffe444"
                      alt="Kinscare logo"
                    />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">Kinscare</span>
                  </div>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Your Dashboard</SidebarGroupLabel>
            <SidebarMenu className="space-y-1">
              {/* Find Jobs */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className={itemClasses(findJobsActive)}
                  aria-current={findJobsActive ? "page" : undefined}
                  tooltip="Find Jobs"
                >
                  <Link href="/vitae/jobs/all">
                    <SearchCheck aria-hidden="true" />
                    <span className="text-sm">Find Jobs</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Refer + Make $. (collapsible) */}
              {data.navMain.map((item, idx) => {
                const open = isSectionOpen(item.url, item.items);
                return (
                  <div key={idx}>
                    {item.items ? (
                      <Collapsible asChild defaultOpen={open} className="group/collapsible">
                        <SidebarMenuItem>
                          <CollapsibleTrigger asChild>
                            <SidebarMenuButton
                              className={itemClasses(crowdPostActive)}
                              aria-current={crowdPostActive ? "true" : undefined}
                              tooltip={item.title}
                            >
                              {item.icon && <item.icon aria-hidden="true" />}
                              <span className="text-sm">{item.title}</span>
                              <ChevronRight
                                className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"
                                aria-hidden="true"
                              />
                            </SidebarMenuButton>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <SidebarMenuSub className="space-y-1">
                              {item.items?.map((sub, sidx) => {
                                const active = isCurrent(sub.url);
                                return (
                                  <SidebarMenuSubItem key={sidx}>
                                    <SidebarMenuSubButton asChild className={subItemClasses(active)}>
                                      <Link
                                        href={sub.url}
                                        aria-current={active ? "page" : undefined}
                                      >
                                        <span className="font-medium text-sm">{sub.title}</span>
                                      </Link>
                                    </SidebarMenuSubButton>
                                  </SidebarMenuSubItem>
                                );
                              })}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        </SidebarMenuItem>
                      </Collapsible>
                    ) : (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          className={itemClasses(startsWith(item.url))}
                          aria-current={startsWith(item.url) ? "true" : undefined}
                          tooltip={item.title}
                        >
                          <Link href={item.url}>
                            {item.icon && <item.icon aria-hidden="true" />}
                            <span className="text-sm">{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )}
                  </div>
                );
              })}

              {/* Saved Jobs */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className={itemClasses(savedJobsActive)}
                  aria-current={savedJobsActive ? "page" : undefined}
                  tooltip="Saved Jobs"
                >
                  <Link href="/vitae/favorites">
                    <PieChart aria-hidden="true" />
                    <span className="text-sm">Saved Jobs</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Applied Jobs */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className={itemClasses(appliedJobsActive)}
                  aria-current={appliedJobsActive ? "page" : undefined}
                  tooltip="Applied Jobs"
                >
                  <Link href="/vitae/applied-jobs">
                    <BriefcaseMedical aria-hidden="true" />
                    <span className="text-sm text">Applied Jobs</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Career Plan */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className={itemClasses(careerPlanActive)}
                  aria-current={careerPlanActive ? "page" : undefined}
                  tooltip="Career Plan"
                >
                  <Link href="/vitae/career-plan">
                    <BookOpen aria-hidden="true" />
                    <span className="text-sm">Career Plan</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Update Resume */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className={itemClasses(updateResumeActive)}
                  aria-current={updateResumeActive ? "page" : undefined}
                  tooltip="Update resume"
                >
                  <Link href="/vitae/update">
                    <User2Icon aria-hidden="true" />
                    <span className="text-sm">Update resume</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Community */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className={itemClasses(false)}
                  tooltip="Community"
                >
                  <Link href="/community">
                    <Speech aria-hidden="true" />
                    <span className="text-sm">Community</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>

        <SidebarRail />
      </Sidebar>

      <SidebarInset>
        <div className="flex items-center h-16 shrink-0 my-1 px-2 gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 mx-auto w-full xl:max-w-screen-xl">
          <SidebarTrigger className="-ml-1" aria-label="Toggle sidebar" />

          {/* Top nav: use asChild to avoid nested anchors; add active state */}
          <NavigationMenu className="hidden md:block">
            <NavigationMenuList>
              <NavigationMenuItem>
                <Link href="/vitae/jobs/all"  passHref>
                  <NavigationMenuLink
                    className={navigationMenuTriggerStyle()}
                    aria-current={findJobsActive ? "page" : undefined}
                  >
                    Find Jobs
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          <NavigationMenu className="hidden md:block">
            <NavigationMenuList>
              <NavigationMenuItem>
                <Link href="/vitae/career-plan"  passHref>
                  <NavigationMenuLink
                    className={navigationMenuTriggerStyle()}
                    aria-current={careerPlanActive ? "page" : undefined}
                  >
                    Career Plan
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          <div className="flex items-center ml-auto">
            <CaregiverNavbarRight />
          </div>
        </div>

        <main>{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
