"use client";

import React, { useContext, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, X } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import MongoContext from "@/app/MongoContext";
import axios from "axios";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  Dialog,
  DialogContent,
  DialogHeader,
} from "@/components/ui/dialog";
import {
  FacebookShareButton,
  WhatsappShareButton,
  FacebookIcon,
  WhatsappIcon,
} from "next-share";
import { fetchUserData } from "@/lib/utils";
import { useDialog } from "../CaregiverContext/DialogProvider";

// Validation schema
const schema = yup.object({
  name: yup.string().required("Name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
});

const InviteFriends: React.FC = () => {
  const mongodb: any = useContext(MongoContext);
  const { userData, setUserData } = mongodb;
  const { closeDialog } = useDialog();

  const [points, setPoints] = useState({
    invites: 0,
    totalPoints: 0,
  });

  const [lastInvitee, setLastInvitee] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [socialShared, setSocialShared] = useState(false);
  const [socialShareCount, setSocialShareCount] = useState<number>(0);
  const [selectedPlatform, setSelectedPlatform] = useState<
    "facebook" | "whatsapp"
  >("facebook");

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
      setSocialShared(
        userData.careerProfile?.inviteFriends?.socialShared || false
      );
      setSocialShareCount(
        userData.careerProfile?.inviteFriends?.socialShareCount || 0
      );
    }
  }, [userData]);

  const updateDatabase = async (updates: any) => {
    const payload = {
      collectionName: "users",
      operation: "updateOne",
      filter: { userID: userData.userID },
      update: { $set: updates },
      options: { upsert: true },
    };
    try {
      await axios.post(
        "https://kinscare-backend.onrender.com/api/v1/auth/crud-operation",
        payload
      );
      const fetchedData:any = await fetchUserData(
        userData.userID,
        userData.settings?.email || userData.auth?.email
      );
      setUserData(fetchedData.result);
    } catch (error) {
      console.error("Failed to update database:", error);
    }
  };

  const onSubmit = async (data: { name: string; email: string }) => {
    setLoading(true);

    const newInvites = points.invites + 1;
    const newPoints =
      points.totalPoints + (newInvites <= 3 ? 15 : 5); // First 3 invites = 15 points, others = 5

    setPoints({ invites: newInvites, totalPoints: newPoints });

    try {
      setLastInvitee(data.name);

      await axios.post("https://kinscare-backend.onrender.com/api/v1/email/invite-friend", {
        to: data.email,
        senderName: `${userData.fname} ${userData.lname}`,
        recipientName: data.name,
        referrerID: userData.userID,
      });

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

  return (
    <div className="bg-gray-100">
      <button
        className="absolute right-4 top-4 z-20 p-2 rounded-full bg-gray-200 hover:bg-gray-300"
        onClick={closeDialog}
      >
        <X size={20} />
      </button>
      <div className="max-w-4xl mx-auto">
        <div className="w-full border border-gray-50 shadow-sm bg-white p-8 space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Invite Your Friends to Kinscare
            </h2>
            <p className="text-sm font-light text-gray-600">
              Earn points by inviting your friends to join Kinscare and help us
              spread the word!
            </p>
          </div>

          {/* Invite Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900">
                Name
              </label>
              <input
                type="text"
                {...register("name")}
                className={`bg-gray-50 border ${
                  errors.name ? "border-red-500" : "border-gray-300"
                } focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm rounded-lg block w-full p-2.5`}
                placeholder="Enter friend's name"
              />
              {errors.name && (
                <span className="text-red-500 text-sm">
                  {errors.name.message}
                </span>
              )}
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900">
                Email
              </label>
              <input
                type="email"
                {...register("email")}
                className={`bg-gray-50 border ${
                  errors.email ? "border-red-500" : "border-gray-300"
                } focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm rounded-lg block w-full p-2.5`}
                placeholder="Enter friend's email"
              />
              {errors.email && (
                <span className="text-red-500 text-sm">
                  {errors.email.message}
                </span>
              )}
            </div>

            <Separator />

            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="animate-spin" />}
                {loading ? "Sending..." : "Invite Friend"}
              </Button>
            </div>
          </form>

          {/* Success Message */}
          {lastInvitee && (
            <p className="text-sm">
              Thanks for inviting <strong>{lastInvitee}</strong> to Kinscare!
              Earn more points by sharing this on social media.
            </p>
          )}

          <Separator />

          {/* Social Sharing */}
          <div className="mt-4 flex justify-end">
            <Button
              variant="outline"
              disabled={socialShared}
              onClick={() => setIsDialogOpen(true)}
            >
              Invite on Social Media
            </Button>
          </div>

          {/* Total Points */}
          <div className="mt-6 text-right">
            <h3 className="text-2xl font-semibold text-gray-700">
              {points.totalPoints} <span className="text-sm">Points</span>
            </h3>
          </div>
        </div>
      </div>

      {/* Social Share Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <h2 className="text-xl font-semibold text-gray-800">
              Share with Your Friends
            </h2>
          </DialogHeader>
          <div className="flex flex-col sm:flex-row gap-4 mt-6 items-center justify-center">
            <FacebookShareButton
              url="https://kinscare.org/find-jobs"
              quote="Check out Kinscare!"
              onShareWindowClose={() => handleSocialShare("facebook")}
            >
              <div className="flex items-center space-x-3 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg shadow-md">
                <FacebookIcon size={32} round />
                <span>Share on Facebook</span>
              </div>
            </FacebookShareButton>

            <WhatsappShareButton
              url="https://kinscare.org/find-jobs"
              title="Join me on Kinscare!"
              onShareWindowClose={() => handleSocialShare("whatsapp")}
            >
              <div className="flex items-center space-x-3 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg shadow-md">
                <WhatsappIcon size={32} round />
                <span>Share on WhatsApp</span>
              </div>
            </WhatsappShareButton>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InviteFriends;
