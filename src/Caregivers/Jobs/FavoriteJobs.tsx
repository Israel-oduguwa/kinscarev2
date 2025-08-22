/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import MongoContext from "@/app/MongoContext";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { Interweave } from "interweave";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import React, { useContext, useEffect, useState } from "react";
import { JobCardSkeleton } from "./JobCardSkelenton";
import ApplyNow from "./JobsUI/ApplyNow";

interface Contact {
  address: string;
  city: string;
  zipcode: string;
}

interface Job {
  provider: any;
  profileImage: string;
  _id: any;
  title: string;
  contacts: Contact;
  certifications: string;
  licenses: string[];
  schedule: string[];
  minHours: number;
  compensation: string;
}

const JobPostCard: React.FC<{ job: Job }> = ({ job }) => {
  // console.log(job);
  return (
    <div className="bg-white shadow-md border border-gray-100 rounded-lg p-6 my-4 w-full mx-auto">
      <div className="flex flex-col lg:flex-row items-center lg:items-start lg:justify-between gap-6">
        {/* Job Content */}
        <Link href={`/vitae/jobs/${job._id}`} className="flex-1">
          <div>
            {/* Job Header */}
            <div className="flex items-center gap-4 mb-4">
              {job.profileImage && (
                <img
                  className="h-12 w-12 rounded-full object-cover"
                  src={
                    job.profileImage ||
                    "https://lh3.googleusercontent.com/-g8IwNe70-kE/AAAAAAAAAAI/AAAAAAAAAAA/ALKGfkl1tpVAKXAezzCNWmKH5JWvlgr_xw/photo.jpg?sz=46"
                  }
                  alt="company logo"
                />
              )}
              <div>
                <h2 className="font-bold tracking-tight text-gray-800">
                  {job.title}
                </h2>
                <p className="text-sm text-gray-600">
                  {job.contacts.address}, {job.contacts.city},{" "}
                  {job.contacts.zipcode}
                </p>
              </div>
            </div>

            {/* Certifications */}
            <div className="mb-4">
              <p className="text-sm text-gray-600 line-clamp-2">
                <Interweave content={job.certifications} />
              </p>
            </div>

            {/* Licenses and Schedule */}
            <div className="flex flex-wrap gap-2 mb-4">
              {job?.licenses?.map((license, index) => (
                <span
                  key={index}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-800 rounded-lg"
                >
                  {license}
                </span>
              ))}
              {job?.schedule?.map((sch, index) => (
                <span
                  key={index}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-800 rounded-lg"
                >
                  {sch}
                </span>
              ))}
            </div>

            {/* Min Hours */}
            <div>
              <p className="text-sm text-gray-500">
                Min Hours:{" "}
                <span className="text-gray-700 font-medium">
                  {job.minHours} hours/week
                </span>
              </p>
            </div>
          </div>
        </Link>

        {/* Apply Button */}
        <div className="flex-shrink-0 w-full lg:w-auto ">
          <ApplyNow
            providerName={job.provider}
            job={job}
            jobID={job._id}
            className="w-full lg:w-auto px-6 py-3 bg-blue-600 text-white text-sm rounded-lg shadow-md hover:bg-blue-700 transition-all"
          />
        </div>
      </div>
    </div>
  );
};

function FavoriteJobs() {
  const mongo: any = useContext(MongoContext);
  const { user } = mongo;
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [totalJobs, setTotalJobs] = useState(0);

  const fetchJob = async () => {
    try {
      setLoading(true);
      const { data }: any = await axios.get(
        `https://jrp7pe2xhj.us-east-1.awsapprunner.com/api/v1/caregivers/jobs/favorite/${user.customData.userID}`
      );
      setJobs(data.jobs);
      setTotalJobs(data.totalJobs);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (user) {
      fetchJob();
    }
  }, [user]);
  // console.log(jobs);
  return (
    <div className="py-6 px-2 bg-gray-100 md:px-4 min-h-[100vh]">
      <div className="max-w-6xl mx-auto">
        <div className="div">
          <Link href="/vitae/jobs/all">
            <Button variant="ghost">
              <ChevronLeft size={18} /> Back to search jobs
            </Button>
          </Link>
        </div>
        {!loading && totalJobs > 0 && (
            <div className="mb-4">
              <p className="font-medium text-gray-800">
                No favorite job
              </p>
            </div>
          )}
        {loading && (
          <div>
            <div className="grid grid-cols-1  gap-6">
              {Array.from({ length: 6 }).map((_, idx) => (
                <JobCardSkeleton key={idx} />
              ))}
            </div>
          </div>
        )}
        {!loading && (
          <>
            {jobs.map((job: any, index: React.Key | null | undefined) => (
              <JobPostCard key={index} job={job} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}

export default FavoriteJobs;
