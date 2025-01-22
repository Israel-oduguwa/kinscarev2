"use client";
import { useRouter, useParams, usePathname } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import MongoContext from "@/app/MongoContext";
import CrowdPostUI from "./CrowdPostUI";
import CrowdPostFormSkeleton from "./CrowdPostFormSkeleton";

const CrowdPostPage = ({type}:any) => {
  const router = useRouter();
  const { id }: any = useParams();
  // const path = usePathname()
  // console.log(path)
  const [currentJobID, setCurrentJobID] = useState<string | null>(null); // Track current job ID
  const [job, setJob] = useState<any>(null); // Store the job data
  const [loading, setLoading] = useState<boolean>(false); // Unified loading state
  const mongo: any = useContext(MongoContext);
  const { user, userData } = mongo;

  // Function to create a draft job and update URL with the new job ID
  const createDraftJob = async () => {
    if (!user) return null;

    try {
      const payload = { userID: user.customData.userID, draft: true };
      const response = await axios.post(
        "https://api.kinscare.org/api/v1/providers/crowd-post",
        payload
      );
      console.log(`response== ${JSON.stringify(response)}`)
      const jobID = response.data.id;
      setCurrentJobID(jobID); // Set new job ID

      return jobID;
    } catch (error) {
      console.error("Error creating draft job:", error);
      return null;
    }
  };

  // Function to fetch job data based on job ID
  const getJobData = async (jobID: string) => {
    try {
      const response = await axios.get(
        `https://api.kinscare.org/api/v1/providers/crowd-post/${jobID}`
      );
      setJob(response.data.job); // Set job data
    } catch (err: any) {
      console.error("Error fetching job data:", err);
      // If job data is not found, create a new draft job
      // if (err?.response?.data?.success === false && user) {
      //   const newJobID = await createDraftJob();
      //   if (newJobID) {
      //     setJob(null); // Clear invalid job data
      //   }
      // }
    }
  };

  // Effect to handle job initialization
  // useEffect(() => {
  //   const initializeJob = async () => {
  //     setLoading(true); // Start loading
  //       const newJobID = await createDraftJob();
  //       setCurrentJobID(newJobID); // Set currentJobID after draft creation
  //   };

  //     initializeJob();
  // }, [1]);

  // useEffect(()=>{

  //   // setCurrentJobID(id as string); // Set current job ID
  //     getJobData(currentJobID); // Fetch the job data for this ID
  //     setLoading(false); // Stop loading when everything is ready
  // },[currentJobID])

  // Unified loading check - only render UI when loading is done and we have a valid job ID
  // if (loading) {
  //   return <CrowdPostFormSkeleton/>;
  // }

  // // If no job is available after loading, show a message or fallback UI
  // if (!job && !loading) {
  //   return <p>No job data available. Create a new job draft.</p>;
  // }

  // Render the job update page with all data
  return (
    <div>
      <CrowdPostUI
        user={user}
        type={type}
        userData={userData}
        jobID={currentJobID}
        job={job} // Pass the fetched job data
        loading={loading} // Pass loading state
      />
    </div>
  );
};

export default CrowdPostPage;
