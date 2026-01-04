"use client";

import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/context/AuthContext";
import AgentAuth from "@/HiringAgent/AgentAuth";
import { UserButton } from "@clerk/nextjs";
import {
  ArrowLeft,
  DoorClosed,
  DoorOpen,
  Flag,
  LineChart,
  LogOut,
  Menu,
  MessageCircle,
  WorkflowIcon,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import TagManager from "react-gtm-module";

const agentLinks = [
  // {
  //   href: "/agent",
  //   label: "Dashboard",
  //   icon: <ClipboardList className="h-5 w-5" />,
  //   description: "Overview and analytics",
  // },
  {
    href: "/agent/twilio",
    label: "Twilio Providers",
    icon: <MessageCircle className="h-5 w-5" />,
    description: "Manage communication settings",
  },
  {
    href: "/agent/jobs",
    label: "All Jobs",
    icon: <WorkflowIcon className="h-5 w-5" />,
    description: "Your Job Postings",
  },
  {
    href: "/agent/metrics",
    label: "Metrics",
    icon: <LineChart className="h-5 w-5" />,
    description: "Jumpstart performance insights",
  },
  {
    href: "/agent/reports",
    label: "Reports",
    icon: <Flag className="h-5 w-5" />,
    description: "Conversation moderation tickets",
  },
  // {
  //   href: "/agent/caregivers",
  //   label: "Caregivers",
  //   icon: <Users className="h-5 w-5" />,
  //   description: "Manage caregiver matches"
  // },
];

const pageHeaderMap: Record<string, { title: string; description: string }> = {
  "/agent": {
    title: "Jumpstart Hiring Queue",
    description:
      "Review new applications, assign interviews, and keep the pipeline moving.",
  },
  "/agent/twilio": {
    title: "Twilio Applicants",
    description: "Manage Twilio SMS leads and job actions for providers.",
  },
  "/agent/jobs": {
    title: "All Jobs",
    description: "Track job postings, updates, and provider activity.",
  },
  "/agent/metrics": {
    title: "Jumpstart Metrics",
    description: "Visualize pipeline health and conversion performance.",
  },
  "/agent/reports": {
    title: "Conversation Reports",
    description: "Review reported conversations and take action.",
  },
};

export default function AgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const activeLink = agentLinks.find((link) => link.href === pathname);
  const pageHeader = pageHeaderMap[pathname ?? ""] ?? null;
  const pageTitle = pageHeader?.title ?? activeLink?.label ?? "Agent Dashboard";
  const pageDescription =
    pageHeader?.description ??
    activeLink?.description ??
    "Overview of your hiring pipeline and tasks";
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { contactData, userData }: any = useAuthContext();
  const router = useRouter();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <AgentAuth>
      <div className="min-h-screen flex bg-slate-50 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 -right-32 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.2),transparent_62%)] blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.16),transparent_60%)] blur-3xl" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.2)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.2)_1px,transparent_1px)] [background-size:72px_72px] opacity-20" />
        </div>
        {/* Mobile Header */}
        <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-xl border-b border-slate-200 z-30 flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Image
              width={40}
              height={40}
              src="https://firebasestorage.googleapis.com/v0/b/exhct2004.appspot.com/o/Kinscare%20Logo.svg?alt=media&token=e0ffb5fe-d0f9-4992-b505-a4180dffe444"
              alt="KinsCare Logo"
              className="rounded-lg"
            />
            <div>
              <h1 className="font-bold text-slate-800 ">KinsCare</h1>
              <p className="text-xs text-slate-600">Agent Dashboard</p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="h-10 w-10 rounded-xl"
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Sidebar - Desktop */}
        <aside
          className={`fixed top-0 left-0 h-screen bg-white/80 backdrop-blur-xl border-r border-slate-200/70 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.45)] z-20 flex-col hidden md:flex transition-all duration-300 ease-in-out ${
            isSidebarCollapsed ? "w-20" : "w-80"
          }`}
        >
          <div className="relative z-10 flex flex-col flex-1 h-full">
            {/* Logo Section + Collapse Toggle (moved here) */}
            <div
              className={`py-8 px-6 border-b border-slate-200/60 transition-all duration-300 ${
                isSidebarCollapsed ? "px-4" : ""
              }`}
            >
              <div
                className={`flex items-center transition-all duration-300 ${
                  isSidebarCollapsed ? "justify-center" : "justify-between"
                }`}
              >
                <div
                  className={`flex items-center gap-4 transition-all duration-300 ${
                    isSidebarCollapsed ? "justify-center" : ""
                  }`}
                >
                  <Image
                    width={40}
                    height={40}
                    src="https://firebasestorage.googleapis.com/v0/b/exhct2004.appspot.com/o/Kinscare%20Logo.svg?alt=media&token=e0ffb5fe-d0f9-4992-b505-a4180dffe444"
                    alt="KinsCare Logo"
                    className="shadow-sm transition-transform duration-300 hover:scale-105"
                  />
                  <div
                    className={`transition-all duration-300 overflow-hidden ${
                      isSidebarCollapsed
                        ? "w-0 opacity-0"
                        : "w-auto opacity-100"
                    }`}
                  >
                    <h1 className="font-bold text-lg bg-linear-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent whitespace-nowrap">
                      KinsCare
                    </h1>
                    <p className="text-sm text-slate-600 mt-1 whitespace-nowrap">
                      Hiring Agent Portal
                    </p>
                  </div>
                </div>

                {/* Desktop Collapse Toggle Button (icon changed to DoorOpen/DoorClosed) */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                  className="p-2 rounded-xl text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-all duration-300"
                  aria-label={
                    isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
                  }
                  title={isSidebarCollapsed ? "Expand" : "Collapse"}
                >
                  {isSidebarCollapsed ? (
                    <DoorOpen className="h-5 w-5" />
                  ) : (
                    <DoorClosed className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>

            {/* User Info Section */}
            {userData && (
              <div
                className={`px-6 pt-4 pb-8 border-b border-slate-200/60 transition-all duration-300 ${
                  isSidebarCollapsed ? "px-4" : ""
                }`}
              >
                <div
                  className={`flex items-center gap-3 transition-all duration-300 ${
                    isSidebarCollapsed ? "justify-center" : ""
                  }`}
                >
                  <div className="h-10 w-10 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm shrink-0 transition-transform duration-300 hover:scale-105">
                    {userData?.fname?.[0]}
                    {userData?.lname?.[0]}
                  </div>
                  <div
                    className={`transition-all duration-300 overflow-hidden ${
                      isSidebarCollapsed
                        ? "w-0 opacity-0"
                        : "w-auto opacity-100"
                    }`}
                  >
                    <p className="font-semibold text-slate-800 truncate whitespace-nowrap">
                      {userData?.fname} {userData?.lname}
                    </p>
                    <p className="text-sm text-slate-600 truncate whitespace-nowrap">
                      {userData?.auth?.email}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <nav
              className={`flex-1 py-6 transition-all duration-300 ${
                isSidebarCollapsed ? "px-2 space-y-0.5" : "px-4 space-y-1"
              }`}
            >
              {agentLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`group relative flex items-center transition-all duration-200 ${
                      isSidebarCollapsed
                        ? // Collapsed: compact, fixed height button
                          "justify-center h-11 p-0 rounded-xl"
                        : // Expanded: original comfy spacing
                          "justify-start gap-4 p-4 rounded-2xl"
                    } ${
                      isActive
                        ? "bg-blue-50 border border-blue-200 shadow-sm"
                        : "hover:bg-slate-50 hover:border hover:border-slate-200/60"
                    }`}
                  >
                    {/* Icon container */}
                    <div
                      className={`flex items-center justify-center rounded-lg transition-all duration-200 ${
                        isActive
                          ? "bg-blue-500 text-white"
                          : "bg-slate-100 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-600"
                      } ${
                        isSidebarCollapsed
                          ? // Collapsed: fixed square for tight look
                            "h-9 w-9"
                          : // Expanded: keep original padding
                            "p-2"
                      }`}
                    >
                      {link.icon}
                    </div>

                    {/* Tooltip for collapsed state */}
                    {isSidebarCollapsed && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap">
                        {link.label}
                        <div className="text-xs text-slate-300 mt-1">
                          {link.description}
                        </div>
                        <div className="absolute top-1/2 -left-1 transform -translate-y-1/2 w-2 h-2 bg-slate-900 rotate-45"></div>
                      </div>
                    )}

                    {/* Text (hidden when collapsed) */}
                    <div
                      className={`transition-all duration-300 overflow-hidden ${
                        isSidebarCollapsed
                          ? "w-0 opacity-0"
                          : "w-auto opacity-100"
                      }`}
                    >
                      <p
                        className={`font-semibold text-base ${
                          isActive ? "text-blue-700" : "text-slate-800"
                        }`}
                      >
                        {link.label}
                      </p>
                      <p className="text-sm text-slate-600 mt-0.5">
                        {link.description}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </nav>

            {/* Footer Section */}
            <div
              className={`p-6 border-t border-slate-200/60 space-y-4 transition-all duration-300 ${
                isSidebarCollapsed ? "px-3" : ""
              }`}
            >
              <UserButton
                appearance={{
                  elements: {
                    // Slightly larger avatar, with subtle border
                    avatarBox:
                      "h-10 w-10 md:h-11 md:w-11 border border-blue-200 rounded-full",
                    // Make the menu a bit wider & nicer
                    userButtonPopoverCard:
                      "w-72 lg:w-96 rounded-2xl shadow-lg border border-slate-100",
                  },
                }}
              />

              {/* (Removed old Collapse Toggle Button from footer as requested) */}

              <div
                className={`text-center pt-4 transition-all duration-300 ${
                  isSidebarCollapsed ? "opacity-0 h-0" : "opacity-100 h-auto"
                }`}
              >
                <div className="text-xs text-slate-500">
                  &copy; {new Date().getFullYear()} KinsCare
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Connecting Providers with Caregivers
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div
            className="md:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Mobile Sidebar */}
        <aside
          className={`md:hidden fixed top-0 left-0 h-screen w-80 bg-white/90 backdrop-blur-xl border-r border-slate-200/60 shadow-xl z-50 transform transition-transform duration-300 ${
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="relative z-10 flex flex-col h-full pt-16">
            {/* User Info Mobile */}
            {userData && (
              <div className="px-6 py-4 border-b border-slate-200/60">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
                    {userData?.fname?.[0]}
                    {userData?.lname?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 truncate">
                      {userData?.fname} {userData?.lname}
                    </p>
                    <p className="text-sm text-slate-600 truncate">
                      {userData?.auth?.email}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Mobile Navigation */}
            <nav className="flex-1 py-6 px-4 space-y-1">
              {agentLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-start gap-4 p-4 rounded-2xl transition-all duration-200 group ${
                    pathname === link.href
                      ? "bg-blue-50 border border-blue-200 shadow-sm"
                      : "hover:bg-slate-50"
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg ${
                      pathname === link.href
                        ? "bg-blue-500 text-white"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {link.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`font-semibold text-base ${
                        pathname === link.href
                          ? "text-blue-700"
                          : "text-slate-800"
                      }`}
                    >
                      {link.label}
                    </p>
                    <p className="text-sm text-slate-600 mt-0.5">
                      {link.description}
                    </p>
                  </div>
                </Link>
              ))}
            </nav>

            {/* Mobile Footer */}
            <div className="p-6 border-t border-slate-200/60">
              <UserButton
                appearance={{
                  elements: {
                    // Slightly larger avatar, with subtle border
                    avatarBox:
                      "h-10 w-10 md:h-11 md:w-11 border border-blue-200 rounded-full",
                    // Make the menu a bit wider & nicer
                    userButtonPopoverCard:
                      "w-72 lg:w-96 rounded-2xl shadow-lg border border-slate-100",
                  },
                }}
              />
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main
          className={`flex-1 min-h-screen min-w-0 w-full px-4 md:px-10 py-6 md:py-8 relative transition-all duration-300 overflow-x-hidden ${
            isSidebarCollapsed ? "md:ml-20" : "md:ml-80"
          }`}
        >
          <div className="pt-16  md:pt-4 max-w-[1600px] w-full mx-auto relative z-10">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6 md:mb-8">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-slate-500 font-semibold">
                  Agent Workspace
                </div>
                <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 font-[family:var(--header-font)]">
                  {pageTitle}
                </h1>
                <p className="text-sm text-slate-600 mt-1">{pageDescription}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm text-slate-600 shadow-sm">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.15)]" />
                  Live queue updates
                </div>
                <Button
                  variant="link"
                  onClick={() => window.history.back()}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              </div>
            </div>
            {/* Main content card */}
            <div>{children}</div>
          </div>

          {/* Background decorative elements */}
          <div className="fixed top-1/4 -right-48 w-96 h-96 bg-gradient-to-br from-blue-200/30 to-indigo-300/20 rounded-full blur-3xl pointer-events-none z-0" />
          <div className="fixed bottom-1/4 -left-48 w-96 h-96 bg-gradient-to-tr from-slate-200/20 to-blue-100/30 rounded-full blur-3xl pointer-events-none z-0" />
        </main>
      </div>
    </AgentAuth>
  );
}
