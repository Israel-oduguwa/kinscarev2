import { EmployerAppSidebar } from "@/components/ui/employer-sidebar";
import { Toaster } from "@/components/ui/toaster";
import ProviderAuth from "@/Providers/User/ProviderAuth";
import ExclusiveOfferBanner from "@/Providers/UIElements/ExclusiveOfferBanner";
import { Agent, setGlobalDispatcher } from "undici";
import WelcomeDialog from "@/Providers/UIElements/WelcomeDialog";
import { CandidatesProvider } from "@/Providers/Candidates/CandidatesContext";
import IntercomProvider from "@/Providers/Utils/IntercomLoader";

setGlobalDispatcher(new Agent({ connect: { timeout: 60_000 } }));
// import ProviderNavbar from "@/Providers/ProviderNavbar";
const intercomAppId = process.env.INTERCOM_APP_ID!;
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // this is the dashboard ui and layout page
  return (
    <ProviderAuth>
      <CandidatesProvider>
        <ExclusiveOfferBanner />

        <section>
          <Toaster />
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
