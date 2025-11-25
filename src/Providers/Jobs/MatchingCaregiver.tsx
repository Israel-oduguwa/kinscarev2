"use client";
import axios from "axios";
import { MapPin } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import ProviderDialog from "../Candidates/ProviderDialog";
import { Interweave } from "interweave";
import ProfileAvatar from "@/components/ProfileAvatar";
import { useApiClient } from "@/hooks/useApiClient";

function MatchingCaregiver({ jobID }: { jobID: string }) {
  const [matchingCaregivers, setMatchingCaregiver] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { privateApi } = useApiClient();
  const getMatchingCaregiver = async () => {
    try {
      setLoading(true);
      const caregiver = await privateApi.get(
        `/api/v1/providers/jobs/${jobID}/matching-caregivers`
      );
      console.log(caregiver);
      setMatchingCaregiver(caregiver.data.caregivers);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getMatchingCaregiver();
  }, [jobID]);

  const availability = false;
  // console.log(matchingCaregivers, "matching");
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
  {loading ? (
    <div className="col-span-full">
      <h2>Loading....</h2>
    </div>
  ) : (
    <>
      {matchingCaregivers.length > 0 &&
        matchingCaregivers.map((caregivers: any) => (
          <Link
            key={caregivers.userID}
            href={`/provider/candidates/${caregivers.userID}`}
            className="block w-full"
          >
            <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
              <div className="mb-1 flex min-h-52 flex-col space-y-4">
                <div className="flex justify-between">
                  <div className="flex space-x-2 items-center">
                    <ProfileAvatar
                      size="w-12 h-12"
                      name={caregivers.name}
                      profileImage={caregivers?.profileImage}
                    />
                    <div>
                      <p className="antialiased flex space-x-2 font-bold relative text-gray-900">
                        {caregivers.name}{" "}
                        {availability && (
                          <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-gray-600 flex flex-wrap gap-0.5 space-x-1 items-center">
                        <MapPin size={15} />
                        {caregivers.city}, {caregivers.zipcode}{" "}
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
                  <div className="w-full flex flex-wrap gap-4">
                    {caregivers.licenses?.slice(0, 2).map((license: any, index: number) => (
                      <div
                        key={index}
                        className="relative text-sm bg-gray-100 text-gray-800 rounded-lg py-1.5 px-3"
                      >
                        <span className="text-sm text-gray-600">
                          {license}
                        </span>
                      </div>
                    ))}

                    {caregivers.availability?.slice(0, 1).map((sch: any, index: number) => (
                      <div
                        key={index}
                        className="relative text-sm bg-gray-100 text-gray-800 rounded-lg py-1.5 px-3"
                      >
                        <span className="text-sm text-gray-600">
                          {sch}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="w-full">
                  <p className="flex mb-2 text-sm font-bold items-center">
                    Certifications
                  </p>
                  <div className="text-sm text-gray-600 line-clamp-2">
                    <Interweave content={caregivers.certifications} />
                  </div>
                </div>
              </div>

              <ProviderDialog similar candidate={caregivers} />
            </div>
          </Link>
        ))}
    </>
  )}
</div>

  );
}

export default MatchingCaregiver;
