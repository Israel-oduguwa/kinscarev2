/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useState, useEffect, useContext } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Bookmark, Loader2 } from "lucide-react";
import axios, { AxiosError } from "axios";
import { toast } from "sonner"; // ✅ Sonner toasts
import { fetchUserData, trackEvents } from "@/lib/utils";
import TagManager from "react-gtm-module";
import { useApiClient } from "@/hooks/useApiClient";

type ApplyNowProps = {
  jobID: string;
  job: any;
};

// Normalize any possible id shape to a string (supports ObjectId)
const idToString = (val: any) => {
  if (!val) return "";
  try {
    // Native ObjectId
    // @ts-ignore
    if (typeof val === "object" && typeof val.toHexString === "function") {
      // @ts-ignore
      return val.toHexString();
    }
    // Serialized forms { $oid: "..." } or similar
    if (typeof val === "object" && val.$oid) {
      return String(val.$oid);
    }
  } catch {}
  return String(val);
};

// Check multiple common applicant id fields
const isSameApplicant = (app: any, userIdStr: string) => {
  const candidates = [
    app?.userID,
    app?.caregiverId,
    app?.applicantId,
    app?._id,
    app?.user_id,
    app?.id,
  ];
  return candidates.some((v) => idToString(v) === userIdStr);
};

function ApplyNow({ jobID, job }: ApplyNowProps) {
  const authData: any = useAuthContext();
  const { userData, contactData, setUserData } = authData || {};
  const router = useRouter();
  const { privateApi } = useApiClient();
  const [isFavorite, setIsFavorite] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  const applicants = Array.isArray(job?.applicants) ? job.applicants : [];
  const providerName = `${job?.provider?.fname ?? ""} ${
    job?.provider?.lname ?? ""
  }`.trim();

  // Initialize favorite/applied flags
  useEffect(() => {
    // favorite flag
    if (Array.isArray(userData?.favorite_jobs)) {
      const isFav = userData.favorite_jobs.some(
        (favorite: any) => favorite.jobID === jobID || favorite.jobId === jobID
      );
      setIsFavorite(isFav);
    }

    // applied flag (robust)
    const uid = idToString(userData?.userID);
    if (applicants.length > 0 && uid) {
      const alreadyApplied = applicants.some((a: any) =>
        isSameApplicant(a, uid)
      );
      setHasApplied(alreadyApplied);
    }
  }, [userData, jobID, applicants]);

  // --- Apply for Job ---
  const { mutate: applyForJob, isPending: isApplying } = useMutation({
    mutationFn: async () => {
      if (!userData?.complete) {
        toast.info("Upload your resume to apply. Redirecting…");
        router.push("/vitae/update");
        return null;
      }

      const payload = {
        jobId: jobID,
        caregiverId: userData.userID,
        providerName,
      };

      const { data } = await privateApi.post(
        "/api/v1/caregivers/job/apply",
        payload
      );
      return data;
    },
    onSuccess: async (data) => {
      if (!userData?.complete) return;

      // Optimistic UI
      setHasApplied(true);

      // Best-effort SMS to provider (don’t block UX)
      try {
        await privateApi.post("/api/v1/twilio/sms/send", {
          body: `New Application for ${job?.title ?? "a job"} by ${
            userData?.fname ?? ""
          } ${userData?.lname ?? ""}
View application: https://www.kinscare.org/provider/job/${jobID}`,
          to: job?.contacts?.tel,
          country: "US",
        });
      } catch {
        // Optional: toast.info("We’ll notify the provider shortly.");
      }

      // Refresh userData cache
      try {
        const fetchedData: any = await fetchUserData(
          contactData?.userID,
          contactData?.email
        );
        if (fetchedData?.result) setUserData(fetchedData.result);
      } catch {
        // ignore
      }

      // GTM + internal tracking
      const eventPayload = {
        settings: userData?.settings,
        lname: userData?.lname,
        subscription_status: "complete",
        fname: userData?.fname,
        tel: userData?.auth?.tel,
        jobTitle: job?.title,
        jobID,
        zipcode: userData?.zipcode,
        city: userData?.city,
        email: userData?.auth?.email,
      };
      TagManager.dataLayer({
        dataLayer: { ...eventPayload, event: "apply_job" },
      });
      trackEvents(contactData?.hash, "Apply Job", eventPayload);

      toast.success("Application submitted successfully.");
      router.refresh();
    },
    onError: (err) => {
      const msg =
        err instanceof AxiosError
          ? err?.response?.data?.message || err.message
          : (err as Error)?.message || "Could not apply for job.";
      toast.error(msg);
    },
  });

  // --- Toggle Favorite ---
  const { mutate: toggleFavorite, isPending: isTogglingFavorite } = useMutation(
    {
      mutationFn: async () => {
        const action = isFavorite ? "unsave" : "save";
        const payload = {
          jobId: jobID,
          caregiverId: userData?.userID,
          title: job?.title,
          schedule: job?.schedule,
          licenses: job?.licenses,
          geocode_address: job?.geocode_address,
          action,
        };
        const { data } = await privateApi.post(
          "/api/v1/caregivers/job/favorite",
          payload
        );
        return data;
      },
      onSuccess: async () => {
        try {
          const fetchedData: any = await fetchUserData(
            contactData?.userID,
            contactData?.email
          );
          if (fetchedData?.result) setUserData(fetchedData.result);
        } catch {}
        setIsFavorite((prev) => !prev);
        toast.success(
          isFavorite ? "Removed from saved jobs." : "Saved to favorites."
        );
      },
      onError: (err) => {
        const msg =
          err instanceof AxiosError
            ? err?.response?.data?.message || err.message
            : (err as Error)?.message || "Could not update favorite status.";
        toast.error(msg);
      },
    }
  );

  // --- Button state / text ---
  const applyBtnText = isApplying
    ? "Submitting..."
    : hasApplied
    ? "Application Submitted"
    : "Apply Now";

  const applyBtnDisabled = isApplying || hasApplied;

  return (
    <div>
      <div className="flex gap-2">
        {/* Apply Button */}
        <Button
          className={`rounded-lg w-full lg:w-auto ${
            hasApplied
              ? "bg-gray-300 text-gray-600 hover:bg-gray-300 cursor-not-allowed"
              : ""
          }`}
          variant={hasApplied ? "secondary" : "default"}
          onClick={() => applyForJob()}
          disabled={applyBtnDisabled}
        >
          {isApplying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {applyBtnText}
        </Button>

        {/* Favorite Button */}
        <Button
          size="icon"
          variant="outline"
          onClick={() => toggleFavorite()}
          disabled={isTogglingFavorite}
          aria-label={isFavorite ? "Unsave job" : "Save job"}
          title={isFavorite ? "Unsave job" : "Save job"}
        >
          <Bookmark
            size={18}
            className={`${
              isFavorite ? "text-purple-700 fill-current" : "text-gray-600"
            }`}
            fill={isFavorite ? "currentColor" : "none"}
          />
        </Button>
      </div>
    </div>
  );
}

export default ApplyNow;