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

export function EmployerAppSidebar({
  children,
}: {
  children: React.ReactNode;
}) {
  // const [activeTeam, setActiveTeam] = React.useState(data.teams[0]);
  const pathname = usePathname();
  // console.log(pathname);

  const data = {
    user: {
      name: "shadcn",
      email: "m@example.com",
      avatar: "/avatars/shadcn.jpg",
    },
    teams: [
      {
        name: "Acme Inc",
        logo: GalleryVerticalEnd,
        plan: "Enterprise",
      },
      {
        name: "Acme Corp.",
        logo: AudioWaveform,
        plan: "Startup",
      },
      {
        name: "Evil Corp.",
        logo: Command,
        plan: "Free",
      },
    ],

    navMain: [
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
            title: "Your Job postings",
            url: "/provider/job/all",
          },
        ],
      },
      // {
      //   title: "Conversations",
      //   url: "/vitae/conversations",
      //   icon: MessageCircle,
      // },
    ],
    projects: [
      {
        name: "Design Engineering",
        url: "#",
        icon: Frame,
      },
      {
        name: "Sales & Marketing",
        url: "#",
        icon: PieChart,
      },
      {
        name: "Travel",
        url: "#",
        icon: Map,
      },
    ],
  };
  const checkIsActive = (url: string): boolean => {
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
      <Sidebar variant="sidebar" collapsible="icon">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <Link className="flex items-center  mt-2" href="/">
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <div className="flex  items-center justify-center ">
                    <img
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
            <SidebarGroupLabel>Your Dashboard</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  className={`
                    font-semibold antialiased py-5
                    [&>svg]:w-6 [&>svg]:h-4
                    ${
                      findCaregiverActive
                        ? "bg-blue-100 text-blue-600"
                        : " text-gray-700"
                    } 
                    ${
                      findCaregiverActive
                        ? "hover:bg-blue-200 hover:text-blue-700"
                        : " hover:text-gray-800"
                    }
                    ${
                      findCaregiverActive
                        ? "hover:bg-blue-200 hover:text-blue-700"
                        : " hover:text-gray-800"
                    }
                    transition-all duration-200
                  `}
                  tooltip="Dashboard"
                >
                  <Search />
                  <Link href="/provider/candidates/all">
                    <span>Find Caregivers</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  className={`
                    font-semibold antialiased py-5
                    [&>svg]:w-6 [&>svg]:h-4
                    ${
                      savedCaregiverActive
                        ? "bg-blue-100 text-blue-600"
                        : " text-gray-700"
                    } 
                    ${
                      savedCaregiverActive
                        ? "hover:bg-blue-200 hover:text-blue-700"
                        : " hover:text-gray-800"
                    }
                    ${
                      savedCaregiverActive
                        ? "hover:bg-blue-200 hover:text-blue-700"
                        : " hover:text-gray-800"
                    }
                    transition-all duration-200
                  `}
                  tooltip="Dashboard"
                >
                  <BookmarkCheck />
                  <Link href="/provider/candidates/favorites">
                    <span>Saved Caregivers</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {data.navMain.map((item, idx) => {
                const isActive =
                  pathname === item.url || pathname?.startsWith(`${item.url}/`);
                // console.log(isActive);
                // console.log(item.url, isActive);
                return (
                  <>
                    {item.items ? (
                      <Collapsible
                        key={idx}
                        asChild
                        defaultOpen={item.isActive}
                        className="group/collapsible"
                      >
                        <SidebarMenuItem>
                          <CollapsibleTrigger asChild>
                            <SidebarMenuButton
                              className={`
                                font-semibold antialiased py-6 my-0.5 
                                [&>svg]:w-6 [&>svg]:h-4
                                ${
                                  isActive
                                    ? "bg-blue-100 text-blue-600"
                                    : " text-gray-700"
                                } 
                                ${
                                  isActive
                                    ? "hover:bg-blue-200 hover:text-blue-700"
                                    : " hover:text-gray-800"
                                }
                                transition-all duration-200
                              `}
                              tooltip={item.title}
                            >
                              {item.icon && <item.icon />}
                              <span>{item.title}</span>
                              <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                            </SidebarMenuButton>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <SidebarMenuSub>
                              {item.items?.map((subItem, idx) => (
                                <SidebarMenuSubItem key={idx}>
                                  <SidebarMenuSubButton
                                    className="py-4"
                                    asChild
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
                          isActive={isActive}
                          className="py-6 my-0.5 [&>svg]:size-5"
                          tooltip={item.title}
                        >
                          {item.icon && <item.icon />}
                          <Link href={item.url}>
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )}
                  </>
                );
              })}
              <SidebarMenuItem>
                <SidebarMenuButton
                  className={`
                    font-semibold antialiased py-5
                    [&>svg]:w-6 [&>svg]:h-4
                    ${
                      updateProfileActive
                        ? "bg-blue-100 text-blue-600"
                        : " text-gray-700"
                    } 
                    ${
                      updateProfileActive
                        ? "hover:bg-blue-200 hover:text-blue-700"
                        : " hover:text-gray-800"
                    }
                    ${
                      updateProfileActive
                        ? "hover:bg-blue-200 hover:text-blue-700"
                        : " hover:text-gray-800"
                    }
                    transition-all duration-200
                  `}
                  tooltip="Dashboard"
                >
                  <UserPen />
                  <Link href="/provider/account/settings/profile">
                    <span className="text-md">Update settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  className={`
                    font-semibold antialiased py-5
                    [&>svg]:w-6 [&>svg]:h-4
                    ${
                      communityActive
                        ? "bg-blue-100 text-blue-600"
                        : " text-gray-700"
                    } 
                    ${
                      communityActive
                        ? "hover:bg-blue-200 hover:text-blue-700"
                        : " hover:text-gray-800"
                    }
                    ${
                      communityActive
                        ? "hover:bg-blue-200 hover:text-blue-700"
                        : " hover:text-gray-800"
                    }
                    transition-all duration-200
                  `}
                  tooltip="Dashboard"
                >
                  <Speech />
                  <Link href="/community">
                    <span className="text-md">Community</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  
                  className={`
                    font-semibold antialiased py-5
                    [&>svg]:w-6 [&>svg]:h-4
                    ${
                      accountSettingsActive
                        ? "bg-blue-100 text-blue-600"
                        : " text-gray-700"
                    } 
                    ${
                      accountSettingsActive
                        ? "hover:bg-blue-200 hover:text-blue-700"
                        : " hover:text-gray-800"
                    }
                    ${
                      accountSettingsActive
                        ? "hover:bg-blue-200 hover:text-blue-700"
                        : " hover:text-gray-800"
                    }
                    transition-all duration-200
                  `}
                  tooltip="Dashboard"
                >
                  <Settings />
                  <Link href="/provider/account/settings">
                    <span className="text-md">Account settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <div className="flex items-center  h-16 shrink-0 my-1 px-2 gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 mx-auto w-full xl:max-w-screen-xl">
          {/* Sidebar Trigger */}
          <SidebarTrigger className="-ml-1" />

          {/* Navigation Links */}
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <Link href="/provider/candidates/all" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Find Caregivers
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <Link href="/provider/job/update/new" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Post Job
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
          {/* Right Section */}
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
