"use client";

import React, { useContext, useEffect, useMemo, useState } from "react";
import { useApiClient } from "@/hooks/useApiClient";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  BadgeCheck,
  CreditCard,
  User,
  ArrowRight,
  Gift,
  DollarSign,
} from "lucide-react";
import { useAuthContext } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";

interface Milestone {
  amount: number;
  rewarded: boolean;
  rewardedAt: string | null;
  deliveryLink?: string | null;
}

interface Referral {
  providerUserID: string;
  providerEmail: string | null;
  providerName: string | null;
  jobPostID: string | null;
  referralCode: string | null;
  profileImage: any | null;
  referredAt: string | null;
  milestones: {
    signup: Milestone;
    identityVerified: Milestone;
    subscription: Milestone;
  };
}

interface CrowdPost {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  claimed: boolean;
  referralCode: string | null;
  mobility?: string;
  applicantCount: number;
}

const API_URL = "/api/v1/caregivers/referrer-rewards";

export const ReferralTracking: React.FC = () => {
  const { userData, contactData } = useAuthContext();
  const userID = userData?.userID;

  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [crowdPosts, setCrowdPosts] = useState<CrowdPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { privateApi } = useApiClient();
  // Pagination state for crowd posts
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 4;
  // Calculate total earned across all milestones & referrals
  const totalEarned = useMemo(() => {
    return referrals.reduce((sumRef, ref) => {
      return (
        sumRef +
        Object.values(ref.milestones).reduce(
          (sumMs, ms) => (ms.rewarded ? sumMs + ms.amount : sumMs),
          0
        )
      );
    }, 0);
  }, [referrals]);

  // Milestone display configuration
  const milestonesConfig = [
    {
      key: "signup",
      title: "Signup & Job Post",
      icon: User,
    },
    {
      key: "identityVerified",
      title: "ID Verified",
      icon: BadgeCheck,
    },
    {
      key: "subscription",
      title: "Subscription",
      icon: CreditCard,
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await privateApi.post(API_URL, { userID });
        const data = res.data;
        if (data.success) {
          setReferrals(data.referrals || []);
          setCrowdPosts(data.crowdPosts || []);
        } else {
          setError(data.message || "Failed to fetch data.");
        }
      } catch (err: any) {
        setError(
          err.response?.data?.message || err.message || "Error occurred"
        );
      } finally {
        setLoading(false);
      }
    };
    if (userID) fetchData();
  }, [userID]);

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorState error={error} />;
  if (!referrals.length && !crowdPosts.length) return <EmptyState />;

  // Pagination calculations
  const totalPages = Math.ceil(crowdPosts.length / postsPerPage);
  const paginatedPosts = crowdPosts.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage
  );
  // console.log(paginatedPosts)
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-12">
      {/* Referral Rewards Section */}
      {referrals.length > 0 && (
        <>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Referral Rewards
              </h1>
              <p className="text-gray-600 mt-1">
                Track your referral earnings and milestones
              </p>
            </div>
            <Link href="/vitae/crowd-post/update/new" passHref>
              <Button
                asChild
                className="bg-gradient-to-r from-indigo-500 to-blue-600 px-5 py-3 text-base font-bold rounded-2xl shadow-lg transition hover:scale-105 active:scale-95"
              >
                <span>Refer Another Provider</span>
              </Button>
            </Link>
          </div>

          <div className="space-y-6">
            {referrals.map((ref, idx) => (
              <div
                key={ref.providerUserID || idx}
                className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden transition hover:shadow-md"
              >
                {/* Header */}
                <div className="p-6 border-b border-gray-100 bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                  <div className="flex items-center">
                    <Avatar>
                      <AvatarImage
                        src={ref.profileImage}
                        alt={ref.providerName || ""}
                      />
                      <AvatarFallback>
                        {ref.providerName?.slice(0, 2) || "P?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="ml-4">
                      <h3 className="font-semibold text-gray-900">
                        {ref.providerName || ref.providerEmail || "Provider"}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Referred on{" "}
                        {ref.referredAt
                          ? format(
                              new Date(ref.referredAt),
                              "MMM d, yyyy, h:mm a"
                            )
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 sm:mt-0">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
                      Code:{" "}
                      <span className="font-mono ml-1">
                        {ref.referralCode || "N/A"}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Milestones */}
                <div className="p-6 relative">
                  {/* <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200"></div> */}
                  <div className="space-y-8 ml-2">
                    {milestonesConfig.map((msCfg) => {
                      const ms =
                        ref.milestones[
                          msCfg.key as keyof typeof ref.milestones
                        ];
                      const rewarded = ms.rewarded;
                      const Icon = msCfg.icon;
                      return (
                        <div key={msCfg.key} className="flex items-start group">
                          <div className="relative z-10 flex-shrink-0 mt-0.5">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                                rewarded
                                  ? "bg-green-500 border-green-600 text-white"
                                  : "bg-white border-gray-300 text-gray-400 group-hover:border-blue-400"
                              } transition-colors`}
                            >
                              <Icon size={16} />
                            </div>
                          </div>
                          <div className="ml-6 flex-1 flex justify-between items-start sm:items-center">
                            <div>
                              <h4
                                className={`font-medium ${
                                  rewarded ? "text-green-700" : "text-gray-900"
                                }`}
                              >
                                {msCfg.title}
                              </h4>
                              <p className="text-sm text-gray-500 mt-1">
                                {rewarded
                                  ? `Earned $${ms.amount} • ${format(
                                      new Date(ms.rewardedAt!),
                                      "MMM d, yyyy"
                                    )}`
                                  : `${
                                      ms.amount
                                    } USD upon ${msCfg.title.toLowerCase()}`}
                              </p>
                            </div>
                            <span
                              className={`font-semibold ${
                                rewarded ? "text-green-600" : "text-gray-400"
                              }`}
                            >
                              ${ms.amount}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.18, type: "spring", stiffness: 120 }}
                    className="flex items-center gap-3"
                  >
                    <span className="inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-green-400 to-green-600 p-2 shadow-lg">
                      <DollarSign className="text-white" size={20} />
                    </span>
                    <div>
                      <span className="block text-lg font-bold text-green-700">
                        ${totalEarned.toLocaleString()}
                      </span>
                      <span className="block text-sm text-gray-500">
                        Total Earned
                      </span>
                    </div>
                  </motion.div>
                  <div className="text-sm text-gray-500">
                    Status:{" "}
                    <span className="font-medium">
                      {Object.values(ref.milestones).every((m) => m.rewarded)
                        ? "Completed"
                        : "In Progress"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Crowd-Sourced Posts Section with Pagination */}
      {crowdPosts.length > 0 && (
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            Your Crowd-Sourced Posts
          </h2>

          <div className="grid gap-6 sm:grid-cols-2">
            {paginatedPosts.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-lg font-medium text-gray-800">
                    {post.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Created: {format(new Date(post.createdAt), "MMM d, yyyy")}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Applicants:{" "}
                    <span className="font-semibold text-gray-700">
                      {post.applicantCount}
                    </span>
                  </p>
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <span
                    className={`px-3 py-1 text-sm rounded-full ${
                      !post.claimed
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {!post.claimed ? "Not Claimed" : "Claimed"}
                  </span>
                  <Link href={`/vitae/crowd-post/${post.id}`}>
                    <Button variant="outline" size="sm">
                      Open <ArrowRight className="inline-block ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-center items-center space-x-4 mt-6">
            <Button
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of{" "}
              {Math.ceil(crowdPosts.length / postsPerPage)}
            </span>
            <Button
              size="sm"
              disabled={
                currentPage === Math.ceil(crowdPosts.length / postsPerPage)
              }
              onClick={() =>
                setCurrentPage((p) =>
                  Math.min(Math.ceil(crowdPosts.length / postsPerPage), p + 1)
                )
              }
            >
              Next
            </Button>
          </div>
        </section>
      )}
    </div>
  );
};

// Loading Skeleton
// Loading Skeleton Component
const LoadingSkeleton = () => (
  <div className="max-w-4xl mx-auto px-4 py-8">
    <div className="flex justify-between items-center mb-10">
      <div>
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-5 w-80" />
      </div>
      <Skeleton className="h-10 w-40" />
    </div>

    {[1, 2, 3].map((item) => (
      <div
        key={item}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6 overflow-hidden"
      >
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="ml-4 space-y-2">
              <Skeleton className="h-5 w-44" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-8 ml-2">
            {[1, 2, 3].map((milestone) => (
              <div key={milestone} className="flex items-start">
                <Skeleton className="w-8 h-8 rounded-full" />
                <div className="ml-6 flex-1 space-y-2">
                  <Skeleton className="h-5 w-56" />
                  <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="h-5 w-12" />
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 flex justify-between">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    ))}
  </div>
);

// Error State Component
const ErrorState = ({ error }: { error: string }) => (
  <div className="max-w-2xl mx-auto px-4 py-16 text-center">
    <div className="bg-red-50 rounded-xl p-8">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-red-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <h3 className="mt-4 text-xl font-medium text-gray-900">
        Error loading data
      </h3>
      <p className="mt-2 text-gray-700">{error}</p>
      <Button className="mt-6" onClick={() => window.location.reload()}>
        Try Again
      </Button>
    </div>
  </div>
);

// Empty State Component
const EmptyState = () => (
  <div className="max-w-7xl mx-auto px-4 py-16 text-center">
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-10">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
        <Gift className="h-8 w-8 text-blue-600" />
      </div>
      <h2 className="mt-6 text-2xl font-bold text-gray-900">
        No referrals yet
      </h2>
      <p className="mt-4 text-gray-700">
        Start earning money by referring providers! You&apos;ll earn rewards
        when they complete important milestones.
      </p>

      <div className="mt-10 bg-white rounded-xl p-6 shadow-sm text-left max-w-md mx-auto">
        <h3 className="font-medium text-gray-900">How it works:</h3>
        <ul className="mt-4 space-y-3 text-sm text-gray-600">
          <li className="flex items-start">
            <div className="flex-shrink-0 mt-1 mr-3 text-green-500">●</div>
            <span>
              <span className="font-medium">$5</span> when they sign up and post
              a job
            </span>
          </li>
          <li className="flex items-start">
            <div className="flex-shrink-0 mt-1 mr-3 text-green-500">●</div>
            <span>
              <span className="font-medium">$20</span> when they verify their
              identity
            </span>
          </li>
          <li className="flex items-start">
            <div className="flex-shrink-0 mt-1 mr-3 text-green-500">●</div>
            <span>
              <span className="font-medium">$30</span> when they subscribe to
              premium
            </span>
          </li>
        </ul>
      </div>

      <div className="mt-10">
        <Link href="/vitae/crowd-post/update/new">
          <Button size="lg" className="px-8 py-4 text-base gap-2">
            <Gift size={18} />
            Refer a Provider Now
          </Button>
        </Link>
        <p className="mt-4 text-sm text-gray-600">
          Your unique referral link will be generated automatically
        </p>
      </div>
    </div>
  </div>
);

export default ReferralTracking;
