"use client";

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { Interweave } from "interweave";
import { MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import ProfileAvatar from "@/components/ProfileAvatar";
import ProtectedCandidatesDetails from "@/Providers/Candidates/ProtectedCandidatesDetails";
import ProviderDialog from "@/Providers/Candidates/ProviderDialog";
import { useParams } from "next/navigation";

// -----------------------------
// Skeleton (unchanged)
// -----------------------------
const CandidateDetailsSkeleton = () => {
  return (
    <div className="bg-gray-100 p-6 max-w-6xl mx-auto space-y-4">
      <div className="relative shadow-sm border bg-white border-gray-200 rounded-lg p-6 space-y-4">
        <div className="flex items-center space-x-4">
          <Skeleton className="w-20 h-20 rounded-full" />
          <div className="flex flex-col space-y-2">
            <Skeleton className="w-48 h-6 rounded" />
            <Skeleton className="w-32 h-4 rounded" />
          </div>
        </div>
        <div className="flex flex-wrap gap-4 mt-4">
          <Skeleton className="w-16 h-6 rounded" />
          <Skeleton className="w-20 h-6 rounded" />
          <Skeleton className="w-12 h-6 rounded" />
        </div>
        <div className="space-y-2 mt-6">
          <Skeleton className="w-32 h-6 rounded" />
          <Skeleton className="w-full h-4 rounded" />
          <Skeleton className="w-3/4 h-4 rounded" />
        </div>
        <div className="space-y-2 mt-6">
          <Skeleton className="w-32 h-6 rounded" />
          <Skeleton className="w-full h-4 rounded" />
        </div>
      </div>
      <div className="space-y-4">
        <Skeleton className="w-32 h-6 rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="shadow-sm border bg-white border-gray-200 rounded-lg p-4 space-y-4"
            >
              <Skeleton className="w-16 h-16 rounded-full mx-auto" />
              <Skeleton className="w-3/4 h-4 rounded mx-auto" />
              <Skeleton className="w-1/2 h-4 rounded mx-auto" />
              <Skeleton className="w-full h-6 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// -----------------------------
// Small card for similar caregivers (client-side)
// -----------------------------
function CandidatesCard({ similarCaregivers }: any) {
  const availability = false;

  return (
    <div key={similarCaregivers.userID} className="w-full mb-4">
      <Link href={`/agent/caregiver/${similarCaregivers.userID}`}>
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
          <div className="mb-1 flex min-h-52 flex-col space-y-4">
            <div className="flex justify-between">
              <div className="flex space-x-2 items-center">
                <ProfileAvatar
                  size="w-14 h-14"
                  name={`${similarCaregivers?.name}`}
                  profileImage={similarCaregivers?.profileImage}
                />
                <div>
                  <p className="antialiased flex space-x-2 font-bold relative text-gray-900">
                    {similarCaregivers.name}{" "}
                    {availability && (
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-gray-600 flex flex-wrap gap-0.5 space-x-1 items-center">
                    <MapPin size={15} />
                    {similarCaregivers.city}, {similarCaregivers.zipcode}{" "}
                    <span className="h-1 w-1 bg-gray-700 rounded-full" />
                    {availability && (
                      <span className="text-sm text-green-600 antialiased">
                        Available now
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="w-full">
              <div className="w-full flex-wrap gap-4 flex">
                {Array.isArray(similarCaregivers.licenses) &&
                  similarCaregivers.licenses
                    .slice(0, 2)
                    .map((license: any, idx: number) => (
                      <div
                        key={`${license}-${idx}`}
                        className="relative text-sm bg-gray-100 text-gray-800 rounded-lg py-1.5 px-3"
                      >
                        <span className="text-sm text-gray-600">{license}</span>
                      </div>
                    ))}

                {Array.isArray(similarCaregivers.availability) &&
                  similarCaregivers.availability
                    .slice(0, 1)
                    .map((sch: any, idx: number) => (
                      <div
                        key={`${sch}-${idx}`}
                        className="relative text-sm bg-gray-100 text-gray-800 rounded-lg py-1.5 px-3"
                      >
                        <span className="text-sm text-gray-600">{sch}</span>
                      </div>
                    ))}
              </div>
            </div>

            <div className="w-full">
              <p className="flex mb-2 text-sm font-bold items-center">
                Certifications
              </p>
              <div className="text-sm text-gray-600 line-clamp-2">
                <Interweave content={similarCaregivers.certifications} />
              </div>
            </div>
          </div>

        </div>
      </Link>
    </div>
  );
}

// -----------------------------
// Main details (client-side + axios)
// -----------------------------
export default function CaregiverDetails() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [caregiver, setCaregiver] = useState<any>(null);
  const [similarCaregivers, setSimilarCaregivers] = useState<any[]>([]);
  const params = useParams();
  const id = params?.id as string;
  const candidateID = id;
  // Endpoint (keep your existing one)
  const API_URL = useMemo(
    () =>
      `https://jrp7pe2xhj.us-east-1.awsapprunner.com/api/v1/providers/caregivers/${candidateID}`,
    [candidateID]
  );

  useEffect(() => {
    if (!candidateID) return;

    const controller = new AbortController();

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(API_URL, {
          signal: controller.signal,
          // Disable any axios caching layers (if any)
          headers: { "Cache-Control": "no-cache" },
        });

        const response = res.data || {};
        setCaregiver(response.caregiver || null);
        setSimilarCaregivers(
          Array.isArray(response.similarCaregivers)
            ? response.similarCaregivers
            : []
        );
      } catch (e: any) {
        if (axios.isCancel(e)) return;
        setError(
          e?.response?.data?.error || e?.message || "Failed to load caregiver."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    return () => controller.abort();
  }, [API_URL, candidateID]);

  const availability = false;

  if (loading) return <CandidateDetailsSkeleton />;

  if (error || !caregiver) {
    return (
      <div className="max-w-6xl px-4 md:px-10 py-12 xl:px-0 mx-auto">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-800">
          {error || "Caregiver not found."}
        </div>
      </div>
    );
  }

  return (
    <div >
      {/* Candidate Profile */}
      <div className="relative  bg-white mb-4 rounded-lg p-4 md:p-6 space-y-6">
        {/* Header Section */}
        <div className="flex flex-col flex-wrap sm:flex-row space-y-4 items-start sm:items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <ProfileAvatar
                size="w-24 h-24"
                name={`${caregiver?.fname ?? ""} ${caregiver?.lname ?? ""}`}
                profileImage={caregiver?.profileImage}
              />
              {availability && (
                <span className="absolute top-1 right-1">
                  <span className="relative flex h-4 w-4 items-center">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
                  </span>
                </span>
              )}
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                {(caregiver.fname || "") + " " + (caregiver.lname || "")}
              </h2>
              <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                <MapPin size={14} />
                {caregiver.address && caregiver.address} {caregiver.city},{" "}
                {caregiver.zipcode}
              </p>
            </div>
          </div>

         
        </div>

        {/* Licenses and Availability */}
        <div className="w-full flex-wrap gap-4 flex">
          {Array.isArray(caregiver.licenses) &&
            caregiver.licenses
              .slice(0, 3)
              .map((license: any, index: number) => (
                <div
                  key={`${license}-${index}`}
                  className="relative text-xs bg-gray-100 text-gray-800 rounded-lg py-1 px-2"
                >
                  <span className="text-xs antialiased text-gray-600">
                    {license}
                  </span>
                </div>
              ))}
          {Array.isArray(caregiver.availability) &&
            caregiver.availability
              .slice(0, 3)
              .map((sch: any, index: number) => (
                <div
                  key={`${sch}-${index}`}
                  className="relative text-xs bg-gray-100 text-gray-800 rounded-lg py-1 px-2"
                >
                  <span className="text-xs antialiased text-gray-600">
                    {sch}
                  </span>
                </div>
              ))}
        </div>

        {/* Contact Details */}
        <div className="mt-6">
          <ProtectedCandidatesDetails
            name={`${caregiver.fname ?? ""} ${caregiver.lname ?? ""}`}
            email={caregiver?.settings?.email}
            tel={caregiver?.settings?.tel}
          />
        </div>

        {/* About Section */}
        <div className="space-y-4 mt-6">
          <h3 className="text-sm font-semibold text-gray-900">About Me</h3>
          <div className="text-sm text-gray-700 leading-relaxed">
            <Interweave content={caregiver.certifications} />
          </div>
        </div>

        {/* Additional Information */}
        {caregiver.mobility && (
          <div className="mt-6">
            <p className="text-sm">
              <strong className="font-semibold text-gray-900">Mobility:</strong>{" "}
              {caregiver.mobility}
            </p>
          </div>
        )}
        {Array.isArray(caregiver?.settings?.alert_preferences) &&
          caregiver.settings.alert_preferences.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-900">
                Alert Preferences
              </h3>
              <div className="flex flex-wrap gap-2 mt-2">
                {caregiver.settings.alert_preferences.map(
                  (alert: any, idx: number) => (
                    <div
                      key={`${alert}-${idx}`}
                      className="bg-gray-100 text-gray-800 text-xs rounded-full px-3 py-1"
                    >
                      {alert}
                    </div>
                  )
                )}
              </div>
            </div>
          )}
      </div>

      {/* Similar Caregivers Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Similar Caregivers
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {similarCaregivers?.map((cg: any) => (
            <div key={cg._id}>
              <CandidatesCard similarCaregivers={cg} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
