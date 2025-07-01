"use client";

import MongoContext from "@/app/MongoContext";
import { Button } from "@/components/ui/button";
import AgentAuth from "@/HiringAgent/AgentAuth";
import { ClipboardList, LogOut } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useContext } from "react";
import TagManager from "react-gtm-module";
import * as Realm from "realm-web";

const agentLinks = [
  {
    href: "/agent",
    label: "Dashboard",
    icon: <ClipboardList className="h-5 w-5" />,
  },
  // Add more links here as needed
];

export default function AgentLayout({ children }: any) {
  const pathname = usePathname();
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
      <div className="min-h-screen flex bg-gradient-to-br from-gray-50 via-indigo-50 to-indigo-100">
        {/* Fixed Sidebar */}
        <aside className="w-72 fixed top-0 left-0 h-screen bg-white/60 backdrop-blur-xl border-r border-indigo-100 shadow-xl z-20 flex-col hidden md:flex">
          {/* Decorative background blur + gradient */}
          <div className="absolute inset-0 z-0 bg-gradient-to-tr from-indigo-200/30 via-white/60 to-indigo-100/30 pointer-events-none" />

          {/* Sidebar content */}
          <div className="relative z-10 flex flex-col flex-1 h-full">
            {/* Logo / Brand */}
            <div className="py-8 px-6 font-bold text-xl text-indigo-700">
              <div className="">
                <Image
                  width={60}
                  height={60}
                 
                  src="https://firebasestorage.googleapis.com/v0/b/exhct2004.appspot.com/o/Kinscare%20Logo.svg?alt=media&token=e0ffb5fe-d0f9-4992-b505-a4180dffe444"
                  alt="logo"
                />
              </div>
             
            </div>
            {/* Navigation */}
            <nav className="flex-1 py-4 px-4 space-y-2">
              {agentLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-base shadow-sm ${
                    pathname === link.href
                      ? "bg-indigo-100 text-indigo-700 shadow-indigo-100"
                      : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-800"
                  }`}
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}
              {/* Add more links as needed */}
            </nav>

            <div className="mx-4 border-t border-indigo-100 my-2" />

            {/* Logout Button */}
            <div className="px-4 pb-8 flex flex-col">
              <Button
                onClick={LogOutUser}
                variant="ghost"
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-gray-700 hover:text-red-600 hover:bg-red-50 transition font-medium"
              >
                <LogOut className="h-5 w-5" /> Logout
              </Button>
              <div className="text-xs text-gray-400 text-center mt-6">
                &copy; {new Date().getFullYear()} KinsCare.
                <br />
                All rights reserved.
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-h-screen px-2 md:px-10 py-6 relative md:ml-72">
          {/* Main content glass card */}
          <div className="w-full h-full min-h-[80vh] mx-auto bg-white/70 backdrop-blur-xl shadow-lg rounded-3xl p-4 md:p-10 border border-white/40 relative z-10">
            {children}
          </div>

          {/* Optional: Decorative SVG blob in the background */}
          <svg
            className="absolute -top-24 -right-36 w-96 h-96 opacity-20 z-0 pointer-events-none"
            viewBox="0 0 400 400"
            fill="none"
          >
            <defs>
              <radialGradient id="dashblob" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#6366F1" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#a5b4fc" stopOpacity="0" />
              </radialGradient>
            </defs>
            <ellipse
              cx="200"
              cy="200"
              rx="200"
              ry="200"
              fill="url(#dashblob)"
            />
          </svg>
        </main>
      </div>
    </AgentAuth>
  );
}
