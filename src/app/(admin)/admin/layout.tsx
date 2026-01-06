"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/ui/sidebar";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  FileText,
  LogOut,
  Menu,
  Sun,
  Moon,
} from "lucide-react";
import AdminAuth from "@/Admin/AdminAuth";
import { cn } from "@/lib/utils"; // Utility for conditional styling
import { useTheme } from "next-themes";
import { UserButton } from "@clerk/nextjs";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/admin/login");
  };

  return (
    <AdminAuth>
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900 transition-colors">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 bg-white dark:bg-gray-800 shadow-xl transition-all transform w-72 p-5 space-y-6 flex flex-col",
            sidebarOpen ? "translate-x-0" : "-translate-x-full",
            "sm:translate-x-0 sm:w-64 sm:relative"
          )}
        >
          {/* Sidebar Header */}
          <div className="flex justify-between items-center mb-6">
            {/* <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
              Admin Panel
            </h2> */}
            {/* Close Sidebar Button (Mobile) */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="sm:hidden text-gray-500 dark:text-gray-400"
              aria-label="Close sidebar"
            >
              ✖
            </button>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            <Link href="/admin/blog/all">
              <Button
                variant="ghost"
                className="w-full flex items-center gap-2"
              >
                <LayoutDashboard size={20} /> Dashboard
              </Button>
            </Link>
            {/* <Link href="/admin/blogs">
              <Button
                variant="ghost"
                className="w-full flex items-center gap-2"
              >
                <FileText size={20} /> Manage Blogs
              </Button>
            </Link> */}
          </nav>

          {/* Logout & Theme Toggle */}
          <div className="mt-auto border-t pt-4">
              <UserButton/>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-screen transition-all">
          {/* Header */}
          <header className="bg-white dark:bg-gray-800 shadow-md p-4 flex justify-between items-center">
            {/* Sidebar Toggle Button (Mobile) */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="sm:hidden text-gray-500 dark:text-gray-400"
              aria-label="Open sidebar"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
              Admin Dashboard
            </h1>
          </header>

          {/* Main Content */}
          <main className="p-6 flex-1 overflow-auto bg-gray-50 dark:bg-gray-900 transition-all rounded-lg shadow-md">
            {children}
          </main>
        </div>
      </div>
    </AdminAuth>
  );
}
