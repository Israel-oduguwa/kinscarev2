"use client";
import {
  AudioWaveform,
  BookmarkCheck,
  BriefcaseBusiness,
  ChevronRight,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Search,
  Settings,
  Sparkles,
  Speech,
  UserPen,
} from "lucide-react";
import * as React from "react";
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
import ProviderNavbarRight from "@/Providers/ProviderNavbarRight";
import Link from "next/link";
import { usePathname } from "next/navigation";
import CaregiverSearch from "@/Providers/Candidates/CaregiverSearch";
import Image from "next/image";

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
        title: "Jobs",
        url: "/provider/job",
        icon: BriefcaseBusiness,
        isActive: true,
        items: [
          {
            title: "Post Job",
            url: "/provider/job/update/new",
          },
          {
            title: "Your Job Postings",
            url: "/provider/job/all",
          },
        ],
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
              {data.navMain.map((item) => {
                const isActive = isActiveLink(item.url, !!item.items);

                return item.items ? (
                  <Collapsible
                    key={item.title}
                    asChild
                    defaultOpen={isActive}
                    className="group/collapsible"
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton className=" font-semibold antialiased py-6 my-0.5 
                                [&>svg]:w-6 [&>svg]:h-4"
                          tooltip={item.title}
                          isActive={isActive}
                        >
                          {item.icon && <item.icon />}
                          <span>{item.title}</span>
                          <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.items?.map((subItem) => (
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
                      className="  font-semibold antialiased py-5
                    [&>svg]:w-6 [&>svg]:h-4"
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
        <div className="flex items-center m  h-16 xl:h-14 shrink-0 my-1 px-2 gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 ">
          {/* Sidebar Trigger */}
          <SidebarTrigger className="-ml-1" />
          {/* Navigation Links */}
          <NavigationMenu className="hidden z-0 md:block">
            <NavigationMenuList>
              <NavigationMenuItem>
                <Link href="/provider/candidates/all"  passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Find Caregivers
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
          <NavigationMenu className="hidden z-0 md:block">
            <NavigationMenuList>
              <NavigationMenuItem>
                <Link href="/provider/job/update/new"  passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Post Job
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
          {/* Right Section */}
          <CaregiverSearch />
          <div className="flex items-center ml-auto">
            <ProviderNavbarRight />
          </div>
        </div>

        {/* <header className="flex h-16 shrink-0 items-center justify-between w-full  gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
          </div>
        </header> */}
        <main>{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
