/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import MongoContext from "@/app/MongoContext";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { Interweave } from "interweave";
import { AlertCircle, ChevronLeft, Info } from "lucide-react";
import Link from "next/link";
import React, { useContext, useEffect, useState } from "react";
import { JobCardSkeleton } from "./JobCardSkelenton";
import ApplyNow from "./JobsUI/ApplyNow";
import Image from "next/image";
import dayjs from "dayjs"; // For date formatting, optional

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

function ReferralApplicationStatus({ application_submitted }: any) {
 // Filter for all referral applications (if you want to show all, not just first)
 const referralApps = (application_submitted || []).filter(
  (a:any) => a.referral === true
);

if (!referralApps.length) return null;

  return (
    <section className="my-10">
      <h3 className="text-lg font-bold text-gray-900 mb-4">
        Your Referral Applications
      </h3>
      <div className="space-y-5">
        {referralApps.map((app:any, idx:number) => (
          <div
            key={idx}
            className="flex items-start gap-3 bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 shadow-sm"
          >
            <div className="flex-shrink-0 mt-1">
              <span className="inline-flex items-center justify-center rounded-full bg-gray-100 text-indigo-500 w-8 h-8">
                <Info className="w-5 h-5" />
              </span>
            </div>
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1">
                <span className="text-base font-semibold text-gray-800">
                  {app.title || "Referred Job"}
                </span>
                {app.date && (
                  <span className="text-xs  text-gray-800 sm:ml-3">
                    {dayjs(app.date).format("MMM D, YYYY")}
                  </span>
                )}
              </div>
              <span className="block text-sm text-gray-600 mb-1">
                Provider:{" "}
                <span className="font-medium text-gray-900">{app.provider}</span>
              </span>
              <div className="flex flex-wrap gap-2 mb-1">
                {/* Show licenses and availability if available */}
                {Array.isArray(app.licenses) &&
                  app.licenses.map((lic:any, i:number) => (
                    <span
                      key={i}
                      className="bg-gray-200 text-xs rounded-full px-2 py-0.5 text-gray-700"
                    >
                      {lic}
                    </span>
                  ))}
                {Array.isArray(app.availability) &&
                  app.availability.map((av:any, i:number) => (
                    <span
                      key={i}
                      className="bg-gray-100 text-xs rounded-full px-2 py-0.5 text-gray-500"
                    >
                      {av}
                    </span>
                  ))}
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                This application was submitted through a referral. You’ll be notified as soon as the provider claims the job and can review your application.
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <span className="text-xs text-gray-500">
          <em>
            Your applications are safe and visible to providers once they finalize their job posts. No extra steps needed.
          </em>
        </span>
      </div>
    </section>
  );
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
                <Image
                  width={40}
                  height={40}
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
                {/* <Interweave content={job.certifications} /> */}
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
function AppliedJobs() {
  const mongo: any = useContext(MongoContext);
  const { user, userData } = mongo;
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState([]);
  // console.log(userData);
  const fetchJob = async () => {
    try {
      setLoading(true);
      const { data }: any = await axios.get(
        `https://kinscare-backend.onrender.com/api/v1/caregivers/jobs/applied-job/${user.customData.userID}`
      );
      setJobs(data.jobs);
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
  console.log(jobs);
  return (
    <div className=" px-2 bg-gray-50 md:px-4 min-h-[100vh]">
      <div className="max-w-6xl pt-10 mx-auto">
        <div className="div">
          <Link href="/vitae/jobs/all">
            <Button variant="ghost">
              <ChevronLeft size={18} /> Back to search jobs
            </Button>
          </Link>
        </div>
        {loading && (
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1  gap-6">
              {Array.from({ length: 6 }).map((_, idx) => (
                <JobCardSkeleton key={idx} />
              ))}
            </div>
          </div>
        )}
        {jobs.map((job: any, index: React.Key | null | undefined) => (
          <JobPostCard key={index} job={job} />
        ))}
        <ReferralApplicationStatus
          application_submitted={userData.application_submitted}
        />
      </div>
    </div>
  );
}

export default AppliedJobs;
