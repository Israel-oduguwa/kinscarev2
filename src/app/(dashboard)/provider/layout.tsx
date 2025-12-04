
import { CandidatesProvider } from "@/Providers/Candidates/CandidatesContext";
import { EmployerAppSidebar } from "@/Providers/UIElements/employer-sidebar";
import ExclusiveOfferBanner from "@/Providers/UIElements/ExclusiveOfferBanner";
import ProviderPostJobBanner from "@/Providers/UIElements/ProviderPostJobBanner";
import WelcomeDialog from "@/Providers/UIElements/WelcomeDialog";
import ProviderAuth from "@/Providers/User/ProviderAuth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // this is the dashboard ui and layout page
  return (
    <ProviderAuth>
      <CandidatesProvider>
        {/* <ExclusiveOfferBanner /> */}
        <section>
          {/* caregiver navbar  */}
          <EmployerAppSidebar>
            {/* <ProviderNavbar /> */}
            <main>
              {" "}
              
              <WelcomeDialog />
              {/* <IntercomProvider intercomAppId={intercomAppId} /> */}
              {children}
            </main>
          </EmployerAppSidebar>
        </section>
      </CandidatesProvider>
    </ProviderAuth>
  );
}
