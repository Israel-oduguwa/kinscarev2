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
    <div className="bg-white shadow-sm  relative  rounded-lg p-6 my-4 w-full mx-auto">
      <Link href={`/vitae/jobs/${job._id}`}>
        <div className="flex gap-4 items-center mb-3">
          {job.profileImage && (
            <img
              className="h-8 w-8"
              src={
                job.profileImage
                  ? job.profileImage
                  : "profileImage:userData?.profileImage,"
              }
              alt="company logo"
            />
          )}
          <div>
            <h2 className="text-lg font-semibold text-gray-800">{job.title}</h2>
            <p className="text-sm text-gray-600">
              {job.contacts.address}, {job.contacts.city},{" "}
              {job.contacts.zipcode}
            </p>
          </div>
        </div>
        <div className="w-full mb-3">
          <p className="text-sm text-gray-600 line-clamp-2">
            <Interweave content={job.certifications} />
          </p>
        </div>
        <div className="w-full flex-wrap gap-4 flex mb-3">
          {job.licenses.map((license, index) => (
            <div
              key={index}
              className="relative text-sm bg-gray-100 text-gray-800 rounded-lg py-1.5 px-3"
            >
              <span className="text-sm text-gray-600">{license}</span>
            </div>
          ))}
          {job.schedule.map((sch, index) => (
            <div
              key={index}
              className="relative text-sm bg-gray-100 text-gray-800 rounded-lg py-1.5 px-3"
            >
              <span className="text-sm text-gray-600">{sch}</span>
            </div>
          ))}
        </div>
        <div className="w-full gap-4 items-center flex">
          <p className="text-gray-500 text-sm">
            Min Hours:{" "}
            <span className="text-gray-600">{job.minHours} hours/week</span>
          </p>
          <p className="text-gray-600 flex gap-1 items-center text-sm">
            💵 {job.compensation}
          </p>
        </div>
      </Link>
      <div className="absolute hidden lg:block lg:top-6 lg:right-6 ">
        <ApplyNow providerName={job.provider} job={job} jobID={job._id} />
      </div>
    </div>
  );
};
function AppliedJobs() {
  const mongo: any = useContext(MongoContext);
  const { user } = mongo;
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState([]);

  const fetchJob = async () => {
    try {
      setLoading(true);
      const { data }: any = await axios.get(
        `http://localhost:8081/api/v1/caregivers/jobs/applied-job/${user.customData.userID}`
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
      </div>
    </div>
  );
}

export default AppliedJobs;
