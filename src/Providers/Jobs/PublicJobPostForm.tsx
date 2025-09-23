"use client";
import React, { useState, useRef, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import axios from "axios";
import { toast } from "@/components/ui/use-toast";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import MultiSelectField from "@/components/MultiSelect";
import Editor from "@/components/Editor";

import TagManager from "react-gtm-module";
import SignupDialog from "@/Authentication/SignupDialog";
import { useRouter } from "next/navigation";
import { trackEvents } from "@/lib/utils";

// Job form validation schema
const jobSchema = Yup.object().shape({
  title: Yup.string().required("Please enter the title of your job"),
  minHours: Yup.number()
    .max(50, "Working hours must not be greater than 50 hrs.")
    .typeError("Please enter a valid number"),
  contacts: Yup.object().shape({
    address: Yup.string().required("Please enter the job location address"),
    city: Yup.string().required("Please enter the city"),
    email: Yup.string()
      .email("Please enter a valid email")
      .required("Please enter a contact email"),
    tel: Yup.string().required("Please enter a contact telephone number"),
    zipcode: Yup.string().required("Please enter the zipcode"),
  }),
  licenses: Yup.array()
    .min(1, "Select at least 1 license. If none, select 'None'")
    .required(),
  schedule: Yup.array().min(1, "Select at least 1 schedule slot").required(),
  mobility: Yup.string().required("Please select if driving is required"),
  compensation: Yup.string().required("Enter compensation or 'Negotiable'"),
  description: Yup.string().required("Please enter a job description"),
});

const groupSchedule = [
  { label: "Full time", value: "Full time" },
  { label: "Part time", value: "Part time" },
  { label: "Weekend", value: "Weekends" },
  { label: "On Call", value: "on Call" },
  { label: "Live In", value: "Live In" },
];

const groupLicenses = [
  { label: "CNA", value: "CNA or NAC" },
  { label: "HCA", value: "HCA" },
  { label: "NAR", value: "NAR" },
  { label: "Companion", value: "None" },
];

const mobilityOptions = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
];

