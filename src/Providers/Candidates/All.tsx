"use client";
import MongoContext from "@/app/MongoContext";
import ProfileAvatar from "@/components/ProfileAvatar";
import { MultiSelect } from "@/components/multi-select";
import { Button } from "@/components/ui/button"; // Using ShadCN button component
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import axios from "axios";
import { Interweave } from "interweave";
import {
  AlertTriangle,
  Loader2,
  Mail,
  MapPin,
  Search,
  Send,
} from "lucide-react";
import Link from "next/link";
import React, { useContext, useEffect, useState } from "react";
import ProviderDialog from "./ProviderDialog";
import { Skeleton } from "@/components/ui/skeleton";

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

interface CaregiverApiResponse {
  pagination: {
    totalCaregivers: number;
    totalPages: number;
    currentPage: number;
  };
  caregivers: Candidates[];
}

interface CandidatesApiResponse {
  totalCandidates: number;
  totalPages: number;
  currentPage: number;
  candidates: Candidates[];
}
const fetchCandidates = async (userID: string, page: number) => {
  try {
    const response = await axios.get(
      `http://localhost:8081/api/v1/providers/caregivers/match/${userID}?page=${page}&limit=10`
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const fetchFilteredCandidates = async (
  availability: string[],
  licenses: string[],
  page: number
) => {
  try {
    const availabilityParam = availability.join(",");
    const licensesParam = licenses.join(",");
    const response = await axios.get(
      `http://localhost:8081/api/v1/providers/find-caregivers/filter?availability=${availabilityParam}&licenses=${licensesParam}&page=${page}&limit=10`
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const CaregiverCardSkeleton = () => {
  return (
    <div className="shadow-sm border bg-white border-gray-200 rounded-lg p-4 space-y-4">
      {/* Avatar and Name */}
      <div className="flex items-center space-x-4">
        <Skeleton className="w-16 h-16 rounded-full" />
        <div className="flex flex-col space-y-2">
          <Skeleton className="w-32 h-6 rounded" />
          <Skeleton className="w-24 h-4 rounded" />
        </div>
      </div>

      {/* Licenses and Availability */}
      <div className="flex flex-wrap gap-2 mt-4">
        <Skeleton className="w-16 h-6 rounded" />
        <Skeleton className="w-20 h-6 rounded" />
        <Skeleton className="w-12 h-6 rounded" />
      </div>

      {/* About Section */}
      <div className="space-y-2 mt-4">
        <Skeleton className="w-full h-4 rounded" />
        <Skeleton className="w-3/4 h-4 rounded" />
      </div>
    </div>
  );
};

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
    <div key={candidate.userID} className="w-full relative mb-4 ">
      <Link href={`/provider/candidates/${candidate.userID}`}>
        <div className="mb-1 flex relative  bg-white flex-col space-y-4 shadow-sm border border-gray-50 rounded-lg p-6">
          <div className="flex justify-between">
            <div className="flex space-x-2 items-center">
              <ProfileAvatar
                size="w-12 h-12"
                name={candidate.name}
                profileImage={candidate?.profileImage}
              />
              {/* <img
                className="h-14 w-14 rounded-full"
                src="https://kinscare-storage.s3.amazonaws.com/Firefly_Generate_a_place_holder_profile_image_cartoony_avatar_Caucasian_man_for_job_application_1309_(1)-transformed.jpeg"
                alt="profile-image"
              /> */}
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
            {/* <div className="hidden md:block">
              <Button
                onClick={(e) => {
                  stopPropagation(e);
                  e.nativeEvent.preventDefault();
                  OpenHireModal();
                }}
              >
                <span className="flex space-x-1 items-center gap-2">
                  <Send size={16} /> Message Caregiver
                </span>{" "}
              </Button>
            </div> */}
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
                  sch:
                    | string
                    | number
                    | bigint
                    | boolean
                    | React.ReactElement<
                        any,
                        string | React.JSXElementConstructor<any>
                      >
                    | Iterable<React.ReactNode>
                    | React.ReactPortal
                    | Promise<React.AwaitedReactNode>
                    | null
                    | undefined,
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
            <h4 className="flex mb-2 text-sm font-bold items-center">
              Certifications
            </h4>
            <p className="text-sm text-gray-600 line-clamp-2">
              <Interweave content={candidate.certifications} />
            </p>
          </div>

          {/* <Button
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
          </Button> */}
        </div>
      </Link>
      <div className="md:absolute py-1 px-1 right-4 top-4">
        <ProviderDialog candidate={candidate} />
      </div>
      {/* Dialog Box for Hire Action */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="lg:max-w-2xl max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
          <DialogHeader>
            <DialogTitle className="flex flex-col items-center justify-center text-center">
              <div className="mb-3">
                <img
                  className="w-24 h-24 rounded-full object-cover"
                  alt="candidate-profile"
                  src="https://kinscare-storage.s3.amazonaws.com/Firefly_Generate_a_place_holder_profile_image_cartoony_avatar_Caucasian_man_for_job_application_1309_(1)-transformed.jpeg"
                />
              </div>
              <p className="font-bold text-2xl text-gray-800">
                {candidate.fname} {candidate.lname}
              </p>
              {/* Message icon with a short message */}
              <div className="flex items-center space-x-2 mt-2">
                <Mail size={16} />
                <p className="text-sm font-medium text-gray-700">
                  Send a message to hire {candidate.fname}
                </p>
              </div>
            </DialogTitle>
          </DialogHeader>

          {/* Content for hire process */}
          <div className="mt-2 space-y-2">
            {/* Message text */}
            <label
              htmlFor="message"
              className="block text-xs font-semibold text-gray-700"
            >
              Your Message
            </label>
            <textarea
              id="message"
              rows={10}
              className="block p-2.5 w-full text-sm focus-visible:outline-blue-500 text-gray-900 bg-gray-50 rounded-sm border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder={`Hi ${candidate.fname} ${candidate.lname}, we think you're a great fit for our opening and would love to talk to you!`}
            ></textarea>
          </div>

          {/* Action buttons */}
          <div className="w-full">
            <Button className="w-full">Send Message</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

function All() {
  const mongodb = useContext(MongoContext);
  const { user, userData }: any = mongodb;
  const userID = userData?.userID;
  const [candidates, setCandidates] = useState<Candidates[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFilteredSearch, setIsFilteredSearch] = useState(false);

  // Filter state
  const [selectedShifts, setSelectedShifts] = useState<string[]>([]);
  const [selectedLicenses, setSelectedLicenses] = useState<string[]>([]);

  // Fetch initial candidates on component load
  useEffect(() => {
    const loadCandidates = async () => {
      if (!userID) return;
      setLoading(true);
      try {
        const data: CandidatesApiResponse = await fetchCandidates(userID, page);
        setCandidates(data.candidates);
        setTotalPages(data.totalPages);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    loadCandidates();
  }, [userID, page]);

  // Fetch candidates based on filters
  const handleSearch = async () => {
    setPage(1);
    setIsFilteredSearch(true);
    setLoading(true);
    setError(null);

    try {
      const data: CaregiverApiResponse = await fetchFilteredCandidates(
        selectedShifts,
        selectedLicenses,
        1 // Always start at page 1 for filtered searches
      );
      // console.log(data, "search-data")
      setCandidates(data.caregivers);
      setTotalPages(data.pagination.totalPages);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Load more candidates
  const loadMoreCandidates = async () => {
    if (page >= totalPages) return;
    setPage((prevPage) => prevPage + 1);

    try {
      setLoading(true);
      const data: CandidatesApiResponse = isFilteredSearch
        ? await fetchFilteredCandidates(
            selectedShifts,
            selectedLicenses,
            page + 1
          )
        : await fetchCandidates(userID, page + 1);

      setCandidates((prev) => [...prev, ...data.candidates]);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Shift and license options
  const shiftOptions = [
    { label: "Full time", value: "Full time" },
    { label: "Part time", value: "Part time" },
    { label: "Weekend", value: "Weekends" },
    { label: "On Call", value: "On Call" },
    { label: "Live In", value: "Live In" },
  ];

  const licenseOptions = [
    { label: "CNA", value: "CNA or NAC" },
    { label: "HCA", value: "HCA" },
    { label: "NAR", value: "NAR" },
    { label: "Companion", value: "None" },
  ];

  return (
    <div className="w-full">
      <div className="bg-slate-100 min-h-[100vh] p-3">
        <div className="max-w-6xl py-6 mx-auto">
          <header className="bg-gradient-to-r mb-6 from-blue-600 to-blue-900 text-white rounded-lg shadow-md p-6">
            <div className="max-w-6xl mx-auto">
              <>
                <div className="mb-4">
                  <h1 className="text-xl font-bold tracking-tight">
                    {candidates.length} Caregivers Found
                  </h1>
                  <p className=" text-gray-200 text-sm">
                    Browse through a list of professional caregivers available
                    for your requirements. Use the filters below to refine your
                    search further.
                  </p>
                </div>
                <div className="mb-1">
                  <div className="w-full max-w-6xl p-6 bg-white rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <MultiSelect
                        options={shiftOptions}
                        onValueChange={setSelectedShifts}
                        defaultValue={selectedShifts}
                        placeholder="Select Shift Types"
                        maxCount={5}
                      />
                      <MultiSelect
                        options={licenseOptions}
                        onValueChange={setSelectedLicenses}
                        defaultValue={selectedLicenses}
                        placeholder="Select Licenses"
                        maxCount={4}
                      />
                      <div className="flex justify-center">
                        <Button
                          className="w-full bg-blue-600 text-white hover:bg-blue-700 transition"
                          onClick={handleSearch}
                        >
                          <Search /> Search
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            </div>
          </header>

          {/* Filters */}

          {/* Loading, Error, or Candidates */}
          {loading ? (
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1  gap-6">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <CaregiverCardSkeleton key={idx} />
                ))}
              </div>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-40">
              <div className="flex items-center text-red-600 space-x-2">
                <AlertTriangle size={24} />
                <p>{error}</p>
              </div>
            </div>
          ) : candidates.length > 0 ? (
            <>
              {candidates.map((candidate, idx) => (
                <CandidatesCard key={candidate._id} candidate={candidate} />
              ))}
              {page < totalPages && (
                <Button
                  className="mt-4 w-full"
                  onClick={loadMoreCandidates}
                  disabled={loading}
                >
                  Load More
                </Button>
              )}
            </>
          ) : (
            <p className="text-center text-gray-500">No candidates found.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default All;
