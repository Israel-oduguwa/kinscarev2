"use client";

import React, { useState, useEffect } from "react";
import { useContext } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation"; // For refreshing
import MongoContext from "@/app/MongoContext";
import { Button } from "@/components/ui/button";
import { Bookmark, Loader, Loader2, Share2Icon } from "lucide-react";
import axios, { AxiosError } from "axios";
import { toast } from "@/components/ui/use-toast";
import { fetchUserData, trackEvents } from "@/lib/utils";
import TagManager from "react-gtm-module";

function ApplyNow({ jobID, job }: any) {
  const mongodb: any = useContext(MongoContext); // User Data Context
  const { userData, user, setUserData } = mongodb; // Assuming this contains caregiverId and favorite_jobs
  const [isFavorite, setIsFavorite] = useState(false); // To track if the job is favorited
  const [hasApplied, setHasApplied] = useState(false); // To track if the user has already applied
  const router = useRouter(); // To refresh after mutation
  const { applicants } = job;
  const providerName = job.provider;
  // Check if the job is already favorite when the page loads
  // console.log(userData)
  console.log(applicants);
  useEffect(() => {
    if (userData?.favorite_jobs) {
      console.log("check");
      const isFav = userData.favorite_jobs.some(
        (favorite: any) => favorite.jobID === jobID || favorite.jobId === jobID // Check both fields
      );
      setIsFavorite(isFav);
    }
    // Check if the user has already applied to the job
    if (applicants && userData?.userID) {
      const alreadyApplied = applicants.some(
        (applicant: any) => applicant?.userID === userData.userID
      );
      console.log(alreadyApplied);
      setHasApplied(alreadyApplied);
    }
  }, [userData, jobID, applicants]);

  // Apply for Job Mutation
  const {
    mutate: applyForJob,
    isPending: isApplying,
    isError: isApplyError,
    error: applyError,
  } = useMutation({
    mutationFn: async () => {
      if (!userData.complete) {
        toast({
          title: "Upload your resume",
          description: "Update your profile",
          variant: "default",
        });
        router.push("/vitae/update");
      } else {
        const payload = {
          jobId: jobID,
          caregiverId: userData.userID,
          providerName,
        };
        const { data } = await axios.post(
          "https://api.kinscare.org/api/v1/caregivers/job/apply",
          payload
        );
        return data;
      }
    },
    onSuccess: async () => {
      if (userData.complete) {
        // Instead of refreshing, we manually update the state
        setHasApplied(true); // Mark as applied
        // lets update the userData
        const fetchedData: any = await fetchUserData(
          user.customData.userID,
          user.customData.email
        );
        // console.log(fetchedData);
        setUserData(fetchedData.result);

        //  Track the event in GTM
        const eventPayload = {
          // subscription_id: subscriptionID,
          settings: userData?.settings,
          lname: userData?.lname,
          subscription_status: "complete",
          fname: userData?.fname,
          tel: userData?.auth?.tel,
          jobTitle: job?.title,
          jobID: jobID,
          zipcode: userData?.zipcode,
          city: userData?.city,
          email: userData?.auth?.email,
        };

        const tagManagerArgs = {
          dataLayer: {
            ...eventPayload,
            event: `apply_job`,
          },
        };
        TagManager.dataLayer(tagManagerArgs);

        // Track purchase event
        trackEvents(user?.customData?.hash, "Apply Job", eventPayload);
        toast({
          title: "Application Successful",
          description: "You have successfully applied for this job.",
          variant: "default",
        });
      }
    },
    onError: (err) => {
      toast({
        title: "Could not apply for job",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  // Toggle Favorite Mutation
  const {
    mutate: toggleFavorite,
    isPending: isTogglingFavorite,
    isError: isFavoriteError,
    error: favoriteError,
  } = useMutation({
    mutationFn: async () => {
      const action = isFavorite ? "unsave" : "save"; // Toggle based on current state
      const payload = {
        jobId: jobID,
        caregiverId: userData.userID,
        title: job.title,
        schedule: job.schedule,
        licenses: job.licenses,
        geocode_address: job.geocode_address,
        action,
      };
      const { data } = await axios.post(
        "https://api.kinscare.org/api/v1/caregivers/job/favorite",
        payload
      );
      return data;
    },
    onSuccess: async () => {
      const fetchedData: any = await fetchUserData(
        user.customData.userID,
        user.customData.email
      );
      // console.log(fetchedData);
      setUserData(fetchedData.result);
      setIsFavorite((prev) => !prev); // Toggle the local state
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        toast({
          title: err.message,
          description: "Could not update favorite status",
          variant: "destructive",
        });
      }
      console.log(err);
    },
  });

  return (
    <div>
      <div className="flex gap-2">
        {/* Apply Button */}
        <Button
          className="rounded-lg w-full lg:w-auto"
          variant="default"
          onClick={() => applyForJob()}
          disabled={isApplying || hasApplied} // Disable if user is applying or has already applied
        >
          {isApplying && <Loader2 className="animate-spin" />}{" "}
          {isApplying
            ? "Applying..."
            : hasApplied
              ? "Already Applied"
              : "Apply Now"}
        </Button>

        {/* Favorite Button */}
        <Button
          size="icon"
          variant="outline"
          onClick={() => toggleFavorite()}
          disabled={isTogglingFavorite}
        >
          <Bookmark
            size={18}
            className={`${
              isFavorite ? "text-purple-700 fill-current" : "text-gray-600"
            }`}
            fill={isFavorite ? "currentColor" : "none"} // Fill color when favorite
          />
        </Button>

        {/* Share Button */}
        {/* <Button size="icon" variant="outline">
          <Share2Icon size={18} />
        </Button> */}
      </div>

      {/* Error Messages */}
      {isApplyError && (
        <p className="text-red-600 mt-2">
          Error: {(applyError as Error).message}
        </p>
      )}
      {isFavoriteError && (
        <p className="text-red-600 mt-2">
          Error: {(favoriteError as Error).message}
        </p>
      )}
    </div>
  );
}

export default ApplyNow;
