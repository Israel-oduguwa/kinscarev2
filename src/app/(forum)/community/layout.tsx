import { Toaster } from "@/components/ui/toaster";
import ForumDynamicNavbar from "@/Forum/Navbar/ForumDynamicNavbar";
import Footer from "@/WebPages/Footer";
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // this is the dashboard ui and layout page
  return (
    <section>
      <Toaster /> <ForumDynamicNavbar />
      <div className="pb-10">{children}</div>
      <Footer />
    </section>
  );
}
