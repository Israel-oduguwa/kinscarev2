"use client";

import React, { useContext, useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import MongoContext from "@/app/MongoContext";
import Editor from "@/components/Editor"; // Assuming you have a reusable Editor component
import axios from "axios";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { AlertCircle, CheckCircle, Loader2, LoaderCircle } from "lucide-react";
import { fetchUserData } from "@/lib/utils";

// Yup schema for form validation
const jobPostSchema = yup.object().shape({
  title: yup.string().required("Please enter title of your job"),
  name: yup
    .string()
    .required("Provider name is required")
    .min(2, "Name must be at least 2 characters"),
  telephone: yup.string().required("Telephone number is required"),
  type_of_setting: yup
    .array()
    .min(1, "Please select provider type of care setting(s)")
    .required("This field is required."),
  trainer: yup.string().required("Please select whether you offer training"),
  description: yup.string().required("Job description is required"),
});

const JobPostModal = ({ caregiver }: any) => {
  const { userData, user, setUserData }: any = useContext(MongoContext);
  const [step, setStep] = useState(1); // Manage form steps
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(!userData?.complete);
  const [validating, setValidating] = useState(false);
  const [isPhoneValid, setIsPhoneValid] = useState<null | boolean>(null);
  console.log(userData?.complete);
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(jobPostSchema),
  });

  const { toast } = useToast();

  // // Automatically generate a job title
  // const generateJobTitle = (city: string) => {
  //   const suggestions = [
  //     `Caregiver needed for Elderly Care in ${city}`,
  //     `Professional Caregiver Services required in ${city}`,
  //     `Elder Caregiver Job in ${city}`,
  //   ];
  //   return suggestions[Math.floor(Math.random() * suggestions.length)];
  // };
  type CaregiverParams = {
    licenses: string[]; // Array of caregiver licenses (e.g., ['HCA', 'RN'])
    availability: string[]; // Array of availability options (e.g., ['Part time', 'Full time'])
  };

  const validatePhoneNumber = async (phone: string | undefined) => {
    if (!phone) {
      toast({
        title: "Invalid Input",
        description: "Please enter a phone number with the country code.",
        variant: "destructive",
      });
      return;
    }

    try {
      setValidating(true);
      const response = await axios.post(
        "https://jrp7pe2xhj.us-east-1.awsapprunner.com/api/v1/auth/phone/validate",
        {
          phone: phone,
        }
      );
      setValidating(false);

      if (response.data.success) {
        setIsPhoneValid(true);
        toast({
          title: "Phone Validated",
          description: "Your phone number is valid.",
          variant: "default",
        });
      } else {
        setIsPhoneValid(false);
        toast({
          title: "Validation Failed",
          description: "Invalid phone number. Please check your input.",
          variant: "destructive",
        });
      }
    } catch (error) {
      setValidating(false);
      setIsPhoneValid(false);
      toast({
        title: "Validation Error",
        description: "Error validating phone number. Please try again.",
        variant: "destructive",
      });
      console.error("Error validating phone number:", error);
    }
  };
  const generateJobTitle = (
    caregiver: CaregiverParams,
    city: string
  ): string => {
    const { licenses, availability } = caregiver;

    // Templates for job titles
    const templates = [
      "Live-in {license} Caregiver needed at {city}.",
      "{availability} {license} Caregiver opportunity in {city}.",
      "Compassionate {license} required for caregiving role in {city}.",
      "{availability} job for skilled {license} in {city}.",
      "{license} Caregiver needed urgently at {city}.",
      "Rewarding {availability} caregiving role for {license} in {city}.",
    ];

    // Choose a random license
    const randomLicense = licenses[Math.floor(Math.random() * licenses.length)];

    // Choose a random availability
    const randomAvailability =
      availability[Math.floor(Math.random() * availability.length)];

    // Choose a random template
    const randomTemplate =
      templates[Math.floor(Math.random() * templates.length)];

    // Replace placeholders in the template with dynamic values
    return randomTemplate
      .replace("{license}", randomLicense)
      .replace("{availability}", randomAvailability)
      .replace("{city}", city);
  };

  // console.log(caregiver);
  useEffect(() => {
    if (userData) {
      if (userData?.city) {
        const generatedTitle = generateJobTitle(caregiver, userData.city);
        setValue("title", generatedTitle); // Set a generated job title
      }
      // prefill the telephone number
      if (user.customData) {
        setValue("telephone", user.customData.tel);
      }
    }
  }, [userData, setValue]);

  const handleFormSubmit = async (data: any) => {
    setLoading(true);
    // console.log(data);
    try {
      const jobPayload = {
        ...data,
        description: data.description,
        compensation: "Negotiable",
        contacts: {
          ...data.contacts,
          address: userData.address,
          city: userData.city,
          email: userData.auth.email,
          tel: data.telephone,
          zipcode: user.customData.zipcode,
        },
        licenses: caregiver.licenses || [],
        schedule: caregiver.availability || [],
        minHours: 20, // Default hours, can be edited later
        mobility: "car_needed",
        draft: true,
        userID:userData.userID,
        profileImage: userData?.profileImage,
        hash: userData?.hash,
      };
      console.log(jobPayload);
      // Post the job
      await axios.post(
        "https://jrp7pe2xhj.us-east-1.awsapprunner.com/api/v1/providers/post-job",
        jobPayload
      );

      // Update the profile
      const profilePayload = {
        ...data,
        fname: userData.fname,
        lname: userData.lname,
        city: userData.city,
        zipcode: user.customData.zipcode,
        address: userData.address,
        settings: {
          ...data.settings,
          email: userData.auth.email,
          tel: data.telephone,
          alert_preferences: ["SMS/Text message", "Email"],
        },
        profileImage: userData?.profileImage,
        complete: true,
        hash: user.customData.hash,
      };

      const profile = await axios.post(
        `https://jrp7pe2xhj.us-east-1.awsapprunner.com/api/v1/providers/settings/update/${userData.userID}`,
        profilePayload
      );
      console.log(profile);
      toast({
        title: "Job posted and profile updated successfully",
        variant: "default",
      });
      // so we need to set the userData on the context state to the latest code
      const fetchedData: any = await fetchUserData(
        user.customData.userID,
        user.customData.email
      );
      // console.log(fetchedData);
      setUserData(fetchedData.result);
      setOpenDialog(false);
      setLoading(false);
    } catch (error: any) {
      console.error("Error updating profile or posting job:", error);
      toast({
        title: "Error",
        description: "An error occurred while posting the job.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const onEditorStateChange = (editorState: any) => {
    setValue(`description`, editorState);
  };

  const groupProvider = [
    {
      label: "Assisted Living/Nursing Home",
      value: "Assisted Living/Nursing Home",
    },
    {
      label: "Adult Family/Boarding Home",
      value: "Adult Family/Boarding Home",
    },
    { label: "Hospital/Clinic", value: "Hospital/Clinic" },
    { label: "Home Care Agency", value: "Home Care Agency" },
    { label: "Other", value: "Other" },
  ];

  // Function to handle step navigation
  const handleNextStep = () => setStep((prev) => prev + 1);
  const handlePrevStep = () => setStep((prev) => prev - 1);
  const previewData = watch();
  console.log(errors);
  return (
    <Dialog open={openDialog}>
      <DialogContent className="max-w-4xl m-0 rounded-lg p-0 overflow-hidden">
        {/* Progress Bar */}
        <div className="relative w-full bg-gray-200 h-1">
          <div
            className={`absolute h-2 bg-blue-500 transition-all`}
            style={{ width: `${(step / 3) * 100}%` }} // Update width based on step
          />
        </div>

        <div className="">
          {/* Step Title */}

          {/* Step 1: Basic Information */}
          {step === 1 && (
            <form className="space-y-4 p-6">
              <div className="flex justify-between mb-4">
                <h2 className="antialiased text-gray-800 tracking-tight font-semibold">
                  Contact Information
                </h2>
                <h3 className="text-sm font-semibold antialiased text-gray-500">
                  Step {step} of 3
                </h3>
              </div>
              <div className="mb-0">
                <label
                  htmlFor="job-title"
                  className="block mb-1 text-sm font-medium text-gray-600 antialiased dark:text-white"
                >
                  Job title
                </label>
                <input
                  type="text"
                  id="first-name"
                  className="bg-gray-50 border border-gray-300 focus-visible:outline-blue-500 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  required
                  {...register("title")}
                />
                {errors.title && (
                  <p className="text-red-500">{errors.title.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name Field */}
                <div>
                  <Label
                    className="block mb-1 text-sm antialiased font-medium text-gray-600 dark:text-white"
                    htmlFor="name"
                  >
                    Your Name or Business Name
                  </Label>
                  <input
                    id="name"
                    type="text"
                    {...register("name")}
                    placeholder="Enter provider or business name"
                    className="bg-gray-50 border border-gray-300 focus-visible:outline-blue-500 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Telephone Field */}
                <div>
                  <Label
                    htmlFor="tel"
                    className="mb-2 block text-sm font-medium text-gray-800 dark:text-gray-300"
                  >
                    Phone Number
                  </Label>
                  <Controller
                    name="telephone"
                    control={control}
                    render={({ field }) => (
                      <div className="relative">
                        <PhoneInput
                          {...field}
                          id="tel"
                          placeholder="Enter phone number"
                          defaultCountry="NG"
                          label
                          international
                          className={`pr-10 input input-bordered w-full ${
                            errors.telephone
                              ? "border-red-500"
                              : "border-gray-300"
                          } ${
                            isPhoneValid
                              ? "border-green-500"
                              : isPhoneValid === false
                              ? "border-red-500"
                              : ""
                          }`}
                          onBlur={(e) => validatePhoneNumber(field.value)}
                        />
                        {validating && (
                          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 animate-spin h-6 w-6 text-gray-500" />
                        )}
                        {isPhoneValid && !validating && (
                          <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
                        )}
                        {isPhoneValid === false && !validating && (
                          <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-red-500" />
                        )}
                      </div>
                    )}
                  />
                  {errors.telephone && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.telephone.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="antialiased text-gray-800 mb-2 tracking-tight font-semibold">
                  What kind of care provider are you?
                </h3>
                <div className="space-y-2">
                  {groupProvider.map((option) => (
                    <div key={option.value} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={option.value}
                        value={option.value}
                        {...register("type_of_setting")}
                        className="w-4 h-4 border-gray-300"
                      />
                      <label
                        htmlFor={option.value}
                        className="text-sm text-gray-700"
                      >
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
                {errors.type_of_setting && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.type_of_setting.message}
                  </p>
                )}
              </div>

              <Button
                type="button"
                onClick={handleNextStep}
                className="w-full py-3"
              >
                Add Job description
              </Button>
            </form>
          )}

          {/* Step 2: Additional Details */}
          {step === 2 && (
            <form
              onSubmit={handleSubmit(handleFormSubmit)}
              className="space-y-4 p-6 mt-6"
            >
              <div className="flex justify-between mb-6">
                <h2 className="antialiased text-gray-800 tracking-tight font-semibold">
                  Job description
                </h2>
                <h3 className="text-sm font-semibold antialiased text-gray-500">
                  Step {step} of 3
                </h3>
              </div>
              <div>
                <p className="font-medium text-sm text-gray-700 mb-2">
                  Do you offer in-house training or sponsor training?
                </p>
                <Controller
                  name="trainer"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup
                      value={field.value}
                      onValueChange={(value) => field.onChange(value)}
                      className="flex gap-4"
                    >
                      <div className="flex items-center">
                        <RadioGroupItem value="yes" />
                        <Label className="ml-2">Yes</Label>
                      </div>
                      <div className="flex items-center">
                        <RadioGroupItem value="no" />
                        <Label className="ml-2">No</Label>
                      </div>
                    </RadioGroup>
                  )}
                />
                {errors.trainer && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.trainer.message}
                  </p>
                )}
              </div>

              <p className="block mb-2 text-sm font-medium  text-gray-600 dark:text-white">
                Please enter job description and required certifications such as
                CPR/First Aid, Food Handler's etc.
              </p>
              <div className="w-full overflow-y-auto max-h-96 prose-lg prose-h3:my-2 prose-blockquote:my-2  discussion-content max-w-[100%]">
                <Editor
                  onChange={onEditorStateChange}
                  usage="poss"
                  initialContent={watch("description")}
                />
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevStep}
                >
                  Back to Step 1
                </Button>
                <Button
                  type="button"
                  onClick={handleNextStep}
                  className="w-full py-3"
                >
                  Preview Job
                </Button>
              </div>
            </form>
          )}
          {step === 3 && (
            <div className="bg-gray-50 p-8 rounded-lg shadow-lg overflow-auto h-[100vh] lg:h-fit space-y-8">
              {/* Job Title */}
              <p className="font-semibold text-blue-900 p-4 bg-blue-100 rounded-lg">
                This preview shows how caregivers will see your job post. Once
                you post it, we’ll recommend matching caregivers. Message or
                call them directly to connect and start hiring your ideal match.
              </p>
              <h3 className="text-xl font-extrabold text-gray-900">
                {previewData?.title}
              </h3>

              {/* Job Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {/* Left Column */}
                <div className="space-y-4">
                  <p className="text-sm text-gray-700">
                    <strong className="font-semibold text-gray-900">
                      Name
                    </strong>{" "}
                    {previewData?.name}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong className="font-semibold text-gray-900">
                      Phone
                    </strong>{" "}
                    {previewData?.telephone}
                  </p>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div>
                    <p className="text-base text-gray-700 mb-2">
                      <strong className="font-semibold text-gray-900">
                        Care Settings:
                      </strong>
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {previewData?.type_of_setting &&
                        previewData?.type_of_setting?.map(
                          (setting: string, index: number) => (
                            <span
                              key={index}
                              className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-lg"
                            >
                              {setting}
                            </span>
                          )
                        )}
                    </div>
                  </div>
                  <p className="text-base text-gray-700">
                    <strong className="font-semibold text-gray-900">
                      Training:
                    </strong>{" "}
                    {previewData?.trainer}
                  </p>
                </div>
              </div>

              {/* Job Description */}
              <div className="space-y-4">
                <h4 className="font-bold text-gray-900">Job Description</h4>
                <div
                  className="text-sm text-gray-700 leading-relaxed max-h-[300px] prose-lg overflow-y-auto border border-gray-200 rounded-lg p-4 bg-white shadow-inner"
                  dangerouslySetInnerHTML={{ __html: previewData?.description }}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-6">
                <Button
                  onClick={handlePrevStep}
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-100 transition px-6 py-3"
                >
                  Back to Step 2
                </Button>
                <Button
                  type="submit"
                  onClick={handleSubmit(handleFormSubmit)}
                  className="w-full bg-blue-600 text-white hover:bg-blue-700 transition px-6 py-3"
                >
                  {loading && <LoaderCircle className="animate-spin mr-2" />}
                  {loading ? "Posting...." : "Post Job"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default JobPostModal;
