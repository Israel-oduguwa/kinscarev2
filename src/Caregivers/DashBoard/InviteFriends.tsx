"use client";

import React, { useContext, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, X, Mail, User, Building2, Gift, Send, Share2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useAuthContext } from "@/context/AuthContext";
import { useApiClient } from "@/hooks/useApiClient";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  FacebookShareButton,
  WhatsappShareButton,
  FacebookIcon,
  WhatsappIcon,
} from "next-share";
import { fetchUserData } from "@/lib/utils";
import { useDialog } from "../CaregiverContext/DialogProvider";

// Validation schema (UNCHANGED)
const schema = yup.object({
  name: yup.string().required("Name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
});

const InviteFriends: React.FC = () => {
 const  authData: any = useAuthContext();
  const { userData, setUserData } = mongodb;
  const { closeDialog } = useDialog();

  // STATE (UNCHANGED)
  const [points, setPoints] = useState({ invites: 0, totalPoints: 0 });
  const [lastInvitee, setLastInvitee] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [socialShared, setSocialShared] = useState(false);
  const [socialShareCount, setSocialShareCount] = useState<number>(0);
  const [selectedPlatform, setSelectedPlatform] = useState<"facebook" | "whatsapp">("facebook");

  const { register, handleSubmit, reset, formState } = useForm({
    resolver: yupResolver(schema),
  });
  const { errors } = formState;

  useEffect(() => {
    if (userData) {
      setPoints({
        invites: userData.careerProfile?.inviteFriends?.invites || 0,
        totalPoints: userData.careerProfile?.inviteFriends?.points || 0,
      });
      setSocialShared(userData.careerProfile?.inviteFriends?.socialShared || false);
      setSocialShareCount(userData.careerProfile?.inviteFriends?.socialShareCount || 0);
    }
  }, [userData]);

  // DB update (UNCHANGED)
  const updateDatabase = async (updates: any) => {
    const payload = {
      collectionName: "users",
      operation: "updateOne",
      filter: { userID: userData.userID },
      update: { $set: updates },
      options: { upsert: true },
    };
    try {
      await privateApi.post(
        "/api/v1/auth/crud-operation",
        payload
      );
      const fetchedData: any = await fetchUserData(
        userData.userID,
        userData.settings?.email || userData.auth?.email
      );
      setUserData(fetchedData.result);
    } catch (error) {
      console.error("Failed to update database:", error);
    }
  };

  // Submit (UNCHANGED)
  const onSubmit = async (data: { name: string; email: string }) => {
    setLoading(true);
    const newInvites = points.invites + 1;
    const newPoints = points.totalPoints + (newInvites <= 3 ? 15 : 5);

    setPoints({ invites: newInvites, totalPoints: newPoints });

    try {
      setLastInvitee(data.name);

      await privateApi.post(
        "/api/v1/email/invite-friend",
        {
          to: data.email,
          senderName: `${userData.fname} ${userData.lname}`,
          recipientName: data.name,
          referrerID: userData.userID,
        }
      );

      await updateDatabase({
        "careerProfile.inviteFriends.draft": true,
        "careerProfile.inviteFriends.invites": newInvites,
        "careerProfile.inviteFriends.points": newPoints,
      });

      reset();
    } catch (error) {
      console.error("Failed to send invite:", error);
    } finally {
      setLoading(false);
    }
  };

  // Social share (UNCHANGED)
  const handleSocialShare = async (platform: "facebook" | "whatsapp") => {
    await updateDatabase({
      "careerProfile.inviteFriends.socialShared": true,
      "careerProfile.inviteFriends.socialShareCount": socialShareCount + 1,
      "careerProfile.inviteFriends.updated": new Date(),
    });

    setSocialShared(true);
    setSocialShareCount((prev) => prev + 1);
    setIsDialogOpen(false);
  };

  // ------- UI-only derived (no state) -------
  const progressWidth = Math.min(100, (points.invites / 3) * 100);

  return (
    <div className="w-full">
      <div className="mx-auto w-full max-w-3xl">
        {/* kinscare-ui shell with internal scroll */}
        <div className="relative flex max-h-[85vh] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          {/* Gradient header */}
          <div className="relative shrink-0 bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-700">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(700px_200px_at_0%_-10%,white,transparent)]" />
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(700px_200px_at_100%_120%,white,transparent)]" />
            <div className="flex items-start md:items-center justify-between px-5 md:px-6 py-4">
              <div className="pr-10">
                <h2 className="text-white text-lg md:text-xl font-semibold tracking-tight">
                  Invite Your Friends to Kinscare
                </h2>
                <p className="text-indigo-100 text-xs md:text-[13px]">
                  Earn points by inviting friends, and boost reach with social sharing.
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
                    <p className="text-xs text-gray-600">Invite Summary</p>
                    <p className="text-sm font-medium text-gray-900">
                      {points.invites} of 3 milestone invites
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
                Earn +15 points for your first 3 invites, then +5 points each.
              </p>
            </div>

            {/* Content card */}
            <div className="w-full rounded-2xl border border-gray-100 bg-white p-4 md:p-6 shadow-sm">
              <p className="text-sm text-gray-600 mb-4">
                We’ll email your friend an invite to join Kinscare. You can also share the
                link on social media for extra reach.
              </p>

              {/* Invite Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900">Name</label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-2.5 text-gray-400">
                      <User className="h-4 w-4" />
                    </span>
                    <input
                      type="text"
                      {...register("name")}
                      className={`w-full rounded-lg border bg-gray-50 p-2.5 pl-9 text-sm text-gray-900 focus-visible:outline-blue-500 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.name ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Enter friend's name"
                    />
                  </div>
                  {errors.name && (
                    <span className="text-red-500 text-sm">{errors.name.message as any}</span>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900">Email</label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-2.5 text-gray-400">
                      <Mail className="h-4 w-4" />
                    </span>
                    <input
                      type="email"
                      {...register("email")}
                      className={`w-full rounded-lg border bg-gray-50 p-2.5 pl-9 text-sm text-gray-900 focus-visible:outline-blue-500 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.email ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Enter friend's email"
                    />
                  </div>
                  {errors.email && (
                    <span className="text-red-500 text-sm">{errors.email.message as any}</span>
                  )}
                </div>

                <Separator />

                {/* Actions */}
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={socialShared}
                    onClick={() => setIsDialogOpen(true)}
                    className="w-full sm:w-auto"
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    Invite on Social Media
                  </Button>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white w-full sm:w-auto"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending…
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Invite Friend
                      </>
                    )}
                  </Button>
                </div>
              </form>

              {/* Success Message */}
              {lastInvitee && (
                <div className="mt-4 rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-800">
                  Thanks for inviting <strong>{lastInvitee}</strong> to Kinscare! Share on social
                  for even more reach.
                </div>
              )}
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

      {/* Social Share Dialog (styled to match kinscare-ui) */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="p-0 sm:max-w-[560px] overflow-hidden bg-transparent border-0 shadow-none">
          <div className="relative flex max-h-[85vh] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            {/* Inner gradient header */}
            <div className="relative shrink-0 bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-700">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(700px_200px_at_0%_-10%,white,transparent)]" />
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(700px_200px_at_100%_120%,white,transparent)]" />
              <div className="flex items-center justify-between px-5 py-4">
                <h2 className="text-white text-base md:text-lg font-semibold tracking-tight">
                  Share with Your Friends
                </h2>
                <button
                  onClick={() => setIsDialogOpen(false)}
                  className="rounded-full z-50 p-2 text-white/90 hover:text-white hover:bg-white/10 transition"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Share buttons */}
            <div className="flex-1 overflow-y-auto px-5 md:px-6 py-6 bg-gray-50/60">
              <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-center">
                <FacebookShareButton
                  url="https://kinscare.org/find-jobs"
                  quote="Check out Kinscare!"
                  onShareWindowClose={() => handleSocialShare("facebook")}
                  className="w-full sm:w-auto"
                >
                  <div className="flex w-full sm:w-auto items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-lg shadow-sm">
                    <FacebookIcon size={28} round />
                    <span className="text-sm font-medium">Share on Facebook</span>
                  </div>
                </FacebookShareButton>

                <WhatsappShareButton
                  url="https://kinscare.org/find-jobs"
                  title="Join me on Kinscare!"
                  onShareWindowClose={() => handleSocialShare("whatsapp")}
                  className="w-full sm:w-auto"
                >
                  <div className="flex w-full sm:w-auto items-center justify-center gap-3 bg-green-500 hover:bg-green-600 text-white py-2.5 px-4 rounded-lg shadow-sm">
                    <WhatsappIcon size={28} round />
                    <span className="text-sm font-medium">Share on WhatsApp</span>
                  </div>
                </WhatsappShareButton>
              </div>

              {/* Tiny helper */}
              <p className="mt-4 text-center text-xs text-gray-600">
                Sharing helps your network discover jobs faster—and can boost your referral points.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InviteFriends;
