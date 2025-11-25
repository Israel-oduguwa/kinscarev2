import { CareerProvider } from "@/Caregivers/CaregiverContext/CareerContext";
import CaregiverNavbar from "@/Caregivers/CaregiverNavbar";
import CaregiverAuth from "@/Caregivers/UiProviders/CaregiverAuthProvider";
import { AppSidebar } from "@/Caregivers/UiProviders/vitae-app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";




// import { Agent, setGlobalDispatcher } from "undici";

// setGlobalDispatcher(new Agent({connect:{timeout:60_000}}))

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // this is the dashboard ui and layout page
  return (
    <CaregiverAuth>
      <SidebarProvider>
        <AppSidebar>
          <CareerProvider>
            <main>{children}</main> 
          </CareerProvider>
        </AppSidebar>
      </SidebarProvider>
    </CaregiverAuth>
  );
}
