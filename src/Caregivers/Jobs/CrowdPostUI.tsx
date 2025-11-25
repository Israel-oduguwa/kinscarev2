"use client";

// Import necessary dependencies for React, Next.js, Axios, form handling, validation, and UI components
import React, { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import { toast } from "@/components/ui/use-toast";
import { Gift, LoaderCircle } from "lucide-react";
import { Controller, useForm, Resolver } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import Editor from "@/components/Editor";
import MultiSelectField from "@/components/MultiSelect";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { trackEvent } from "@/lib/mixpanelUtils";
import { useApiClient } from "@/hooks/useApiClient";
import { useAuthContext } from "@/context/AuthContext";

// Hard-coded API URL for posting jobs (to be moved to environment variables for production)
const CROWDPOST_URL = "/api/v1/providers/crowd-post";

// Define available license options for the job form
const groupLicenses = [
  { label: "CNA", value: "CNA or NAC" },
  { label: "HCA", value: "HCA" },
  { label: "NAR", value: "NAR" },
  { label: "Companion", value: "None" },
];

// Define available schedule options for the job form
const groupSchedule = [
  { label: "Full time", value: "Full time" },
  { label: "Part time", value: "Part time" },
  { label: "Weekend", value: "Weekends" },
  { label: "On Call", value: "on Call" },
  { label: "Live In", value: "Live In" },
];

// Define props interface for the CrowdPostUI component
interface CrowdPostProps {
  jobID?: string; // Optional job ID for reposting or editing
  type: "new" | "repost"; // Indicates if this is a new post or a repost

  
  job?: {
    _id: string; // Job ID
    title?: string; // Job title
    employer_name?: string; // Employer name
    licenses?: string[]; // Required licenses
    schedule?: string[]; // Schedule preferences
    location?: string; // Job location
    contact_name?: string; // Contact name for the job
    email?: string; // Contact email
    phone_number?: string; // Contact phone number
    mobility?: string; // Mobility requirement
    compensation?: string; // Compensation details
    description?: string; // Job description
  };
}

// Define form values interface to match the form schema
interface FormValues {
  title: string;
  employer_name?: string | undefined; // Explicitly allow undefined to match schema
  licenses: string[];
  schedule: string[];
  location: string;
  contact_name?: string | undefined; // Explicitly allow undefined
  email: string;
  phone_number: string;
  mobility: "car_needed" | "no_car_needed";
  compensation?: string | undefined; // Explicitly allow undefined
  description: string;
}

// Define Yup validation schema for the form
const formSchema:any = Yup.object<FormValues>({
  title: Yup.string().required("Please enter the title of your job"),
  employer_name: Yup.string()
    .max(50, "Employer name must be at most 50 characters")
    .optional()
    .defined(), // Explicitly allow undefined
  licenses: Yup.array()
    .of(Yup.string().oneOf(groupLicenses.map((g) => g.value)))
    .min(1, "Select at least 1 license")
    .required(),
  schedule: Yup.array()
    .of(Yup.string().oneOf(groupSchedule.map((g) => g.value)))
    .min(1, "Select at least 1 schedule option")
    .required(),
  location: Yup.string().required("Please enter the job location"),
  contact_name: Yup.string()
    .optional()
    .defined(), // Explicitly allow undefined
  email: Yup.string()
    .email("Enter a valid email address")
    .required("Email is required"),
  phone_number: Yup.string().required("Phone number is required"),
  mobility: Yup.string()
    .oneOf(["car_needed", "no_car_needed"], "Please select mobility")
    .required("Please select if a caregiver needs to drive") as Yup.StringSchema<"car_needed" | "no_car_needed">,
  compensation: Yup.string()
    .optional()
    .defined(), // Explicitly allow undefined
  description: Yup.string().required("Please enter job description"),
});

// Explicitly type the resolver to match FormValues
const resolver: Resolver<FormValues> = yupResolver(formSchema);


// Main component for the job posting UI
const CrowdPostUI: React.FC<CrowdPostProps> = ({
  jobID,
  job,
  type,
}) => {
  // Initialize router for navigation
  const router = useRouter();
  const {userData, contactData} = useAuthContext();
  const {privateApi} = useApiClient()
  // State to manage loading status during form submission
  const [isLoading, setIsLoading] = useState(false);
  // State to manage editor content for the job description
  const [editorContent, setEditorContent] = useState<string>(
    job?.description || ""
  );

  // API function to post job data
const postJobApi = async (payload: any) => {
  const response = await privateApi.post(CROWDPOST_URL, payload);
  return response.data;
};


  // Initialize react-hook-form with resolver and default values from job prop
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver,
    defaultValues: {
      title: job?.title || "",
      employer_name: job?.employer_name,
      licenses: job?.licenses || [],
      schedule: job?.schedule || [],
      location: job?.location || "",
      contact_name: job?.contact_name,
      email: job?.email || "",
      phone_number: job?.phone_number || "",
      mobility:
        (job?.mobility as "car_needed" | "no_car_needed") || "car_needed",
      compensation: job?.compensation,
      description: job?.description || "",
    },
  });

  // Watch form values for real-time updates
  const watchedValues = watch();

  // Handle form submission
  const onSubmit = useCallback(
    async (data: FormValues) => {
      setIsLoading(true);

      // Prepare common payload for API request
      const commonPayload = {
        ...data,
        description: editorContent,
        userID: contactData.userID,
        hash: contactData.hash,
        profileImage: userData.profileImage,
      };

      try {
        if (type === "repost") {
          // Handle repost scenario
          const payload = { ...commonPayload, draft: false };
          const result = await postJobApi(payload);
          toast({
            title: "Crowd Post re-posted successfully",
            variant: "default",
          });
          router.push(`/provider/crowd-post/${result.jobData._id}`);
        } else {
          // Handle new job post scenario
          const payload = { ...commonPayload, _id: jobID, draft: false };
          const result = await postJobApi(payload);

          // Track event with Mixpanel
          const mixpanelPayload = {
            name: "Crowd Post",
            user_id: userData.userID,
            authenticated: true,
            date: new Date(),
            referee_employee: true,
            step: "post job",
          };
          trackEvent(contactData.hash, "Crowd Post", mixpanelPayload);

          toast({
            title: "Crowd Post job created successfully",
            variant: "default",
          });
          router.push(`/vitae/crowd-post/${result.jobData._id}`);
        }
      } catch (err) {
        // Handle errors during API call
        let message = "An unexpected error occurred";
        if (axios.isAxiosError(err)) {
          const data = err.response?.data as any;
          message =
            typeof data?.message === "string"
              ? data.message
              : JSON.stringify(data) || err.message;
        }

        toast({
          title: "Error posting job",
          description: message,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [editorContent, jobID, router, type, contactData, userData]
  );

  // Handle changes in the editor content
  const handleEditorChange = useCallback(
    (content: string) => {
      setEditorContent(content);
      setValue("description", content, {
        shouldValidate: true,
        shouldDirty: true,
      });
    },
    [setValue]
  );

  // Handle changes in form fields
  const handleFieldChange = useCallback(
    (fieldName: keyof FormValues, value: any) => {
      setValue(fieldName, value, { shouldValidate: true, shouldDirty: true });
    },
    [setValue]
  );

  // Render the UI
  return (
    <div className="py-6">
      <div >
        <div className="py-8 mx-6 px-4 md:px-10 rounded-xl shadow-lg bg-white">
          <div>
            {/* Header section */}
            <div className="mb-7">
              <h2 className="font-bold text-xl gap-4 flex items-center text-slate-800">
                <span className="inline-flex items-center justify-center bg-blue-100 rounded-full h-12 w-12 shadow">
                  <Gift className="h-7 w-7 text-blue-600" />
                </span>
                Refer & Earn with Kinscare
              </h2>
              <p className="text-base mt-5 text-slate-700">
                Share a job opportunity below—when the provider signs up and
                hires through your referral, you can earn up to{" "}
                <span className="font-semibold text-violet-700">$55</span> in
                rewards, while they get a 7-day free trial to connect with
                quality caregivers.
              </p>
            </div>

            {/* Form for job posting */}
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="flex flex-col space-y-6">
                <div className="flex flex-col space-y-3">
                  {/* Position Title Input */}
                  <div className="mb-0">
                    <label
                      htmlFor="title"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Title of the job posting
                    </label>
                    <input
                      type="text"
                      id="title"
                      className="bg-gray-50 border border-gray-300 focus-visible:outline-blue-500 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      {...register("title")}
                      onBlur={(e) => handleFieldChange("title", e.target.value)}
                    />
                    {errors.title && (
                      <p className="text-sm text-red-500">
                        {errors.title.message}
                      </p>
                    )}
                  </div>

                  {/* Employer Name Input */}
                  <div className="mb-0">
                    <label
                      htmlFor="employer_name"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Employer Name
                    </label>
                    <input
                      type="text"
                      id="employer_name"
                      className="bg-gray-50 border border-gray-300 focus-visible:outline-blue-500 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      {...register("employer_name")}
                      onBlur={(e) =>
                        handleFieldChange("employer_name", e.target.value)
                      }
                    />
                    {errors.employer_name && (
                      <p className="text-sm text-red-500">
                        {errors.employer_name.message}
                      </p>
                    )}
                  </div>

                  {/* Licenses and Schedule Multi-Select Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold text-sm text-gray-900 antialiased mb-2">
                        Select Licenses
                      </h3>
                      <MultiSelectField
                        name="licenses"
                        control={control}
                        isAnimation={true}
                        options={groupLicenses}
                        placeholder="Select licenses"
                        maxCount={4}
                        rules={{ required: true }}
                      />
                      {errors.licenses && (
                        <p className="text-red-500 text-sm">
                          {errors.licenses.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-gray-900 antialiased mb-2">
                        Select Your Schedule
                      </h3>
                      <MultiSelectField
                        name="schedule"
                        control={control}
                        isAnimation={true}
                        options={groupSchedule}
                        placeholder="Select your schedule you want for the job"
                        maxCount={4}
                        rules={{ required: true }}
                      />
                      {errors.schedule && (
                        <p className="text-red-500 text-sm">
                          {errors.schedule.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Job Description Editor */}
                  <div className="w-full prose-lg prose-h3:my-2 prose-blockquote:my-2 discussion-content max-w-[100%]">
                    <p className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                      Please enter job description
                    </p>
                    <Editor
                      onChange={handleEditorChange}
                      initialContent={editorContent}
                      usage="posst" // Note: Possible typo, should it be "post"?
                    />
                    {errors.description && (
                      <p className="text-red-500 text-sm">
                        {errors.description.message}
                      </p>
                    )}
                  </div>

                  {/* Location Input */}
                  <div className="mb-0">
                    <label
                      htmlFor="location"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Location (City/State)
                    </label>
                    <input
                      type="text"
                      id="location"
                      className="bg-gray-50 border border-gray-300 focus-visible:outline-blue-500 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      {...register("location")}
                      onBlur={(e) =>
                        handleFieldChange("location", e.target.value)
                      }
                    />
                    {errors.location && (
                      <p className="text-sm text-red-500">
                        {errors.location.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col space-y-3">
                  {/* Contact Name and Phone Number Inputs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="mb-0">
                      <label
                        htmlFor="contact_name"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Contact Name (Optional)
                      </label>
                      <input
                        type="text"
                        id="contact_name"
                        className="bg-gray-50 border border-gray-300 focus-visible:outline-blue-500 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        {...register("contact_name")}
                        onBlur={(e) =>
                          handleFieldChange("contact_name", e.target.value)
                        }
                      />
                      {errors.contact_name && (
                        <p className="text-sm text-red-500">
                          {errors.contact_name.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="phone_number"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Phone Number
                      </label>
                      <input
                        type="text"
                        id="phone_number"
                        className="bg-gray-50 border border-gray-300 focus-visible:outline-blue-500 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        {...register("phone_number")}
                        onBlur={(e) =>
                          handleFieldChange("phone_number", e.target.value)
                        }
                      />
                      {errors.phone_number && (
                        <p className="text-red-500 text-sm">
                          {errors.phone_number.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Email and Mobility Inputs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="email"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        className="bg-gray-50 border border-gray-300 focus-visible:outline-blue-500 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        {...register("email")}
                        onBlur={(e) =>
                          handleFieldChange("email", e.target.value)
                        }
                      />
                      {errors.email && (
                        <p className="text-red-500 text-sm">
                          {errors.email.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm mb-2 pt-5">
                        Do you work at this employer?
                      </h3>
                      <Controller
                        name="mobility"
                        control={control}
                        render={({ field }) => (
                          <RadioGroup
                            value={field.value}
                            onValueChange={(val) => field.onChange(val)}
                            className="flex gap-4"
                          >
                            <div className="flex gap-1 items-center">
                              <RadioGroupItem
                                value="car_needed"
                                className="border-gray-600"
                              />
                              <Label>Yes</Label>
                            </div>
                            <div className="flex gap-1 items-center">
                              <RadioGroupItem
                                value="no_car_needed"
                                className="border-gray-600"
                              />
                              <Label>No</Label>
                            </div>
                          </RadioGroup>
                        )}
                      />
                      {errors.mobility && (
                        <p className="text-red-500 text-sm">
                          {errors.mobility.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Compensation Input */}
                  <div className="w-full">
                    <label
                      htmlFor="compensation"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Salary/Compensation (Optional)
                    </label>
                    <input
                      type="text"
                      id="compensation"
                      className="bg-gray-50 border border-gray-300 focus-visible:outline-blue-500 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      {...register("compensation")}
                      onBlur={(e) =>
                        handleFieldChange("compensation", e.target.value)
                      }
                    />
                    {errors.compensation && (
                      <p className="text-red-500">
                        {errors.compensation.message}
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="w-full">
                    <Button
                      type="submit"
                      disabled={isLoading || isSubmitting}
                      className="w-full flex justify-center gap-2"
                    >
                      {(isLoading || isSubmitting) && (
                        <LoaderCircle className="animate-spin" />
                      )}
                      {isLoading || isSubmitting
                        ? "Posting..."
                        : type === "repost"
                        ? "Repost Job"
                        : "Post Job"}
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrowdPostUI;