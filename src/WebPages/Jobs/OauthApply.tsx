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
      <DialogContent className="rounded-lg shadow-xl p-6 overflow-auto h-full md:h-min bg-white ">
          <div>
            <SignUp
              unsafeMetadata={metadata}
              // After signup/signin, send them back to the job page
              forceRedirectUrl={jobID ? `/vitae/jobs/${jobID}` : "/vitae/jobs/all"}
              appearance={{ 
                elements: {
                  formButtonPrimary:
                    "bg-blue-600 shadow-xl border-none hover:bg-blue-500",
                  card: "border-gray-200 gap-3",
                  rootBox: "flex justify-center w-full px-4",
                  main: "gap-3",
                  cardBox:
                    "w-full max-w-lg bg-white shadow-xl rounded-2xl border border-gray-100 transition-all",
                },
              }}
            />
          </div>
      </DialogContent>
    </Dialog>
  );
};

export default OauthApply;
