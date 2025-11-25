"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { X } from "lucide-react";
import { useState } from "react";

export default function DashboardSkeleton() {
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const toggleMobileSidebar = () => {
    setMobileSidebarOpen((prev) => !prev);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex lg:flex-col bg-white border-l-gray-400 w-[16rem] shrink-0">
        <div className="flex items-center ml-4  py-4  border-gray-200">
          <div className="px-4" >
            <img
              className="h-6 pr-1 sm:h-8"
              src="https://firebasestorage.googleapis.com/v0/b/exhct2004.appspot.com/o/Kinscare%20Logo.svg?alt=media&token=e0ffb5fe-d0f9-4992-b505-a4180dffe444"
              alt="logo"
            />
          </div>
          <Skeleton className="h-8 w-28 rounded-lg" />
        </div>
        <nav className="flex flex-col flex-1 p-4 space-y-6">
          <Skeleton className="h-20 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </nav>
      </aside>

      {/* Sidebar for Mobile */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black opacity-50"
            onClick={toggleMobileSidebar}
          ></div>
          <aside className="absolute left-0 top-0 h-full bg-white w-64 z-50">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <Skeleton className="h-8 w-24 rounded-lg" />
              <button
                onClick={toggleMobileSidebar}
                className="text-gray-600 focus:outline-none"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="flex flex-col p-4 space-y-6">
              <Skeleton className="h-6 w-full rounded-lg" />
              <Skeleton className="h-6 w-full rounded-lg" />
              <Skeleton className="h-6 w-full rounded-lg" />
              <Skeleton className="h-6 w-full rounded-lg" />
              <Skeleton className="h-6 w-full rounded-lg" />
            </nav>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-col flex-1">
        {/* Navbar */}
        <header className="h-20 p-4 flex items-center px-4 bg-white ">
          <button
            className="lg:hidden text-gray-600 focus:outline-none"
            onClick={toggleMobileSidebar}
          >
            {/* <Menu className="h-6 w-6" /> */}
          </button>
          <Skeleton className="h-8 w-28 mx-auto lg:mx-0 rounded-lg" />
          <div className="ml-auto flex items-center space-x-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </header>

        {/* Main Content Skeleton */}
        <main className="flex-1 p-6">
          {/* Section Title */}
          <Skeleton className="h-8  bg-gray-200 w-1/3 rounded-lg mb-6" />

          {/* Content Grid */}
          <div className="grid">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="p-4 bg-white rounded-lg  flex flex-col space-y-4"
              >
                <Skeleton className="h-6 w-1/2 rounded-lg" />
                <Skeleton className="h-4  bg-gray-200 w-1/3 rounded-lg" />
                <Skeleton className="h-32  bg-gray-100 w-full rounded-lg" />
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
