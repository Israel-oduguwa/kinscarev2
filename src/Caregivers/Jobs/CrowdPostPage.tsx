"use client";
import { useRouter, useParams, usePathname } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { useApiClient } from "@/hooks/useApiClient";
import { useAuthContext } from "@/context/AuthContext";
import CrowdPostUI from "./CrowdPostUI";
import CrowdPostFormSkeleton from "./CrowdPostFormSkeleton";
import { motion } from "framer-motion";
import { Gift, Share2 } from "lucide-react";
import Link from "next/link";
import { WhatsappShareButton, WhatsappIcon } from "next-share";
import { title } from "process";

const CrowdPostPage = ({ type }: any) => {
  const { id }: any = useParams();
  // const path = usePathname()
  // console.log(path)
  const authData: any = useAuthContext();
   const { userData} = authData;
  const [copied, setCopied] = useState(false);

  const referralLink = "https://www.kinscare.org/refer-and-earn";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareMsg =
    "Know a care home or agency hiring caregivers? Share a job lead on KinsCare and get rewarded when your referral signs up!,you earn up to $55, and they get a free 7-day trial to connect with top candidates";

  return (
    <div className="max-w-7xl mx-auto">
      <CrowdPostUI
        
        type={type}
      />
      <div className="py-6">
        <div className="relative mx-6 ">
          {/* Card Container */}
          <div className="relative bg-white/90 backdrop-blur-md rounded-3xl shadow-xl overflow-hidden p-8 md:p-10 z-10">
            {/* Header */}
            <div className=" mb-2">
              <h1 className="text-2xl md:text-xl font-bold text-gray-800 mb-2">
                Help More Caregivers Get Hired—And Earn for Every Connection
              </h1>
              <p className="text-gray-600">
                Know an employer or family looking to hire caregivers? Share
                this link so they can post a job, connect with great candidates,
                and can earn up to <span className="font-bold">$55</span> when
                their referral is claimed.
              </p>
            </div>

            {/* Referral Link */}
            <div className="mb-8">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Your Referral Link:
              </label>
              <div className="border border-dashed border-indigo-300 rounded-lg p-2 flex items-center justify-between bg-indigo-50/50 hover:bg-indigo-50 transition-colors">
                <div className="truncate text-sm text-gray-800 font-medium mr-2">
                  {referralLink}
                </div>
                <button
                  onClick={copyToClipboard}
                  className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
                    copied
                      ? "bg-green-100 text-green-600"
                      : "bg-indigo-100 text-indigo-600 hover:bg-indigo-200"
                  }`}
                  aria-label={copied ? "Copied!" : "Copy to clipboard"}
                >
                  <i className={copied ? "fas fa-check" : "far fa-copy"}></i>
                </button>
              </div>
            </div>

            {/* WhatsApp Button */}
            <div className="flex items-baseline gap-4">
              <WhatsappShareButton
                url={referralLink}
                title={shareMsg}
                separator=" "
                className="w-full"
              >
                <div className="whatsapp-btn bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-3 px-6 rounded-full inline-flex items-center justify-center w-full max-w-xs hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                  <WhatsappIcon size={25} round={false} className="mr-3" />
                  Share on WhatsApp
                </div>
              </WhatsappShareButton>
              {/* <p className="text-gray-700 mb-4 flex items-center justify-center">
                Share via WhatsApp and help more providers hire faster!
              </p> */}
            </div>

            {/* Earnings Animation */}
            <div className="absolute top-6 right-6 flex items-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center shadow-md">
                <i className="fas fa-dollar-sign text-green-600 text-xl"></i>
              </div>
              <div className="w-3 h-3 rounded-full bg-green-500 ml-2 animate-pulse"></div>
            </div>
          </div>

          {/* Floating Icons */}

          <div className="absolute -top-4 -right-4 w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg z-10">
            <i className="fas fa-briefcase-medical text-indigo-500 text-xl"></i>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrowdPostPage;
