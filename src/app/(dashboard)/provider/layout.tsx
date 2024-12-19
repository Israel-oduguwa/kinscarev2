import { EmployerAppSidebar } from "@/components/ui/employer-sidebar";
import { Toaster } from "@/components/ui/toaster";
import ProviderAuth from "@/Providers/User/ProviderAuth";
// import ProviderNavbar from "@/Providers/ProviderNavbar";
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // this is the dashboard ui and layout page
  return (
    <ProviderAuth>
      <section>
        <Toaster />
        {/* caregiver navbar  */}
        <EmployerAppSidebar>
          {/* <ProviderNavbar /> */}
          <main>{children}</main>
        </EmployerAppSidebar>
      </section>
    </ProviderAuth>
  );
}
