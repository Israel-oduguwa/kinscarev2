/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/context/AuthContext";
import { AlertTriangle, MapPin, Send } from "lucide-react";
import React, { useEffect, useState } from "react";

import ProfileAvatar from "@/components/ProfileAvatar";
import { useToast } from "@/components/ui/use-toast";
import { useApiClient } from "@/hooks/useApiClient";
import { Interweave } from "interweave";
import Link from "next/link";
import { CaregiverCardSkeleton } from "./CandidateSkelenton";
import ProviderDialog from "./ProviderDialog";

interface Candidates {
  _id: string;
  fname: string;
  lname: string;
  certifications: string;
  licenses: string[];
  schedule: string[];
  minHours: number;
  compensation: string;
  city: string;
}

interface CandidatesApiResponse {
  totalCandidates: number;
  totalPages: number;
  currentPage: number;
  candidates: Candidates[];
}



const CandidatesCard = ({ candidate }: any) => {
  const availability = false;
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const openDialog = () => setIsDialogOpen(true);
  const closeDialog = () => setIsDialogOpen(false);

  const OpenHireModal = () => {
    //the hire caregiver modal would be open here
    openDialog();
  };
  const stopPropagation = (e: any) => {
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
  };
  return (
    <div key={candidate.userID} className="w-full relative mb-4">
      <Link href={`/provider/candidates/${candidate.userID}`}>
        <div className="mb-1 flex  bg-white flex-col space-y-4 shadow-md border border-gray-50 rounded-lg p-6">
          <div className="flex justify-between">
            <div className="flex space-x-2 items-center">
              <ProfileAvatar
                size="w-12 h-12"
                name={candidate.name}
                profileImage={candidate?.profileImage}
              />
              <div>
                <p className="antialiased flex space-x-2 font-bold relative text-gray-900">
                  {candidate.name}{" "}
                  {availability && (
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                  )}
                </p>
                <p className="text-sm text-gray-600 flex flex-wrap gap-0.5 space-x-1 items-center">
                  <MapPin size={15} />
                  {candidate.city}, {candidate.zipcode}{" "}
                  <span className="h-1 w-1 bg-gray-700 rounded-full"></span>
                  {availability && (
                    <span className="text-sm text-green-600 antialiased">
                      Available now
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="hidden">
              <Button
                onClick={(e) => {
                  stopPropagation(e);
                  e.nativeEvent.preventDefault();
                  OpenHireModal();
                }}
              >
                <span className="flex space-x-1 items-center gap-2">
                  <Send size={16} /> Hire {candidate.name}
                </span>{" "}
              </Button>
            </div>
          </div>
          <div className="w-full">
            <div className="w-full flex-wrap gap-4 flex">
              {candidate.licenses.map((license: any, index: any) => (
                <div
                  key={index}
                  className="relative text-sm bg-gray-100 text-gray-800 rounded-lg py-1.5 px-3"
                >
                  <span className="text-sm text-gray-600">{license}</span>
                </div>
              ))}
              {candidate.availability.map(
                (
                  sch:any,
                  index: React.Key | null | undefined
                ) => (
                  <div
                    key={index}
                    className="relative text-sm bg-gray-100 text-gray-800 rounded-lg py-1.5 px-3"
                  >
                    <span className="text-sm text-gray-600">{sch}</span>
                  </div>
                )
              )}
            </div>
          </div>
          <div className="w-full ">
            <p className="flex mb-2 text-sm font-bold items-center">
              Certifications
            </p>
            <p className="text-sm text-gray-600 line-clamp-2">
              <Interweave content={candidate.certifications} />
            </p>
          </div>
          <Button
            onClick={(e) => {
              stopPropagation(e);
              e.nativeEvent.preventDefault();
              OpenHireModal();
            }}
            className="md:hidden w-full"
          >
            <span className="flex space-x-1 items-center gap-2">
              <Send size={16} /> Hire {candidate.name}
            </span>{" "}
          </Button>
        </div>
      </Link>
      <div className="absolute right-4 top-4">
        <ProviderDialog candidate={candidate} />
      </div>
    </div>
  );
};

function FavoriteCandidates() {
  const authData: any = useAuthContext();
  const { contactData } = authData;
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const {privateApi} = useApiClient()
  const { toast } = useToast();

  // Fetch favorite caregivers
  useEffect(() => {
    const fetchFavoriteCaregivers = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await privateApi.get(
          `/api/v1/providers/favorite-caregivers/${contactData.userID}`
        );
        if (response.status === 200) {
          setCandidates(response.data.data);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load favorite caregivers.");
        toast({
          title: "Error",
          description: "Unable to fetch favorite caregivers. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (contactData?.userID) {
      fetchFavoriteCaregivers();
    }
  }, [contactData]);

  return (
    <div className="w-full">
      <div className="bg-gray-100 min-h-[100vh] p-3">
        <div className="max-w-6xl py-10 mx-auto">
          <h1 className="text-xl text-gray-800 font-bold mb-4">
            Favorite Candidates
          </h1>
          {/* Loading State */}
          {loading && (
            <div className="max-w-6xl mx-auto p-6">
            <div className="grid grid-cols-1  gap-6">
              {Array.from({ length: 6 }).map((_, idx) => (
                <CaregiverCardSkeleton key={idx} />
              ))}
            </div>
          </div>
          )}

          {/* Error State */}
          {error && (
            <div className="flex justify-center items-center h-40">
              <div className="flex items-center text-red-600 space-x-2">
                <AlertTriangle size={24} />
                <p>{error}</p>
              </div>
            </div>
          )}

          {/* Display Candidates */}
          {!loading && !error && candidates.length > 0 ? (
            <div>
              {candidates.map((candidate: any) => (
                <CandidatesCard key={candidate.userID} candidate={candidate} />
              ))}
            </div>
          ) : (
            !loading &&
            !error && (
              <p className="text-center text-gray-500">
                No favorite candidates found.
              </p>
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default FavoriteCandidates;
