"use client";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  Sidebar,
  SidebarContent,
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
import CaregiverSearch from "@/Providers/Candidates/CaregiverSearch";
import ProviderNavbarRight from "@/Providers/ProviderNavbarRight";
import {
  BookmarkCheck,
  BriefcaseBusiness,
  ChevronRight,
  FrameIcon,
  Search,
  Settings,
  Sparkles,
  Speech,
  UserPen,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";

export function EmployerAppSidebar({
  children,
}: {
  children: React.ReactNode;
}) {
  // const [activeTeam, setActiveTeam] = React.useState(data.teams[0]);
  const pathname = usePathname();
  // console.log(pathname);

  const data = {
    navMain: [
      {
        title: "Find Caregivers",
        url: "/provider/candidates/all",
        icon: Search,
        isActive: false,
      },
      {
        title: "Saved Caregivers",
        url: "/provider/candidates/favorites",
        icon: BookmarkCheck,
        isActive: false,
      },
      {
        title: "Post Job",
        url: "/provider/job/update/new",
        icon: BriefcaseBusiness,
        isActive: false,
      },
      {
        title: "Your Job Postings",
        url: "/provider/job/all",
        icon: FrameIcon,
        isActive: false,
      },
      {
        title: "Update Profile",
        url: "/provider/account/settings/profile",
        icon: UserPen,
        isActive: false,
      },
      {
        title: "Jump Start Tracking",
        url: "/provider/jumpstart",
        icon: Sparkles,
        isActive: false,
      },
      {
        title: "Community",
        url: "/community",
        icon: Speech,
        isActive: false,
      },
      {
        title: "Account Settings",
        url: "/provider/account/settings",
        icon: Settings,
        isActive: false,
      },
    ],
  };
  const checkIsActive = (url: string): boolean => {
    return pathname === url;
  };
  const isActiveLink = (url: string, hasItems?: boolean): boolean => {
    if (hasItems) {
      return pathname.startsWith(url);
    }
    return pathname === url;
  };
  const findCaregiverActive = checkIsActive("/provider/candidates/all");
  const savedCaregiverActive = checkIsActive("/provider/candidates/favorites");
  const jobsActive = checkIsActive("/provider/job");
  const postJobActive = checkIsActive("/provider/job/update/new");
  const jobPostingsActive = checkIsActive("/provider/job/all");
  const accountSettingsActive = checkIsActive("/provider/account/settings");
  const updateProfileActive = checkIsActive(
    "/provider/account/settings/profile"
  );
  const communityActive = checkIsActive("/community");
  return (
    <SidebarProvider>
      <Sidebar variant="inset" collapsible="icon">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <Link className="flex items-center  mt-2" href="/">
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <div className="flex  items-center justify-center ">
                    <Image
                      width={35}
                      height={35}
                      className="h-6 pr-0 sm:h-8"
                      src="https://firebasestorage.googleapis.com/v0/b/exhct2004.appspot.com/o/Kinscare%20Logo.svg?alt=media&token=e0ffb5fe-d0f9-4992-b505-a4180dffe444"
                      alt="logo"
                    />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-bold">Kinscare</span>
                  </div>
                  {/* <ChevronsUpDown className="ml-auto" /> */}
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
            <SidebarMenu>
              {data.navMain.map((item: any) => {
                const isActive = isActiveLink(item.url, !!item.items);
                const activeClasses = isActive
                  ? "bg-blue-50 text-blue-700 border border-blue-100 shadow-sm"
                  : "hover:bg-gray-50";

                return item.items ? (
                  <Collapsible
                    key={item.title}
                    asChild
                    defaultOpen={isActive}
                    className="group/collapsible"
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          tooltip={item.title}
                          isActive={isActive}
                          data-active={isActive}
                          className={`relative font-semibold antialiased py-6 my-0.5 [&>svg]:w-6 [&>svg]:h-4 ${activeClasses}`}
                        >
                          {item.icon && <item.icon />}
                          <span>{item.title}</span>
                          <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.items?.map((subItem: any) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton
                                asChild
                                className="  font-semibold antialiased py-5
                    [&>svg]:w-6 [&>svg]:h-4"
                                isActive={pathname === subItem.url}
                              >
                                <Link href={subItem.url}>
                                  <span>{subItem.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                ) : (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        tooltip={item.title}
                        isActive={isActive}
                        asChild
                        className={`relative font-semibold antialiased py-5 [&>svg]:w-6 [&>svg]:h-4 ${activeClasses}`}
                      >
                        <Link href={item.url}>
                          {item.icon && <item.icon />}
                          <span>{item.title}</span>
                        </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        {/* Header / Top Bar */}
        <header className="sticky  top-0 z-30 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex  h-16 xl:h-14 items-center shrink-0 px-2 gap-2 transition-[height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            {/* Sidebar Trigger (always visible) */}
            <SidebarTrigger className="-ml-1" />

            {/* Desktop Nav (hidden on small) */}
            <nav className="hidden md:flex items-center gap-2">
              <NavigationMenu className="z-0">
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                      <Link href="/provider/candidates/all">Find Caregivers</Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>

              <NavigationMenu className="z-0">
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                      <Link href="/provider/job/update/new">Post Job</Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </nav>

            {/* Mobile Quick Links (hidden on md+) */}
            <nav className="hidden flex-1 min-w-0">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                <Link
                  href="/provider/candidates/all"
                  className="shrink-0 inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-medium hover:bg-muted"
                >
                  Find Caregivers
                </Link>
                <Link
                  href="/provider/job/update/new"
                  className="shrink-0 inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-medium hover:bg-muted"
                >
                  Post Job
                </Link>
              </div>
            </nav>

            {/* Search (take remaining space on md+, hide on mobile or swap for icon if you want) */}
            <div className=" md:flex flex-1 min-w-0">
              <CaregiverSearch />
            </div>

            {/* Right Section */}
            <div className="flex items-center ml-auto">
              <ProviderNavbarRight />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main>{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
