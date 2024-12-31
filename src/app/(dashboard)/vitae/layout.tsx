import { CareerProvider } from "@/Caregivers/CaregiverContext/CareerContext";
import CaregiverNavbar from "@/Caregivers/CaregiverNavbar";
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ui/vitae-app-sidebar";
import VoiceFlowProvider from "@/Caregivers/UiProviders/VoiceFlowProvider";
import CaregiverAuth from "@/Caregivers/UiProviders/CaregiverAuthProvider";
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
            <Toaster />
            {/* caregiver navbar  */}
            {/* <CaregiverNavbar /> */}
            <VoiceFlowProvider>
              <main>{children}</main>
            </VoiceFlowProvider>
          </CareerProvider>
        </AppSidebar>
      </SidebarProvider>
    </CaregiverAuth>
  );
}
