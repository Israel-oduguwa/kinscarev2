"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import axios from "axios";
import ApplyNow from "@/Caregivers/Jobs/JobsUI/ApplyNow";
import { useAuthContext } from "@/context/AuthContext";
import { SignUp } from "@clerk/nextjs";

interface OauthApplyProps {
  jobID?: string;
  children: React.ReactNode;
  job: any;
}

const OauthApply: React.FC<OauthApplyProps> = ({ jobID, job, children }:any) => {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [zipcode, setZipcode] = React.useState<string | null>(null);
  const [isGeoLoading, setIsGeoLoading] = React.useState(false);

  const authData: any = useAuthContext();
  const { userData } = authData || {};

  // When dialog opens, look up IP/zipcode once
  React.useEffect(() => {
    if (!isDialogOpen || zipcode) return;

    const fetchGeo = async () => {
      try {
        setIsGeoLoading(true);
        const response = await axios.get("/api/ip");
        const { zip } = response.data || {};
        setZipcode(zip || "");
      } catch (error) {
        console.error("Failed to retrieve IP data:", error);
        setZipcode("");
      } finally {
        setIsGeoLoading(false);
      }
    };

    fetchGeo();
  }, [isDialogOpen, zipcode]);

  // Already signed-in caregiver → go straight to ApplyNow
  if (userData && userData.role === "caregiver") {
    return <ApplyNow  job={job} jobID={jobID} />;
  }

  // Signed-in provider → don't show this signup flow
  if (userData?.role === "provider") {
    return null;
  }

  const metadata = {
    role: "caregiver",
    source: "find-jobs",
    // Same naming as your old payload:
    signup_route: "job_search",
    jobID: jobID ?? null,
    apply_metadata:true,
    zipcode: zipcode || undefined, // optional – server treats missing/empty as optional
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger>{children}</DialogTrigger>
      <DialogContent className="max-w-md overflow-hidden rounded-2xl  shadow-2xl">
        <div className="  bg-white ">
          <h3 className="text-lg font-semibold text-gray-900">Apply to this job</h3>
          <p className="text-sm text-gray-600">
            Create your caregiver account to view details and submit your application.
          </p>
        </div>
        <SignUp
          unsafeMetadata={metadata}
          // After signup/signin, send them back to the job page
          forceRedirectUrl={jobID ? `/vitae/jobs/${jobID}` : "/vitae/jobs/all"}
          appearance={{
            elements: {
              rootBox: "m-0 p-0 w-full",
              cardBox: "w-full shadow-none border-none rounded-none bg-white",
              card: "m-0 p-0 w-full shadow-none border-none",
              main: "m-0 p-0 w-full border-none shadow-none flex flex-col gap-0",
              header: "hidden",
              headerTitle: "hidden",
              headerSubtitle: "hidden",
              form: "m-0 p-2 w-full flex flex-col gap-4",
              formFieldInput: "h-[3.5rem]",
              formFieldLabel: "text-sm",
              socialButtons: "m-0 p-2 pb-4 pt-2 w-full flex gap-2",
              socialButtonsBlockButton: "h-10",
              socialButtonsProviderIcon: "w-10",
              formButtonPrimary:
                "bg-blue-600 shadow-xl py-2 border-none hover:bg-blue-500",
              footer: "m-0 p-2 w-full",
              footerAction: "text-sm text-gray-600",
              footerActionLink: "text-blue-600 font-semibold hover:underline",
            },
            layout: {
              socialButtonsVariant: "blockButton",
              socialButtonsPlacement: "top",
            },
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default OauthApply;
