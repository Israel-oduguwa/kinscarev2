"use client";
import React, { useContext, useEffect, useState } from "react";
import { useAuthContext } from "@/context/AuthContext";
import AutosuggestMultiSelect from "@/components/multi-select-auto-suggest";
import { useCareer } from "../CaregiverContext/CareerContext";
import { Skeleton } from "@/components/ui/skeleton";
import { X, CheckCircle, AlertCircle, ShieldCheck, Layers, ClipboardCheck, Gauge } from "lucide-react";
import { useApiClient } from "@/hooks/useApiClient";
import { toast } from "@/components/ui/use-toast";
import { fetchUserData } from "@/lib/utils";
import { useDialog } from "../CaregiverContext/DialogProvider";
import TagManager from "react-gtm-module";

// Helper functions (unchanged)
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
  const { userData, setUserData }: any = useAuthContext();
  const { closeDialog } = useDialog();

  const [licenses, setLicenses] = useState<string[]>([]);
  const [prerequisites, setPrerequisites] = useState<string[]>([]);
  const [requirements, setRequirements] = useState<string[]>([]);
  const [points, setPoints] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ success?: boolean; message?: string }>({});
  const {privateApi} = useApiClient();
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
      await privateApi.post(
        "/api/v1/auth/crud-operation",
        {
          collectionName: "users",
          operation: "updateOne",
          filter: { userID: userData.userID },
          update: { $set: plan },
          options: { upsert: true },
        }
      );

      toast({
        title: "Updated successfully!",
        description: "Your course plan has been successfully saved.",
      });

      const fetchedData: any = await fetchUserData(userData.userID, userData.email);
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
        step: "add_licenses",
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
        step: "add_course_prerequisites",
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
        step: "add_course_requirements",
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

  // ------- UI only from here: no new logic added -------
  const progressWidth = (points/65 *100)

  return (
    <div className="flex items-center justify-center">
      <div className="w-full max-w-3xl p-0 md:p-2">
        {/* Shell Card: make it a column with internal scroll */}
        <div className="relative flex max-h-[85vh] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          {/* Gradient header (no overlap) */}
          <div className="relative shrink-0 h-24 bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-700">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(700px_200px_at_0%_-10%,white,transparent)]" />
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(700px_200px_at_100%_120%,white,transparent)]" />
            <div className="flex h-full items-center justify-between px-6">
              <div>
                <h2 className="text-lg md:text-xl font-semibold text-white tracking-tight">
                  Create Course Plan
                </h2>
                <p className="mt-0.5 text-xs md:text-[13px] text-indigo-100">
                  Licenses, prerequisites, and requirements for your path.
                </p>
              </div>
              <button
                onClick={closeDialog}
                className="group rounded-full p-2 z-50 text-white/90 hover:text-white hover:bg-white/10 transition"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Scrollable body (no negative margins) */}
          <div className="flex-1 overflow-y-auto px-6 pb-6 pt-5">
            {/* Points card (normal flow) */}
            <div className="mx-auto mb-6 w-full rounded-2xl border border-indigo-100 bg-white p-4 shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                    <Gauge className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Progress</p>
                    <p className="text-sm font-medium text-gray-900">
                      Total Points
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  {isLoading ? (
                    <div className="inline-flex items-center gap-2 text-xs text-gray-500">
                      <span className="h-3 w-3 animate-spin rounded-full border-[2px] border-gray-300 border-t-transparent" />
                      Updating…
                    </div>
                  ) : (
                    <div className="text-lg font-semibold text-gray-900">
                      {points}
                    </div>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className={[
                    "h-full rounded-full transition-all duration-500",
                    points >= 50 ? "bg-indigo-500" : "bg-indigo-400",
                  ].join(" ")}
                  style={{ width: `${progressWidth}%` }}
                />
              </div>
              <p className="mt-2 text-[11px] text-gray-500">
                Points update automatically as you add items below.
              </p>
            </div>

            {/* Grid Sections */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* Licenses */}
              <section className="rounded-2xl border border-gray-100 bg-white p-4 md:p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Add Licenses</h3>
                    <p className="text-xs text-gray-500">
                      Select certifications you currently have or plan to obtain.
                    </p>
                  </div>
                </div>

                <AutosuggestMultiSelect
                  placeholder="Add License"
                  options={["CNA", "HCA", "NA", "None"]}
                  initialValues={licenses}
                  fetchOptions={handleFetchLicenses}
                  onSelectionChange={handleAddLicense}
                />

                {/* Helper line */}
                <p className="mt-2 text-[11px] text-gray-500">
                  Examples: <span className="text-gray-700">CNA</span>,{" "}
                  <span className="text-gray-700">HCA</span>, or{" "}
                  <span className="text-gray-700">None</span> if not applicable.
                </p>
              </section>

              {/* Prerequisites */}
              <section className="rounded-2xl border border-gray-100 bg-white p-4 md:p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                    <Layers className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Add Course Prerequisites</h3>
                    <p className="text-xs text-gray-500">
                      Foundation subjects or background required for your program.
                    </p>
                  </div>
                </div>

                <AutosuggestMultiSelect
                  placeholder="Add Prerequisites"
                  options={["Nursing", "Medicine", "None"]}
                  initialValues={prerequisites}
                  fetchOptions={handleFetchLicenses}
                  onSelectionChange={handleAddPrerequisite}
                />

                <p className="mt-2 text-[11px] text-gray-500">
                  Tip: If no prerequisite applies, choose{" "}
                  <span className="text-gray-700">None</span>.
                </p>
              </section>

              {/* Requirements */}
              <section className="md:col-span-2 rounded-2xl border border-gray-100 bg-white p-4 md:p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                    <ClipboardCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Add Requirements</h3>
                    <p className="text-xs text-gray-500">
                      Exams or other mandatory checks you’ll need to complete.
                    </p>
                  </div>
                </div>

                <AutosuggestMultiSelect
                  placeholder="Add Requirements"
                  options={["ELSA exam", "EXAM"]}
                  initialValues={requirements}
                  fetchOptions={handleFetchLicenses}
                  onSelectionChange={handleAddRequirement}
                />

                <p className="mt-2 text-[11px] text-gray-500">
                  Example: <span className="text-gray-700">EXAM</span> for licensing.
                </p>
              </section>
            </div>

            {/* Footer note */}
            <div className="mt-6 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-xs text-gray-600">
              Your selections are saved automatically. You can update them anytime.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
