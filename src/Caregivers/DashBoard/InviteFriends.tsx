"use client";
import React, { useContext, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, PlusIcon, Share2, X } from "lucide-react"; // Assuming Lucide-react icons are being used
import { Separator } from "@/components/ui/separator";
import MongoContext from "@/app/MongoContext"; // Assuming MongoContext is being used
import axios from "axios";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  Dialog,
  DialogContent,
  DialogFooter,
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

type ShareDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  platform: "email" | "facebook" | "instagram";
  setPoints: any;
  setUserData:any;
  social: boolean;
  setSocialShared: any;
  socialShareCount:number;
  points: number;
  userData: any;
};

const ShareDialog: React.FC<ShareDialogProps> = ({
  isOpen,
  setSocialShared,
  socialShareCount,
  onClose,
  setUserData,
  userData,
  points,
  platform,
}) => {
  const shareUrl = `https://kinscare.org/find-jobs`; // Replace with the actual course plan URL
  const title = "Check out this amazing course plan!";

  const updateDatabase = async (plan: any) => {
    const payload = {
      collectionName: "users",
      operation: "updateOne",
      filter: { userID: userData.userID },
      update: {
        $set: plan, // Update only the schedule
      },
      options: {
        upsert: true, // Optional: create a new document if it doesn't exist
      },
    };
    try {
      const addPlan = await axios.post(
        "http://localhost:8081/api/v1/auth/crud-operation",
        payload
      );
      console.log(addPlan);
    } catch (error) {
      console.log(error);
    }
  };
  // API call to reward the user
  const handleRewardUser = async () => {
    updateDatabase({
      "careerProfile.inviteFriends.points": points + 10,
      "careerProfile.inviteFriends.socialShared": true,
      "careerProfile.inviteFriends.socialShareCount": socialShareCount + 1,
      
      "careerProfile.inviteFriends.updated": new Date(),
    });
    const fetchedData: any = await fetchUserData(
      userData.userID,
      userData.email
    );
    // console.log(fetchedData);
    setUserData(fetchedData.result);
    setSocialShared(true);
  };

  // Handle the share completion event and trigger reward
  const handleShareComplete = () => {
    handleRewardUser();
    onClose();
  };

  const handleInstagramShare = () => {
    const instagramUrl = `https://instagram.com/stories/create`;
    window.open(instagramUrl, "_blank");
    handleRewardUser();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <h2 className="text-xl font-semibold text-gray-800">
            Invite your friends on whatsapp or facebook
          </h2>
        </DialogHeader>
        <div className="flex flex-col sm:flex-row gap-4 mt-6 items-center justify-center">
          {/* Facebook Share Button */}
          <FacebookShareButton
            url={shareUrl}
            quote={title}
            onShareWindowClose={handleShareComplete}
          >
            <div className="flex items-center space-x-3 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg shadow-md transition-all duration-300 ease-in-out">
              <FacebookIcon size={32} round />
              <span className="text-lg font-medium">Share on Facebook</span>
            </div>
          </FacebookShareButton>

          {/* WhatsApp Share Button */}
          <WhatsappShareButton
            url={"https://github.com/next-share"}
            onShareWindowClose={handleShareComplete}
            title={
              "next-share is a social share buttons for your next React apps."
            }
            separator=":: "
          >
            <div className="flex items-center space-x-3 cursor-pointer bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg shadow-md transition-all duration-300 ease-in-out">
              <WhatsappIcon size={32} round />
              <span className="text-lg font-medium">Share on WhatsApp</span>
            </div>
          </WhatsappShareButton>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Validation schema
const schema = yup.object().shape({
  name: yup.string().required("Name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  // phone: yup.string().required("Phone number is required"),
});

function InviteFriends() {
  const mongodb: any = useContext(MongoContext); 
  const { userData, setUserData } = mongodb;
  const { closeDialog } = useDialog(); // Access the closeDialog function


  // Points system state
  const [points, setPoints] = useState({
    invites: 0, // Total invites count
    totalPoints: 0, // Total points earned
  });

  const [lastInvitee, setLastInvitee] = useState(""); // Track last invited person for confirmation message
  const [loading, setLoading] = useState(false); // Loading state
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [socialShared, setHasShared] = useState<boolean>(false);
  const [socialShareCount, setSocialShareCount] = useState<number>(0)
  const [selectedPlatform, setSelectedPlatform] = useState<
    "email" | "facebook" | "instagram"
  >("email");

  const handleDialogOpen = (platform: "email" | "facebook" | "instagram") => {
    setSelectedPlatform(platform);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
  };

  // Use form hook with validation
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
      // set the states for the data
      setPoints({
        invites: userData?.careerProfile?.inviteFriends?.invites || 0,
        totalPoints: userData?.careerProfile?.inviteFriends?.points || 0,
      });
      setHasShared(
        userData.careerProfile?.inviteFriends?.socialShared || false
      );
      setSocialShareCount(userData.careerProfile?.inviteFriends?.socialShareCount)

    }
  }, [userData]);

  // Update database function
  const updateDatabase = async (inviteInfo: any) => {
    const payload = {
      collectionName: "users",
      operation: "updateOne",
      filter: { userID: userData.userID },
      update: {
        $set: {
          "careerProfile.inviteFriends.draft": true,
          "careerProfile.inviteFriends.invites": inviteInfo.invites,
          "careerProfile.inviteFriends.points": inviteInfo.totalPoints,
        },
      },
      options: {
        upsert: true,
      },
    };
    try {
      await axios.post(
        "http://localhost:8081/api/v1/auth/crud-operation",
        payload
      );
      const fetchedData: any = await fetchUserData(
        userData.userID,
        userData.settings.email,
      );
      // console.log(fetchedData);
      setUserData(fetchedData.result);
    } catch (error) {
      console.error("Database update failed:", error);
    }
  };

  // Handle invite submission
  const onSubmit = async (data: any) => {
    setLoading(true); // Set loading to true when the submission starts

    // Points calculation: First 3 invites = 15 points each, subsequent = 5 points
    const newInvites = points.invites + 1;
    let newPoints = points.totalPoints;

    if (newInvites <= 3) {
      newPoints += 15;
    } else {
      newPoints += 5;
    }

    // Update state with new points and invites
    setPoints({
      invites: newInvites,
      totalPoints: newPoints,
    });

   try {
     // Set last invitee name for confirmation message
     setLastInvitee(data.name);
     // send the email
     const payload = {
       to: data.email,
       senderName: `${userData.fname} ${userData.lname}`,
       recipientName: data.name,
       referrerID: userData.userID, // this is the ID of the caregiver that referred the user
     };
     const sendInviteEmail = await axios.post(
       `http://localhost:8081/api/v1/email/invite-friend`,
       payload
     );
     if (sendInviteEmail.data.success) {
       // Update the database with invite info
       await updateDatabase({
         invites: newInvites,
         totalPoints: newPoints,
       });
       reset();
     }
     
    
   } catch (error) {
     setLoading(false)
     console.log(error)
   }
   finally{
 // Reset form fields
 reset();
 setLoading(false); // Reset loading state when done
   }
  };

  // Handle sharing to social media
  const handleShare = () => {
    alert("Shared to Facebook/Instagram!");
    setPoints((prevPoints) => ({
      ...prevPoints,
      totalPoints: prevPoints.totalPoints + 10, // Add 10 points for sharing
    }));
  };

  return (
    <div className="bg-gray-100">
      <button
        className="right-4 p-2 top-4 absolute z-20 rounded-full bg-gray-200 hover:bg-gray-300"
        onClick={closeDialog}
      >
        <X size={20} />
      </button>
      <div className="max-w-4xl mx-auto ">
        <div className="w-full border  border-gray-50 shadow-sm bg-white p-8 space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Invite Your Friends to Kinscare
            </h2>
            <p className="text-sm font-light text-gray-600">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Porro,
              quae?
            </p>
          </div>
          {/* Invite Friend Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block mb-2 antialiased text-sm font-medium text-gray-900 dark:text-white">
                Name
              </label>
              <input
                type="text"
                {...register("name")}
                className={`bg-gray-50 border ${
                  errors.name ? "border-red-500" : "border-gray-300"
                } focus-visible:outline-blue-500 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                placeholder="Enter friend's name"
              />
              {errors.name && (
                <span className="text-red-500 text-sm">
                  {errors.name.message}
                </span>
              )}
            </div>
            <div>
              <label className="block mb-2 antialiased text-sm font-medium text-gray-900 dark:text-white">
                Email
              </label>
              <input
                type="email"
                {...register("email")}
                className={`bg-gray-50 border ${
                  errors.email ? "border-red-500" : "border-gray-300"
                } focus-visible:outline-blue-500 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                placeholder="Enter friend's email"
              />
              {errors.email && (
                <span className="text-red-500 text-sm">
                  {errors.email.message}
                </span>
              )}
            </div>
            {/* <div>
              <label className="block mb-2 antialiased text-sm font-medium text-gray-900 dark:text-white">
                Phone
              </label>
              <input
                type="tel"
                {...register("phone")}
                className={`bg-gray-50 border ${
                  errors.phone ? "border-red-500" : "border-gray-300"
                } focus-visible:outline-blue-500 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                placeholder="Enter friend's phone number"
              />
              {errors.phone && (
                <span className="text-red-500 text-sm">
                  {errors.phone.message}
                </span>
              )}
            </div> */}
            <Separator />

            {/* Send Invite Button */}
            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>
                {loading &&  <Loader2 className="animate-spin"/>}
                {loading ? "Sending..." : "Invite Friend"}
              </Button>
            </div>
          </form>

          {/* Success message */}
          {lastInvitee && (
            <div className="antialiased">
              <p>
                Thanks for sending <strong>{lastInvitee}</strong> an invite to
                join Kinscare. Help us get the word out by sharing this post
                about Kinscare on Facebook.
              </p>
            </div>
          )}

          <Separator />

          {/* Card for sharing additional resources */}
          <div className="mt-4 p-4 border rounded-lg bg-gray-50 shadow-sm">
            {/* Share Button */}
            <div className="mt-4 flex justify-end space-x-2">
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  disabled={socialShared}
                  onClick={() => handleDialogOpen("facebook")}
                >
                  {" "}
                  {/* <img
                    src="https://upload.wikimedia.org/wikipedia/commons/b/b9/2023_Facebook_icon.svg"
                    alt="Facebook Logo"
                    className="w-6 h-6 mr-2"
                  />{" "} */}
                  Invite your friends on social media
                </Button>
              </div>
            </div>
          </div>

          {/* Points summary */}
          <div className="mt-6 text-right">
            <h3 className="text-2xl font-semibold text-gray-700">
              {points.totalPoints} <span className="text-sm">Points</span>
            </h3>
          </div>

          <ShareDialog
            setPoints={setPoints}
            social={socialShared}
            isOpen={isDialogOpen}
            onClose={handleDialogClose}
            setSocialShared={setHasShared}
            platform={selectedPlatform}
            socialShareCount={socialShareCount}
            setUserData={setUserData}
            userData={userData}
            points={points.totalPoints}
          />
        </div>
      </div>
    </div>
  );
}

export default InviteFriends;
