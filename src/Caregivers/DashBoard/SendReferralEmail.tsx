"use client";
import React, { useContext, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import MongoContext from "@/app/MongoContext";
import axios from "axios";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Loader2, X } from "lucide-react";
import { fetchUserData } from "@/lib/utils";
import { useDialog } from "../CaregiverContext/DialogProvider";

// Validation schema
const schema = yup.object().shape({
  to: yup.string().email("Invalid email").required("Email is required"),
  supervisorName: yup.string().required("Supervisor name is required"),
  organization: yup.string().required("Organization name is required"),
  // body: yup.string().required("Body is required"),
});

function SendReferralEmail() {
  const mongodb: any = useContext(MongoContext);
  const { userData, setUserData } = mongodb;
const { closeDialog } = useDialog(); // Access the closeDialog function

  // Points system
  const [points, setPoints] = useState({
    referrals: 0, // Count of total referrals
    totalPoints: 0, // Total points earned
  });

  // Loading state
  const [loading, setLoading] = useState(false);

  // Use form hook with validation
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  console.log(errors)
  // when the page loads
  useEffect(() => {
    if (userData) {
      // set the states for the data
      setPoints({
        referrals: userData?.careerProfile?.referEmployer?.referrals || 0,
        totalPoints: userData?.careerProfile?.referEmployer?.points || 0,
      });
    }
  }, [userData]);

  // Update database function remains the same
  const updateDatabase = async (plan: any) => {
    const payload = {
      collectionName: "users",
      operation: "updateOne",
      filter: { userID: userData.userID },
      update: {
        $set: plan,
      },
      options: {
        upsert: true,
      },
    };
    try {
      const addPlan = await axios.post(
        "https://api.kinscare.org/api/v1/auth/crud-operation",
        payload
      );
      const fetchedData: any = await fetchUserData(
        userData.userID,
        userData.settings?.email ? userData.settings.email : userData.auth.email
      );
      console.log(fetchedData);
      setUserData(fetchedData.result);
      // console.log(addPlan);
    } catch (error) {
      console.log(error);
    }
  };

  // Handle sending email and calculating points
  const onSubmit = async (data: any) => {
   console.log(userData)
    setLoading(true); // Set loading to true when the submission starts
    const newReferrals = points.referrals + 1;
    let newPoints = points.totalPoints;
    try {
      const payload = {
        to: data.to,
        supervisorName: data.supervisorName,
        senderName: `${userData.fname} ${userData.lname}`,
        senderEmail:  userData.settings?.email ? userData.settings.email : userData.auth.email,
        organizationName: data.organization,
        senderUserID: userData.userID,
      };
      console.log(payload)
      const sendReferEmail = await axios.post(
        "https://api.kinscare.org/api/v1/email/refer-employer",
        payload
      );
      if (sendReferEmail.data.success) {
        if (newReferrals <= 3) {
          newPoints += 25;
        } else {
          newPoints += 5;
        }
        setPoints({
          referrals: newReferrals,
          totalPoints: newPoints,
        });
        await updateDatabase({
          "careerProfile.referEmployer.draft": true,
          "careerProfile.referEmployer.referrals": newReferrals,
          "careerProfile.referEmployer.points": newPoints,
        });

        // Reset email fields after sending
        reset();
        setLoading(false); // Reset loading state when done
      }
    } catch (error) {
      setLoading(false);
      console.log(error)
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="">
      <button
        className="right-4 p-2 top-4 absolute z-20 rounded-full bg-gray-200 hover:bg-gray-300"
        onClick={closeDialog}
      >
        <X size={20} />
      </button>
      <div className="max-w-4xl mx-auto">
        <div className="w-full p-4 md:p-8 space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Refer Your Employer
            </h2>
            <p className="text-sm antialiased">
              Click “Send email” button to email the person responsible for
              hiring information on how to post job opening(s) and find the
              right candidates. The email also contains $100.00 code that will
              give your employer free access for 1 month.
            </p>
          </div>

          {/* Email Form Fields */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block mb-2 antialiased text-sm font-medium text-gray-900 dark:text-white">
                To
              </label>
              <input
                type="email"
                {...register("to")}
                className={`bg-gray-50 border ${
                  errors.to ? "border-red-500" : "border-gray-300"
                } focus-visible:outline-blue-500 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                placeholder="Enter recipient's email"
              />
              {errors.to && (
                <span className="text-red-500 text-sm">
                  {errors.to.message}
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 antialiased text-sm font-medium text-gray-900 dark:text-white">
                  Supervisor Name
                </label>
                <input
                  type="text"
                  {...register("supervisorName")}
                  className={`bg-gray-50 border ${
                    errors.supervisorName ? "border-red-500" : "border-gray-300"
                  } focus-visible:outline-blue-500 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                  placeholder="Enter supervisor's name"
                />
                {errors.supervisorName && (
                  <span className="text-red-500 text-sm">
                    {errors.supervisorName.message}
                  </span>
                )}
              </div>
              <div>
                <label className="block mb-2 antialiased text-sm font-medium text-gray-900 dark:text-white">
                  Organization/Employer
                </label>
                <input
                  type="text"
                  {...register("organization")}
                  className={`bg-gray-50 border ${
                    errors.organization ? "border-red-500" : "border-gray-300"
                  } focus-visible:outline-blue-500 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                  placeholder="Enter organization/employer name"
                />
                {errors.organization && (
                  <span className="text-red-500 text-sm">
                    {errors.organization.message}
                  </span>
                )}
              </div>
            </div>
            {/* Additional instructions */}
            <div className="text-gray-700 text-sm">
              <p>
                When your employer posts their job opening, post it on Facebook,
                IG, WhatsApp, etc. You can also email the job posts to your
                friends. The more you share the job post, the more likely you
                are to get a referral bonus.
              </p>
            </div>

            {/* Send Button */}
            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="animate-spin" />}
                {loading ? "Sending..." : "Send Email"}
              </Button>
            </div>
          </form>

          {/* Points summary */}
          <div className="mt-6 text-right">
            <h3 className="text-2xl font-semibold text-gray-700">
              {points.totalPoints} <span className="text-sm">Points</span>
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SendReferralEmail;
