"use client";
import React, { useContext, useEffect, useState } from "react";
import MongoContext from "@/app/MongoContext";
import AutosuggestMultiSelect from "@/components/multi-select-auto-suggest";
import { useCareer } from "../CaregiverContext/CareerContext";
import { Skeleton } from "@/components/ui/skeleton";
import { X, CheckCircle, AlertCircle } from "lucide-react";
import axios from "axios";
import { toast } from "@/components/ui/use-toast";
import { fetchUserData } from "@/lib/utils";
import { useDialog } from "../CaregiverContext/DialogProvider";
import TagManager from "react-gtm-module";

// Helper functions
const handleFetchLicenses = async (query: string) => {
  return new Promise<string[]>((resolve) => {
    setTimeout(() => {
      resolve(
        ["CNA", "HCA", "NA"].filter((item) =>
          item.toLowerCase().includes(query.toLowerCase())
        )
      );
    }, 500);
  });
};

const calculatePoints = (
  licenses: string[],
  prerequisites: string[],
  requirements: string[]
) => {
  let totalPoints = 0;
  if (licenses.length > 0) totalPoints += 15;
  if (prerequisites.length > 0) totalPoints += 35;
  if (requirements.length > 0) totalPoints += 15;
  return totalPoints;
};

export default function AddCoursePlan() {
  const { userData, setUserData }: any = useContext(MongoContext);
  const { closeDialog } = useDialog();
  const [licenses, setLicenses] = useState<string[]>([]);
  const [prerequisites, setPrerequisites] = useState<string[]>([]);
  const [requirements, setRequirements] = useState<string[]>([]);
  const [points, setPoints] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    success?: boolean;
    message?: string;
  }>({});

  useEffect(() => {
    if (userData) {
      setLicenses(userData.careerProfile?.coursePlan?.licenses || []);
      setPrerequisites(userData.careerProfile?.coursePlan?.prerequisite || []);
      setRequirements(userData.careerProfile?.coursePlan?.requirement || []);
      setPoints(userData.careerProfile?.coursePlan?.points || 0);
    }
  }, [userData]);

  const updateDatabase = async (plan: any) => {
    setIsLoading(true);
    setFeedback({});
    try {
      await axios.post("https://jrp7pe2xhj.us-east-1.awsapprunner.com/api/v1/auth/crud-operation", {
        collectionName: "users",
        operation: "updateOne",
        filter: { userID: userData.userID },
        update: { $set: plan },
        options: { upsert: true },
      });
      // setFeedback({ success: true, message: "Updated successfully!" });
      toast({
        title: "Updated successfully!",
        description: "Your course plan has been successfully saved.",
      });
      const fetchedData: any = await fetchUserData(
        userData.userID,
        userData.email
      );
      // console.log(fetchedData);
      setUserData(fetchedData.result);
    } catch (error) {
      console.error(error);

      setFeedback({
        success: false,
        message: "Failed to update. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddLicense = (values: string[]) => {
    setLicenses(values);
    const updatedPoints = calculatePoints(values, prerequisites, requirements);
    setPoints(updatedPoints);
    const tagManagerArgs = {
      dataLayer: {
        event: `create_course_plan`,
        step:"add_licences",
        settings: userData?.settings,
        lname: userData?.lname,
        fname: userData?.fname,
        email: userData?.auth?.email,
      },
    };
    TagManager.dataLayer(tagManagerArgs);
    updateDatabase({
      "careerProfile.coursePlan.licenses": values,
      "careerProfile.coursePlan.points": updatedPoints,
    });
  };

  const handleAddPrerequisite = (values: string[]) => {
    setPrerequisites(values);
    const updatedPoints = calculatePoints(licenses, values, requirements);
    setPoints(updatedPoints);
    const tagManagerArgs = {
      dataLayer: {
        event: `create_course_plan`,
        step:"add_course_prerequisites",
        settings: userData?.settings,
        lname: userData?.lname,
        fname: userData?.fname,
        email: userData?.auth?.email,
      },
    };
    TagManager.dataLayer(tagManagerArgs);
    updateDatabase({
      "careerProfile.coursePlan.prerequisite": values,
      "careerProfile.coursePlan.points": updatedPoints,
    });
  };

  const handleAddRequirement = (values: string[]) => {
    setRequirements(values);
    const updatedPoints = calculatePoints(licenses, prerequisites, values);
    setPoints(updatedPoints);
    const tagManagerArgs = {
      dataLayer: {
        event: `create_course_plan`,
        step:"add_course_requirements",
        settings: userData?.settings,
        lname: userData?.lname,
        fname: userData?.fname,
        email: userData?.auth?.email,
      },
    };
    TagManager.dataLayer(tagManagerArgs);
    updateDatabase({
      "careerProfile.coursePlan.requirement": values,
      "careerProfile.coursePlan.points": updatedPoints,
    });
  };

  return (
    <div className=" flex items-center justify-center ">
      <div className=" w-full p-6 md:p-8 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">
            Create Course Plan
          </h2>
          <button
            onClick={closeDialog}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Feedback */}
        {/* {feedback.message && (
          <div
            className={`p-2 rounded-md text-sm ${
              feedback.success
                ? "text-green-600 bg-green-100"
                : "text-red-600 bg-red-100"
            } flex items-center space-x-2`}
          >
            {feedback.success ? (
              <CheckCircle size={16} />
            ) : (
              <AlertCircle size={16} />
            )}
            <span>{feedback.message}</span>
          </div>
        )} */}

        {/* Licenses */}
        <div>
          <h3 className="font-semibold text-sm text-gray-800 mb-2">
            Add Licenses
          </h3>
          <AutosuggestMultiSelect
            placeholder="Add License"
            options={["CNA", "HCA", "NA", "None"]}
            initialValues={licenses}
            fetchOptions={handleFetchLicenses}
            onSelectionChange={handleAddLicense}
          />
        </div>

        {/* Prerequisites */}
        <div>
          <h3 className="font-semibold text-sm text-gray-800 mb-2">
            Add Course Prerequisites
          </h3>
          <AutosuggestMultiSelect
            placeholder="Add Prerequisites"
            options={["Nursing", "Medicine", "None"]}
            initialValues={prerequisites}
            fetchOptions={handleFetchLicenses}
            onSelectionChange={handleAddPrerequisite}
          />
        </div>

        {/* Requirements */}
        <div>
          <h3 className="font-semibold text-sm text-gray-800 mb-2">
            Add Requirements
          </h3>
          <AutosuggestMultiSelect
            placeholder="Add Requirements"
            options={["ELSA exam", "EXAM"]}
            initialValues={requirements}
            fetchOptions={handleFetchLicenses}
            onSelectionChange={handleAddRequirement}
          />
        </div>

        {/* Points Display */}
        <div className="flex justify-end items-center space-x-2">
          {isLoading ? (
            <div className="text-sm text-gray-500">Updating...</div>
          ) : (
            <div className="text-sm font-medium text-gray-800">
              Total Points: <span className="font-bold">{points}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
