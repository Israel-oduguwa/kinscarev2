import { Toaster } from "@/components/ui/toaster"
import ForumDynamicNavbar from "@/Forum/Navbar/ForumDynamicNavbar"
export default function DashboardLayout({
    children,
  }: {
    children: React.ReactNode
  }) {
    // this is the dashboard ui and layout page 
    return <section><Toaster/> <ForumDynamicNavbar/>{children}</section>
  }