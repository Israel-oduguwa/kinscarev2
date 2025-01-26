"use client";
import * as React from "react";
import {
  AudioWaveform,
  BadgeCheck,
  Bell,
  BookmarkCheck,
  BookOpen,
  Bot,
  BriefcaseBusiness,
  BriefcaseMedical,
  ChevronRight,
  ChevronsUpDown,
  Command,
  CreditCard,
  Folder,
  Forward,
  Frame,
  GalleryVerticalEnd,
  House,
  LibraryBig,
  LogOut,
  Map,
  MessageCircle,
  MoreHorizontal,
  PieChart,
  Plus,
  SearchCheck,
  Settings2,
  Sparkles,
  Speech,
  SquareTerminal,
  Trash2,
  User2Icon,
  UserPen,
} from "lucide-react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
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
import { update } from "lodash";

export function AppSidebar({ children }: { children: React.ReactNode }) {
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
        title: "Refer + Make $.",
        url: "",
        icon: BriefcaseBusiness,
        isActive: false,
        items: [
          {
            title: "New",
            url: "/vitae/crowd-post/update/new",
          }
        ],
      },
      // {
      //   title: "Career Path",
      //   url: "/vitae/home",
      //   icon: LibraryBig,
      //   isActive: true,
      //   items: [
      //     {
      //       title: "Home",
      //       url: "/vitae/career-plan",
      //     },
      //     // {
      //     //   title: "Add Course Plan",
      //     //   url: "/vitae/add-course-plan",
      //     // },
      //     // {
      //     //   title: "Add Work Experience",
      //     //   url: "/vitae/add-work-experience",
      //     // },
      //     // {
      //     //   title: "Invite Friends",
      //     //   url: "/vitae/refer-friends",
      //     // },
      //     // {
      //     //   title: "Refer Employer",
      //     //   url: "/vitae/referral",
      //     // },
      //   ],
      // },

      // {
      //   title: "Conversations",
      //   url: "/vitae/conversations",
      //   icon: MessageCircle,
      // },
      // {
      //   title: "Profile",
      //   url: "/vitae/update",
      //   isActive: true,
      //   icon: UserPen,
      //   items: [
      //     {
      //       title: "Update Resume",
      //       url: "/vitae/update",
      //     },
      //   ],
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
  const findJobsActive = checkIsActive("/vitae/jobs/all");
  const savedJobsActive = checkIsActive("/vitae/favorites");
  const appliedJobsActive = checkIsActive("vitae/applied-jobs");
  const careerPlanActive = checkIsActive("/vitae/career-plan");
  const updateResumeActive = checkIsActive("/vitae/update");
  const crowdPostActive = checkIsActive("vitae/crowd-post/update/new");

  return (
    <SidebarProvider>
      <Sidebar variant="sidebar" collapsible="icon">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <Link className="flex items-center mr-2 mt-2" href="/">
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <div className="flex  items-center justify-center ">
                    <img
                      className="h-6 pr-1 sm:h-8"
                      src="https://firebasestorage.googleapis.com/v0/b/exhct2004.appspot.com/o/Kinscare%20Logo.svg?alt=media&token=e0ffb5fe-d0f9-4992-b505-a4180dffe444"
                      alt="logo"
                    />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">Kinscare</span>
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
                      findJobsActive
                        ? "bg-blue-100 text-blue-600"
                        : " text-gray-700"
                    } 
                    ${
                      findJobsActive
                        ? "hover:bg-blue-200 hover:text-blue-700"
                        : " hover:text-gray-800"
                    }
                    ${
                      findJobsActive
                        ? "hover:bg-blue-200 hover:text-blue-700"
                        : " hover:text-gray-800"
                    }
                    transition-all duration-200
                  `}
                  tooltip="Dashboard"
                >
                  <SearchCheck />
                  <Link href="/vitae/jobs/all">
                    <span className="text-md">Find Jobs</span>
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
                                  crowdPostActive
                                    ? "bg-blue-100 text-blue-600"
                                    : " text-gray-700"
                                } 
                                ${
                                  crowdPostActive
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
                          isActive={crowdPostActive}
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
                      savedJobsActive
                        ? "bg-blue-100 text-blue-600"
                        : " text-gray-700"
                    } 
                    ${
                      savedJobsActive
                        ? "hover:bg-blue-200 hover:text-blue-700"
                        : " hover:text-gray-800"
                    }
                    ${
                      savedJobsActive
                        ? "hover:bg-blue-200 hover:text-blue-700"
                        : " hover:text-gray-800"
                    }
                    transition-all duration-200
                  `}
                  tooltip="Dashboard"
                >
                  <BookmarkCheck />
                  <Link href="/vitae/favorites">
                    <span className="text-md">Saved Jobs</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  className={`
                    font-semibold antialiased py-5
                    [&>svg]:w-6 [&>svg]:h-4
                    ${
                      appliedJobsActive
                        ? "bg-blue-100 text-blue-600"
                        : " text-gray-700"
                    } 
                    ${
                      appliedJobsActive
                        ? "hover:bg-blue-200 hover:text-blue-700"
                        : " hover:text-gray-800"
                    }
                    ${
                      appliedJobsActive
                        ? "hover:bg-blue-200 hover:text-blue-700"
                        : " hover:text-gray-800"
                    }
                    transition-all duration-200
                  `}
                  tooltip="Dashboard"
                >
                  <BriefcaseMedical />
                  <Link href="/vitae/applied-jobs">
                    <span className="text-md">Applied Job</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  className={`
                    font-semibold antialiased py-5
                    [&>svg]:w-6 [&>svg]:h-4
                    ${
                      careerPlanActive
                        ? "bg-blue-100 text-blue-600"
                        : " text-gray-700"
                    } 
                    ${
                      careerPlanActive
                        ? "hover:bg-blue-200 hover:text-blue-700"
                        : " hover:text-gray-800"
                    }
                    ${
                      careerPlanActive
                        ? "hover:bg-blue-200 hover:text-blue-700"
                        : " hover:text-gray-800"
                    }
                    transition-all duration-200
                  `}
                  tooltip="Dashboard"
                >
                  <BookOpen />
                  <Link href="/vitae/career-plan">
                    <span className="text-md">Career Plan</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  className={`
                    font-semibold antialiased py-5
                    [&>svg]:w-6 [&>svg]:h-4
                    ${
                      updateResumeActive
                        ? "bg-blue-100 text-blue-600"
                        : " text-gray-700"
                    } 
                    ${
                      updateResumeActive
                        ? "hover:bg-blue-200 hover:text-blue-700"
                        : " hover:text-gray-800"
                    }
                    ${
                      updateResumeActive
                        ? "hover:bg-blue-200 hover:text-blue-700"
                        : " hover:text-gray-800"
                    }
                    transition-all duration-200
                  `}
                  tooltip="Dashboard"
                >
                  <User2Icon />
                  <Link href="/vitae/update">
                    <span className="text-md">Update resume</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  className={`
                    font-semibold antialiased py-5
                    [&>svg]:w-6 [&>svg]:h-4
                    ${false ? "bg-blue-100 text-blue-600" : " text-gray-700"} 
                    ${
                      false
                        ? "hover:bg-blue-200 hover:text-blue-700"
                        : " hover:text-gray-800"
                    }
                    ${
                      false
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
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <div className="flex items-center  h-16 shrink-0 my-1 px-2 gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 mx-auto w-full xl:max-w-screen-xl">
          <SidebarTrigger className="-ml-1" />
          {/* Navigation Links */}
          <NavigationMenu className="hidden md:block">
            <NavigationMenuList>
              <NavigationMenuItem>
                <Link href="/vitae/jobs/all" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Find Jobs
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
          <NavigationMenu className="hidden md:block">
            <NavigationMenuList>
              <NavigationMenuItem>
                <Link href="/vitae/career-plan" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
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
