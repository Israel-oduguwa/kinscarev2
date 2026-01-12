"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/context/AuthContext";
import { useApiClient } from "@/hooks/useApiClient";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  Loader2,
  X,
  Mail,
  User,
  Building2,
  Gift,
  Send,
} from "lucide-react";
import { fetchUserData } from "@/lib/utils";
import { useDialog } from "../CaregiverContext/DialogProvider";

// Validation schema (UNCHANGED)
const schema = yup.object().shape({
  to: yup.string().email("Invalid email").required("Email is required"),
  supervisorName: yup.string().required("Supervisor name is required"),
  organization: yup.string().required("Organization name is required"),
  // body: yup.string().required("Body is required"),
});

function SendReferralEmail() {
  const authData: any = useAuthContext();
  const { userData, setUserData } = authData;
  const { privateApi } = useApiClient();
  const { closeDialog } = useDialog();

  // Points (UNCHANGED)
  const [points, setPoints] = useState({
    referrals: 0,
    totalPoints: 0,
  });

  // Loading (UNCHANGED)
  const [loading, setLoading] = useState(false);

  // RHF (UNCHANGED)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    if (userData) {
      setPoints({
        referrals: userData?.careerProfile?.referEmployer?.referrals || 0,
        totalPoints: userData?.careerProfile?.referEmployer?.points || 0,
      });
    }
  }, [userData]);

  // DB (UNCHANGED)
  const updateDatabase = async (plan: any) => {
    const payload = {
      collectionName: "users",
      operation: "updateOne",
      filter: { userID: userData.userID },
      update: { $set: plan },
      options: { upsert: true },
    };
    try {
      await privateApi.post(
        "/api/v1/auth/crud-operation",
        payload
      );
      const fetchedData: any = await fetchUserData(
        userData.userID,
        userData.settings?.email ? userData.settings.email : userData.auth.email
      );
      setUserData(fetchedData.result);
    } catch (error) {
      console.log(error);
    }
  };

  // Submit (UNCHANGED)
  const onSubmit = async (data: any) => {
    setLoading(true);
    const newReferrals = points.referrals + 1;
    let newPoints = points.totalPoints;
    try {
      const payload = {
        to: data.to,
        supervisorName: data.supervisorName,
        senderName: `${userData.fname} ${userData.lname}`,
        senderEmail: userData.settings?.email
          ? userData.settings.email
          : userData.auth.email,
        organizationName: data.organization,
        senderUserID: userData.userID,
      };

      const sendReferEmail = await privateApi.post(
        "/api/v1/email/refer-employer",
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

        reset();
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // ------- UI-only derived values (no state) -------
  const progressWidth = Math.min(100, (points.referrals / 3) * 100);

  return (
    <div className="w-full">
      <div className="mx-auto w-full max-w-3xl">
        {/* Outer shell with internal scroll (plays nice inside shadcn Dialog) */}
        <div className="relative flex max-h-[85vh] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          {/* Gradient header */}
          <div className="relative shrink-0 bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-700">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(700px_200px_at_0%_-10%,white,transparent)]" />
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(700px_200px_at_100%_120%,white,transparent)]" />
            <div className="flex items-start md:items-center justify-between px-5 md:px-6 py-4">
              <div className="pr-10">
                <h2 className="text-white text-lg md:text-xl font-semibold tracking-tight">
                  Refer Your Employer
                </h2>
                <p className="text-indigo-100 text-xs md:text-[13px]">
                  Invite your employer to post jobs — your email includes a 1-month free code.
                </p>
              </div>
              <button
                onClick={closeDialog}
                className="rounded-full p-2 z-50 text-white/90 hover:text-white hover:bg-white/10 transition"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto px-4 md:px-6 py-5 bg-gray-50/60">
            {/* Summary / Points */}
            <div className="mb-5 rounded-2xl border border-indigo-100 bg-white p-4 shadow-[0_6px_24px_rgba(0,0,0,0.06)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                    <Gift className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Referral Summary</p>
                    <p className="text-sm font-medium text-gray-900">
                      {points.referrals} of 3 milestone referrals
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Points</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {points.totalPoints}
                  </p>
                </div>
              </div>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-indigo-500 transition-all"
                  style={{ width: `${progressWidth}%` }}
                />
              </div>
              <p className="mt-2 text-[11px] text-gray-500">
                Earn +25 points for your first 3 referrals, then +5 points each.
              </p>
            </div>

            {/* Content card */}
            <div className="w-full rounded-2xl border border-gray-100 bg-white p-4 md:p-6 shadow-sm">
              <p className="text-sm text-gray-600 mb-4">
                Click “Send email” to invite the hiring contact. The email explains how to post
                openings and includes a $100 code for 1 month free access.
              </p>

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* To */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900">
                    To
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-2.5 text-gray-400">
                      <Mail className="h-4 w-4" />
                    </span>
                    <input
                      type="email"
                      {...register("to")}
                      className={`w-full rounded-lg border bg-gray-50 p-2.5 pl-9 text-sm text-gray-900 focus-visible:outline-blue-500 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.to ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Enter recipient's email"
                    />
                  </div>
                  {errors.to && (
                    <span className="text-red-500 text-sm">
                      {errors.to.message as any}
                    </span>
                  )}
                </div>

                {/* Row: Supervisor + Organization */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-900">
                      Supervisor Name
                    </label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-2.5 text-gray-400">
                        <User className="h-4 w-4" />
                      </span>
                      <input
                        type="text"
                        {...register("supervisorName")}
                        className={`w-full rounded-lg border bg-gray-50 p-2.5 pl-9 text-sm text-gray-900 focus-visible:outline-blue-500 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.supervisorName
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="Enter supervisor's name"
                      />
                    </div>
                    {errors.supervisorName && (
                      <span className="text-red-500 text-sm">
                        {errors.supervisorName.message as any}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-900">
                      Organization/Employer
                    </label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-2.5 text-gray-400">
                        <Building2 className="h-4 w-4" />
                      </span>
                      <input
                        type="text"
                        {...register("organization")}
                        className={`w-full rounded-lg border bg-gray-50 p-2.5 pl-9 text-sm text-gray-900 focus-visible:outline-blue-500 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.organization
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="Enter organization/employer name"
                      />
                    </div>
                    {errors.organization && (
                      <span className="text-red-500 text-sm">
                        {errors.organization.message as any}
                      </span>
                    )}
                  </div>
                </div>

                {/* Tips */}
                <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-xs text-gray-700">
                  After they post a job, share it on Facebook, Instagram, WhatsApp, etc.
                  More shares → higher chance of a referral bonus.
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending…
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send Email
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>

            {/* Points footer */}
            <div className="mt-6 text-right">
              <h3 className="text-2xl font-semibold text-gray-700">
                {points.totalPoints} <span className="text-sm">Points</span>
              </h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SendReferralEmail;
