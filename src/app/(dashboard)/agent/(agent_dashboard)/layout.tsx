"use client";

import MongoContext from "@/app/MongoContext";
import { Button } from "@/components/ui/button";
import AgentAuth from "@/HiringAgent/AgentAuth";
import {
  ClipboardList,
  LogOut,
  MessageCircle,
  Menu,
  X,
  Users,
  Building2,
  DoorOpen,
  DoorClosed,
  WorkflowIcon
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useContext, useState, useEffect } from "react";
import TagManager from "react-gtm-module";
import * as Realm from "realm-web";

const agentLinks = [
  {
    href: "/agent",
    label: "Dashboard",
    icon: <ClipboardList className="h-5 w-5" />,
    description: "Overview and analytics",
  },
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
    description: "Your Job Postings"
  },
  // {
  //   href: "/agent/caregivers",
  //   label: "Caregivers",
  //   icon: <Users className="h-5 w-5" />,
  //   description: "Manage caregiver matches"
  // },
];

export default function AgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const {
    user,
    app,
    setUserData,
    setUser,
    setClient,
    userData,
    setLoadingAuth,
  }: any = useContext(MongoContext);
  const router = useRouter();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const LogOutUser = async () => {
    try {
      if (!user || !app?.currentUser) return;
      TagManager.dataLayer({
        dataLayer: {
          event: `sign_out`,
          date_time: new Date().toISOString(),
          settings: userData?.settings,
          lname: userData?.lname,
          fname: userData?.fname,
          email: userData?.auth?.email,
        },
      });

      await app?.currentUser?.logOut();
      const anonymousUser = await app?.logIn(Realm.Credentials.anonymous());
      setUser(anonymousUser);
      router.push("/agent/signin");
      setClient(app?.currentUser?.mongoClient("mongodb-atlas"));
      setLoadingAuth(false);
      setUserData({});
    } catch (error) {
      console.error("An error occurred during logout:", error);
    }
  };

  return (
    <AgentAuth>
      <div className="min-h-screen flex bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
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
          className={`fixed top-0 left-0 h-screen bg-white/80 backdrop-blur-xl border-r border-slate-200/60 shadow-sm z-20 flex-col hidden md:flex transition-all duration-300 ease-in-out ${
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
                    <h1 className="font-bold text-lg bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent whitespace-nowrap">
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
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm shrink-0 transition-transform duration-300 hover:scale-105">
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
              <Button
                onClick={LogOutUser}
                variant="ghost"
                className={`w-full flex items-center transition-all duration-300 ${
                  isSidebarCollapsed
                    ? "justify-center p-3"
                    : "justify-start gap-3 p-3"
                } rounded-xl text-slate-700 hover:text-red-600 hover:bg-red-50 font-semibold border border-transparent hover:border-red-200`}
              >
                <LogOut className="h-5 w-5 shrink-0" />
                <span
                  className={`transition-all duration-300 overflow-hidden ${
                    isSidebarCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
                  }`}
                >
                  Sign Out
                </span>
              </Button>

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
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
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
              <Button
                onClick={LogOutUser}
                variant="ghost"
                className="w-full flex items-center gap-3 p-3 rounded-xl text-slate-700 hover:text-red-600 hover:bg-red-50 transition-all duration-200 font-semibold"
              >
                <LogOut className="h-5 w-5" />
                Sign Out
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main
          className={`flex-1 min-h-screen px-4 md:px-8 py-1 relative transition-all duration-300 ${
            isSidebarCollapsed ? "md:ml-20" : "md:ml-80"
          }`}
        >
          <div className="pt-16 md:pt-8">
            {/* Main content card */}
            <div className="w-full h-full min-h-[calc(100vh-4rem)] mx-auto bg-white/70 backdrop-blur-xl shadow-sm rounded-3xl p-6 md:p-8 border border-white/40 relative z-10">
              {children}
            </div>
          </div>

          {/* Background decorative elements */}
          <div className="fixed top-1/4 -right-48 w-96 h-96 bg-gradient-to-br from-blue-200/30 to-indigo-300/20 rounded-full blur-3xl pointer-events-none z-0" />
          <div className="fixed bottom-1/4 -left-48 w-96 h-96 bg-gradient-to-tr from-slate-200/20 to-blue-100/30 rounded-full blur-3xl pointer-events-none z-0" />
        </main>
      </div>
    </AgentAuth>
  );
}