// PublicJobPostForm Component
const PublicJobPostForm = ({ onSubmit }: { onSubmit: (data: any) => void }) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    clearErrors,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(jobSchema),
    mode:"onTouched",
    reValidateMode: "onChange", // re-validate as they type
    defaultValues: {
      title: "",
      minHours: 0,
      contacts: { address: "", city: "", email: "", tel: "", zipcode: "" },
      licenses: [],
      schedule: [],
      mobility: "",
      compensation: "",
      description: "",
    },
  });

  // // Load form data from local storage on mount
  // useEffect(() => {
  //   try {
  //     const savedData = localStorage.getItem("publicJobPostData");
  //     if (savedData) {
  //       const parsedData = JSON.parse(savedData);
  //       Object.keys(parsedData).forEach((key: any) => {
  //         setValue(key, parsedData[key], { shouldValidate: true });
  //       });
  //     }
  //   } catch (error) {
  //     console.error("Error loading data from localStorage:", error);
  //   }
  // }, [setValue]);

  // // Save form data to local storage on change
  // useEffect(() => {
  //   const subscription = watch((value) => {
  //     try {
  //       localStorage.setItem("publicJobPostData", JSON.stringify(value));
  //       clearErrors()
  //     } catch (error) {
  //       console.error("Error saving data to localStorage:", error);
  //     }
  //   });
  //   return () => subscription.unsubscribe();
  // }, [watch, clearErrors]);

  // Clear errors when form values change
  useEffect(() => {
    const subscription = watch(() => {
      clearErrors();
    });
    return () => subscription.unsubscribe();
  }, [watch, clearErrors]);

  const submitHandler = (data: any) => {
    localStorage.removeItem("publicJobPostData");
    onSubmit(data);
  };

  const onEditorStateChange = (editorState: any) => {
    setValue("description", editorState);
  };

  return (
    <div className="py-8 px-4 md:px-8 rounded-2xl shadow-lg bg-white">
      <form onSubmit={handleSubmit(submitHandler)} className="space-y-8">
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <Label
                htmlFor="title"
                className="font-medium text-gray-700 mb-2 flex items-center"
              >
                Job Title <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="title"
                {...register("title")}
                className={`bg-white ${errors.title ? "border-red-500" : ""}`}
                placeholder="e.g., Senior Caregiver"
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-2 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />{" "}
                  {errors.title.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label className="font-medium text-gray-700 mb-2 flex items-center">
              Job Description <span className="text-red-500 ml-1">*</span>
            </Label>
            <div
              className={`rounded-lg border ${
                errors.description ? "border-red-500" : "border-gray-300"
              } p-2 bg-white`}
            >
              <Editor
                onChange={onEditorStateChange}
                initialContent=""
                usage="job_description"
              />
            </div>
            {errors.description && (
              <p className="text-red-500 text-sm mt-2 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />{" "}
                {errors.description.message}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-800 pb-2 border-b border-gray-200">
            Requirements
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="font-medium text-gray-700 mb-2 flex items-center">
                Required Licenses <span className="text-red-500 ml-1">*</span>
              </Label>
              <div
                className={`${
                  errors.licenses ? "border-red-500 rounded-lg border" : ""
                }`}
              >
                <MultiSelectField
                  name="licenses"
                  control={control}
                  isAnimation={true}
                  options={groupLicenses}
                  placeholder="Select licenses"
                  maxCount={4}
                  rules={{ required: true }}
                />
              </div>
              {errors.licenses && (
                <p className="text-red-500 text-sm mt-2 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />{" "}
                  {errors.licenses.message}
                </p>
              )}
            </div>

            <div>
              <Label className="font-medium text-gray-700 mb-2 flex items-center">
                Schedule <span className="text-red-500 ml-1">*</span>
              </Label>
              <div
                className={`${
                  errors.schedule ? "border-red-500 rounded-lg border" : ""
                }`}
              >
                <MultiSelectField
                  name="schedule"
                  control={control}
                  isAnimation={true}
                  options={groupSchedule}
                  placeholder="Select schedule options"
                  maxCount={4}
                  rules={{ required: true }}
                />
              </div>
              {errors.schedule && (
                <p className="text-red-500 text-sm mt-2 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />{" "}
                  {errors.schedule.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="font-medium text-gray-700 mb-2 flex items-center">
                Requires Driving? <span className="text-red-500 ml-1">*</span>
              </Label>
              <Controller
                name="mobility"
                control={control}
                render={({ field }) => (
                  <div
                    className={`rounded-lg border ${
                      errors.mobility ? "border-red-500" : "border-gray-300"
                    } p-3 bg-white`}
                  >
                    <select
                      {...field}
                      className="w-full bg-transparent focus:outline-none"
                    >
                      <option value="">Select an option</option>
                      {mobilityOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              />
              {errors.mobility && (
                <p className="text-red-500 text-sm mt-2 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />{" "}
                  {errors.mobility.message}
                </p>
              )}
            </div>

            <div>
              <Label
                htmlFor="compensation"
                className="font-medium text-gray-700 mb-2 flex items-center"
              >
                Compensation <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="compensation"
                {...register("compensation")}
                className={`bg-white ${
                  errors.compensation ? "border-red-500" : ""
                }`}
                placeholder="e.g., $20-25/hour"
              />
              {errors.compensation && (
                <p className="text-red-500 text-sm mt-2 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />{" "}
                  {errors.compensation.message}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-800 pb-2 border-b border-gray-200">
            Contact Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label
                htmlFor="address"
                className="font-medium text-gray-700 mb-2 flex items-center"
              >
                Street Address <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="address"
                {...register("contacts.address")}
                className={`bg-white ${
                  errors.contacts?.address ? "border-red-500" : ""
                }`}
                placeholder="123 Main St"
              />
              {errors.contacts?.address && (
                <p className="text-red-500 text-sm mt-2 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />{" "}
                  {errors.contacts.address.message}
                </p>
              )}
            </div>

            <div>
              <Label
                htmlFor="city"
                className="font-medium text-gray-700 mb-2 flex items-center"
              >
                City <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="city"
                {...register("contacts.city")}
                className={`bg-white ${
                  errors.contacts?.city ? "border-red-500" : ""
                }`}
                placeholder="e.g., Seattle"
              />
              {errors.contacts?.city && (
                <p className="text-red-500 text-sm mt-2 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />{" "}
                  {errors.contacts.city.message}
                </p>
              )}
            </div>

            <div>
              <Label
                htmlFor="zipcode"
                className="font-medium text-gray-700 mb-2 flex items-center"
              >
                Zipcode <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="zipcode"
                {...register("contacts.zipcode")}
                className={`bg-white ${
                  errors.contacts?.zipcode ? "border-red-500" : ""
                }`}
                placeholder="e.g., 98101"
              />
              {errors.contacts?.zipcode && (
                <p className="text-red-500 text-sm mt-2 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />{" "}
                  {errors.contacts.zipcode.message}
                </p>
              )}
            </div>

            <div>
              <Label
                htmlFor="email"
                className="font-medium text-gray-700 mb-2 flex items-center"
              >
                Email <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="email"
                {...register("contacts.email")}
                className={`bg-white ${
                  errors.contacts?.email ? "border-red-500" : ""
                }`}
                placeholder="contact@example.com"
              />
              {errors.contacts?.email && (
                <p className="text-red-500 text-sm mt-2 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />{" "}
                  {errors.contacts.email.message}
                </p>
              )}
            </div>

            <div>
              <Label
                htmlFor="tel"
                className="font-medium text-gray-700 mb-2 flex items-center"
              >
                Phone Number <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="tel"
                {...register("contacts.tel")}
                className={`bg-white ${
                  errors.contacts?.tel ? "border-red-500" : ""
                }`}
                placeholder="(123) 456-7890"
              />
              {errors.contacts?.tel && (
                <p className="text-red-500 text-sm mt-2 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />{" "}
                  {errors.contacts.tel.message}
                </p>
              )}
            </div>

            <div>
              <Label
                htmlFor="minHours"
                className="font-medium text-gray-700 mb-2 flex items-center"
              >
                Minimum Hours <span className="text-red-500 ml-1">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="minHours"
                  type="number"
                  {...register("minHours")}
                  className={`bg-white ${
                    errors.minHours ? "border-red-500" : ""
                  }`}
                  placeholder="e.g., 20"
                />
                <span className="absolute text-xs right-3 top-3 text-gray-500">
                  hours/week
                </span>
              </div>
              {errors.minHours && (
                <p className="text-red-500 text-sm mt-2 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />{" "}
                  {errors.minHours.message}
                </p>
              )}
            </div>
          </div>
        </div>

        <CardFooter className="flex justify-center px-0 pt-2 pb-0">
          <Button type="submit" className="w-full shadow-xl py-6">
            Post Job Opening
          </Button>
        </CardFooter>
      </form>
      <div className="mt-8 text-center text-gray-600 text-sm">
        <p>
          Your job will be visible to qualified caregivers immediately after
          submission
        </p>
        <p className="mt-1">
          Need help?{" "}
          <Link href="/contact" className="text-blue-600 hover:underline">
            Contact our support team
          </Link>
        </p>
      </div>
    </div>
  );
};

// Parent component to handle form submission and signup
const PublicJobPostPage = () => {
  const [formData, setFormData] = useState<any>(null);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const signupTriggerRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  const handleFormSubmit = (data: any) => {
    setFormData(data);
    setIsSignupOpen(true);
    signupTriggerRef.current?.click();
  };

  const handleSignupSuccess = (userData: any) => {
    if (formData) {
      postJob(userData);
    }
  };

  const postJob = async (userData: any) => {
    try {
      const payload = {
        ...formData,
        draft: false,
        userID: userData.userID,
        settings: {
          email: formData.contacts.email,
          tel: formData.contacts.tel,
        },
        certifications: "",
        hash: userData.hash,
        profileImage: "",
      };
      const jobs = await axios.post(
        "https://jrp7pe2xhj.us-east-1.awsapprunner.com/api/v1/providers/post-job",
        payload
      ); 
         trackEvents(userData.hash, "Post Job", payload);
      console.log(jobs)
      toast({ title: "Job Posted Successfully", variant: "default" });

      TagManager.dataLayer({
        dataLayer: {
          event: "post_job",
          type: "post",
          ...payload,
        },
      });
      router.push(`/provider/job/${jobs.data.jobId}`)
    } catch (error: any) {
      console.error("Error posting job:", error);
      toast({
        variant: "destructive",
        description: error?.message || "An error occurred. Please try again.",
      });
    }
  };

  return (
    <div>
      <PublicJobPostForm onSubmit={handleFormSubmit} />
      <SignupDialog
        role="provider"
        signupRoute="public_job_post"
        trigger={
          <button ref={signupTriggerRef} className="hidden">
            Open Signup
          </button>
        }
        onSuccess={handleSignupSuccess}
      />
    </div>
  );
};

export default PublicJobPostPage;
