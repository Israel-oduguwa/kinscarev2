"use client";

import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { MapPin, BadgeCheck, User } from "lucide-react";
import { format } from "date-fns";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import MongoContext from "@/app/MongoContext";
import Link from "next/link";
import { useRouter } from "next/navigation";

const BASE_URL = "https://jrp7pe2xhj.us-east-1.awsapprunner.com/api/v1/providers/jumpstart/all-matches";
const INTERVIEW_URL =
  "https://jrp7pe2xhj.us-east-1.awsapprunner.com/api/v1/providers/jumpstart/interview-caregiver";
const INTERVIEWED_URL =
  "https://jrp7pe2xhj.us-east-1.awsapprunner.com/api/v1/providers/jumpstart/interview-caregivers"; // GET

export default function MatchedCaregivers({
  applicationId,
}: {
  applicationId: string;
}) {
  const [caregivers, setCaregivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [offset, setOffset] = useState(0);
  const limit = 20;
  const [hasMore, setHasMore] = useState(true);
  const [interviewed, setInterviewed] = useState<string[]>([]);
  const { userData }: any = useContext(MongoContext);
  const [addingId, setAddingId] = useState<string | null>(null);
  const router = useRouter();

  // Fetch already interviewed caregivers for this agent & application
  const fetchInterviewed = async () => {
    try {
      const res = await axios.get(INTERVIEWED_URL, {
        params: {
          applicationId,
          agentId: userData.userID,
        },
      });
      setInterviewed((res.data.caregivers || []).map((c: any) => c.userID));
    } catch {
      setInterviewed([]);
    }
  };

  // Fetch caregivers list for matches
  const fetchCaregivers = async (reset = false) => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(BASE_URL, {
        params: {
          applicationId,
          offset: reset ? 0 : offset,
          limit,
        },
      });
      const list = res.data.caregivers || [];
      setCaregivers(reset ? list : (prev) => [...prev, ...list]);
      setHasMore(list.length === limit);
      setOffset((prev) => (reset ? limit : prev + limit));
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err.message ||
          "Failed to fetch caregivers."
      );
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch interview status and matches
  useEffect(() => {
    if (applicationId && userData?.userID) {
      fetchInterviewed();
      fetchCaregivers(true);
    }
    // eslint-disable-next-line
  }, [applicationId, userData?.userID]);

  // Add caregiver to interview
  const handleAddToInterview = async (caregiver: any) => {
    setAddingId(caregiver.userID);
    try {
      const payload = {
        applicationId,
        agentId: userData.userID,
        agentEmail: userData.auth.email,
        caregiver: {
          caregiverId: caregiver.userID,
          name: `${caregiver.fname} ${caregiver.lname}`,
          tel: caregiver.tel,
          email: caregiver.auth?.email || caregiver.email,
        },
      };
      const res = await axios.post(INTERVIEW_URL, payload);

      if (res.data.success) {
        toast({
          title: "Caregiver added to interview!",
          description: `${caregiver.fname} ${caregiver.lname} has been added.`,
          variant: "success",
        });
        setInterviewed((prev) => [...prev, caregiver.userID]);
        // Route immediately
        router.push(`/agent/application/${applicationId}/interviewing`);
      } else {
        toast({
          title: "Failed to add caregiver.",
          description: res.data.message || "Try again.",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: "Error adding caregiver.",
        description: err?.response?.data?.message || err.message,
        variant: "destructive",
      });
    } finally {
      setAddingId(null);
    }
  };

  if (loading && caregivers.length === 0)
    return (
      <div className="max-w-4xl mx-auto py-10 space-y-6">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full rounded-2xl" />
        ))}
      </div>
    );

  if (error)
    return (
      <div className="max-w-xl mx-auto text-center text-red-600 py-20">
        {error}
      </div>
    );

  if (!caregivers.length)
    return (
      <div className="max-w-xl mx-auto text-center text-gray-600 py-20">
        No matched caregivers yet. Please check back soon!
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="mb-8 flex flex-col items-center justify-between md:flex-row md:items-end gap-4">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2 text-center md:text-left">
            Matched Caregivers
          </h1>
          <Link href={`/agent/application/${applicationId}/interviewing`}>
            <Button size="lg" className="shadow-indigo-200 shadow">
              See all Interviews
            </Button>
          </Link>
        </div>
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        {caregivers.map((caregiver: any, idx: number) => {
          const caregiverId =
            caregiver.userID || caregiver.caregiverId || caregiver._id;
          const alreadyAdded = interviewed.includes(caregiverId);

          return (
            <div
              key={caregiverId}
              className={`bg-white rounded-2xl shadow-lg border border-gray-100 p-6 flex flex-col sm:flex-row items-start gap-6 transition hover:shadow-xl
                ${alreadyAdded ? "ring-2 ring-green-200" : ""}
              `}
            >
              <Avatar className="w-20 h-20 flex-shrink-0 shadow border">
                <AvatarImage
                  src={caregiver.profileImage || undefined}
                  alt={caregiver.name || "Caregiver"}
                />
                <AvatarFallback>
                  <User className="w-8 h-8 text-gray-400" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 w-full">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg font-semibold text-gray-800">
                    {caregiver.name || `${caregiver.fname} ${caregiver.lname}`}
                  </span>
                  {caregiver.licenses?.length > 0 && (
                    <span className="flex items-center bg-indigo-50 text-indigo-700 text-xs px-2 py-1 rounded-full font-medium">
                      <BadgeCheck className="w-3 h-3 mr-1" />
                      {caregiver.licenses?.join(", ")}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 mb-1">
                  {caregiver.city && (
                    <span className="inline-flex items-center text-gray-500 text-sm">
                      <MapPin className="w-4 h-4 mr-1" />
                      {caregiver.city}
                    </span>
                  )}
                  {caregiver.zipcode && (
                    <span className="inline-flex items-center text-gray-500 text-xs bg-gray-100 px-2 py-0.5 rounded">
                      {caregiver.zipcode}
                    </span>
                  )}
                  {caregiver.mobility && (
                    <span className="inline-flex items-center text-teal-700 text-xs bg-teal-50 px-2 py-0.5 rounded">
                      {caregiver.mobility === "car_needed"
                        ? "Car Needed"
                        : "No Car"}
                    </span>
                  )}
                </div>
                <div className="mb-2">
                  {caregiver.availability?.length > 0 && (
                    <span className="inline-block text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded">
                      {caregiver.availability?.join(", ")}
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">Phone: </span>
                  {caregiver.auth?.tel || caregiver.tel || "—"}
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">Email: </span>
                  {caregiver.auth?.email || caregiver.email || "—"}
                </div>
                <div className="text-xs text-gray-400 mb-2">
                  Registered:{" "}
                  {caregiver.created
                    ? format(new Date(caregiver.created), "MMM d, yyyy")
                    : "—"}
                </div>
                <Button
                  className="mt-2"
                  size="sm"
                  // disabled={alreadyAdded || addingId === caregiverId}
                  onClick={() => {
                    if (alreadyAdded) {
                      router.push(
                        `/agent/application/${applicationId}/interviewing`
                      );
                    } else {
                      handleAddToInterview(caregiver);
                    }
                  }}
                  variant={alreadyAdded ? "outline" : "default"}
                >
                  {alreadyAdded
                    ? "Added to Interview (See All)"
                    : addingId === caregiverId
                    ? "Adding..."
                    : "Add to Interview"}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
      {/* Pagination button */}
      {hasMore && (
        <div className="flex justify-center mt-8">
          <button
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow transition"
            onClick={() => fetchCaregivers()}
            disabled={loading}
          >
            {loading ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </div>
  );
}
