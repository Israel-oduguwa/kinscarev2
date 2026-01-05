"use client";
import { useRouter, useParams, usePathname } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import axios from "axios";
// import { useAuthContext } from "@/context/AuthContext";
import CreateJobUI from "./CreateJobUI";
import JobPostFormSkeleton from "./JobPostFormSkeleton";

const JobUpdatePageNoAuth = ({type}:any) => {
  const router = useRouter();
  const { id }: any = useParams();
  // const path = usePathname()
  // console.log(path)
  const [currentJobID, setCurrentJobID] = useState<string | null>(null); // Track current job ID
  const [job, setJob] = useState<any>(null); // Store the job data
  const [loading, setLoading] = useState<boolean>(true); // Unified loading state
  // const authData: any = useAuthContext()
  // const { user, userData } = mongo;

  // Function to create a draft job and update URL with the new job ID
  const createDraftJob = async () => {
    // if (!user) return null;

    try {
      const payload = { userID: "", draft: true };
      const response = await axios.post(
        "http://localhost:8081/api/v1/providers/post-job",
        payload
      );
      const jobID = response.data.id;
      setCurrentJobID(jobID); // Set new job ID
      const currentUrl = window.location.href; // Full URL

      // Check if the URL contains "crowd-post"
      if (currentUrl.includes('crowd-post')) {
        // Append to the URL for "crowd-post"
        router.replace(`/provider/crowd-post/update/${jobID}`);
      } else {
        // Handle other cases (e.g., "provider/job/update")
        router.replace(`/provider/job/update/${jobID}`); // Replace URL with new job ID
      }

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
        `http://localhost:8081/api/v1/caregivers/job/${jobID}`
      );
      setJob(response.data.job); // Set job data
    } catch (err: any) {
      console.error("Error fetching job data:", err);
      // If job data is not found, create a new draft job
      if (err?.response?.data?.success === false) {
        const newJobID = await createDraftJob();
        if (newJobID) {
          setJob(null); // Clear invalid job data
        }
      }
    }
  };

  // Effect to handle job initialization
  useEffect(() => {
    const initializeJob = async () => {
      setLoading(true); // Start loading
      
      if (id === "new") {
        // Create a new draft job if the ID is "new"
        const newJobID = await createDraftJob();
        setCurrentJobID(newJobID); // Set currentJobID after draft creation
      } else {
        // Otherwise, fetch the existing job data
        setCurrentJobID(id as string); // Set current job ID
        await getJobData(id); // Fetch the job data for this ID
      }

      setLoading(false); // Stop loading when everything is ready
    };
      initializeJob();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Unified loading check - only render UI when loading is done and we have a valid job ID
  if (loading || !currentJobID) {
    return <JobPostFormSkeleton/>;
  }

  // If no job is available after loading, show a message or fallback UI
  if (!job && !loading) {
    return <p>No job data available. Create a new job draft.</p>;
  }

  // Render the job update page with all data
  return (
    <div>
      <CreateJobUI
        user={null} //user
        type={type}
        userData={null} //userData
        jobID={currentJobID}
        job={job} // Pass the fetched job data
        loading={loading} // Pass loading state
      />
    </div>
  );
};

export default JobUpdatePageNoAuth;
