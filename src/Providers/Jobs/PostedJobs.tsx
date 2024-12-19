"use client";
import { useState, useEffect, useContext } from "react";
import MongoContext from "@/app/MongoContext";
import axios from "axios";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Interweave } from "interweave";
import Link from "next/link";
import { toast } from "@/components/ui/use-toast";
import ProfileImage from "../User/ProfileImage";
import JobSkeleton from "./JobSkelenton";

interface Job {
  _id: string;
  title: string;
  contacts: {
    address: string;
    city: string;
    zipcode: string;
  };
  certifications: string;
  licenses: string[];
  schedule: string[];
  minHours: number;
  compensation: string;
  draft: boolean;
}

const JobPostCard: React.FC<{ job: Job }> = ({ job }) => (
  <div className="bg-white shadow-md rounded-lg p-6 my-4 w-full mx-auto">
    <Link href={`/provider/job/${job._id}`}>
      <div className="flex space-x-2 items-center mb-3">
        <ProfileImage className="w-12 h-12 rounded-none" />
        <div>
          <h2 className="text-lg font-semibold text-gray-800">{job.title}</h2>
          <p className="text-sm text-gray-600">
            {job.contacts.address}, {job.contacts.city}, {job.contacts.zipcode}
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
  </div>
);

function PostedJobs() {
  const mongo: any = useContext(MongoContext);
  const { user } = mongo;
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `https://api.kinscare.org/api/v1/providers/posted-jobs/${user?.customData?.hash}`
        );
        setJobs(response.data.jobs);
        console.log(response.data.jobs);
        setError(null);
      } catch (error: any) {
        // toast({
        //     title: "Error",
        //     description: "Failed to fetch jobs.",
        //     variant: "destructive",
        //   });
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [user]);

  const postedJobs = jobs.filter((job) => !job.draft);
  const draftJobs = jobs.filter((job) => job.draft);

  return (
    <div className="py-6  px-4 bg-gray-100 min-h-[100vh]">
      {loading && (
        <div className="max-w-6xl mx-auto p-6">
          <div className="grid grid-cols-1">
            {Array.from({ length: 6 }).map((_, idx) => (
              <JobSkeleton key={idx}/>
            ))}
          </div>
        </div>
      )}
      {error && <p className="text-center text-red-500">{error}</p>}
      {!loading && !error && (
        <Tabs defaultValue="job-posts" className=" p-6 max-w-6xl mx-auto">
          <div className="mb-4">
            <TabsList>
              <TabsTrigger value="job-posts">Job Posts</TabsTrigger>
              <TabsTrigger value="draft-posts">Drafts</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="job-posts">
            <h2 className="font-semibold mb-4">Your job posts</h2>
            {postedJobs.length === 0 ? (
              <p className="text-center text-gray-500">
                No job posts available.
              </p>
            ) : (
              postedJobs.map((job) => <JobPostCard key={job._id} job={job} />)
            )}
          </TabsContent>

          <TabsContent value="draft-posts">
            <h2 className="font-semibold mb-4">Drafts</h2>
            {draftJobs.length === 0 ? (
              <p className="text-center text-gray-500">No drafts available.</p>
            ) : (
              draftJobs.map((job) => <JobPostCard key={job._id} job={job} />)
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

export default PostedJobs;
