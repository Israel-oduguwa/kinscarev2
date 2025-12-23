"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "@/components/ui/use-toast";
import { Gift, LoaderCircle } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import Editor from "@/components/Editor";
import MultiSelectField from "@/components/MultiSelect";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { trackEvent } from "@/lib/mixpanelUtils";
import { SignUp, useUser } from "@clerk/nextjs";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { WhatsappIcon, WhatsappShareButton } from "next-share";

const CROWDPOST_URL = "http://localhost:8081/api/v1/providers/crowd-post";

const groupLicenses = [
  { label: "CNA", value: "CNA or NAC" },
  { label: "HCA", value: "HCA" },
  { label: "NAR", value: "NAR" },
  { label: "Companion", value: "None" },
];

const groupSchedule = [
  { label: "Full time", value: "Full time" },
  { label: "Part time", value: "Part time" },
  { label: "Weekend", value: "Weekends" },
  { label: "On Call", value: "on Call" },
  { label: "Live In", value: "Live In" },
];

interface FormValues {
  title: string;
  employer_name?: string;
  licenses: string[];
  schedule: string[];
  location: string;
  contact_name?: string;
  email: string;
  phone_number: string;
  mobility: "car_needed" | "no_car_needed";
  compensation?: string;
  description: string;
}

const formSchema:any = Yup.object<FormValues>({
  title: Yup.string().required("Please enter the title of your job"),
  employer_name: Yup.string().max(50).optional(),
  licenses: Yup.array().of(Yup.string()).min(1, "Select at least 1 license").required(),
  schedule: Yup.array().of(Yup.string()).min(1, "Select at least 1 schedule").required(),
  location: Yup.string().required("Please enter the job location"),
  contact_name: Yup.string().optional(),
  email: Yup.string().email("Invalid email").required("Email is required"),
  phone_number: Yup.string().required("Phone number is required"),
  mobility: Yup.string().oneOf(["car_needed", "no_car_needed"]).required(),
  compensation: Yup.string().optional(),
  description: Yup.string().required("Please enter job description"),
});

const CreateJobNewUser: React.FC<any> = ({ jobID, type, job }) => {
  const router = useRouter();
  const { isSignedIn, user, isLoaded } = useUser();
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [isJobPosting, setIsJobPosting] = useState(false);
  const [editorContent, setEditorContent] = useState(job?.description || "");
  const [copied, setCopied] = useState(false);

  // Geo state
  const [ip, setIp] = useState<string | null>(null);
  const [zipcode, setZipcode] = useState<string | null>(null);
  const [city, setCity] = useState<string | null>(null);
  const [region_name, setRegionName] = useState<string | null>(null);
  const [country_code, setCountryCode] = useState<string | null>(null);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [isGeoLoading, setIsGeoLoading] = useState(true);

  const mountedRef = useRef(true);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: yupResolver(formSchema),
    defaultValues: {
      title: job?.title || "",
      employer_name: job?.employer_name || "",
      licenses: job?.licenses || [],
      schedule: job?.schedule || [],
      location: job?.location || "",
      contact_name: job?.contact_name || "",
      email: job?.email || "",
      phone_number: job?.phone_number || "",
      mobility: job?.mobility === "no_car_needed" ? "no_car_needed" : "car_needed",
      compensation: job?.compensation || "",
      description: job?.description || "",
    },
  });

  // Fetch IP + Geo on mount
  useEffect(() => {
    const controller = new AbortController();
    const fetchGeo = async () => {
      try {
        setIsGeoLoading(true);
        const res = await axios.get("/api/ip", { signal: controller.signal });
        const data = res.data || {};

        setIp(data.ip || data.query || "");
        setZipcode(data.zip || data.postal || "");
        setCity(data.city || data.town || "");
        setRegionName(data.region_name || data.region || "");
        setCountryCode(data.country_code || "");
        setLatitude(data.latitude ?? null);
        setLongitude(data.longitude ?? null);
      } catch (err) {
        console.error("Geo fetch failed", err);
      } finally {
        if (mountedRef.current) setIsGeoLoading(false);
      }
    };
    fetchGeo();
    return () => {
      mountedRef.current = false;
      controller.abort();
    };
  }, []);

  // Auto-post job after successful signup
  useEffect(() => {
    if (isSignedIn && user && isLoaded && !isJobPosting) {
      const savedData = getValues();
      if (Object.keys(savedData.title).length > 0 || savedData.description) {
        postJobNow(savedData);
      }
      setIsSignupOpen(false);
    }
  }, [isSignedIn, user, isLoaded]);

  const postJobNow = async (formData: FormValues) => {
    if (!user || isJobPosting) return;
    setIsJobPosting(true);

    const payload = {
      ...formData,
      description: editorContent,
      userID: user.id,
      hash: (user.publicMetadata as any)?.hash || "",
      profileImage: user.imageUrl || "",
      draft: false,
      ...(type === "new" ? { _id: jobID } : {}),
    };

    try {
      const result = await axios.post(CROWDPOST_URL, payload);

      // Send referral SMS
      if (type === "new" && result.data.referralLink) {
        await axios.post(
          "http://localhost:8081/api/v1/twilio/send-referrred-provider-sms",
          {
            type: "referral_drip",
            providerPhone: result.data.jobData?.phone_number,
            caregiverName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
            url: result.data.referralLink,
            country: "US",
          }
        );
      }

      trackEvent((user.publicMetadata as any)?.hash, "Crowd Post", {
        name: "Crowd Post",
        user_id: user.id,
        authenticated: true,
        step: "post job",
        referee_employee:	true,
      });

      toast({ title: "Crowd Post created successfully!", variant: "default" });
      router.push(`/vitae/crowd-post/${result.data.jobData._id}`);
    } catch (err: any) {
      toast({
        title: "Failed to post job",
        description: err.response?.data?.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsJobPosting(false);
    }
  };

  const onSubmit = (data: FormValues) => {
    if (isSignedIn && user) {
      postJobNow(data);
    } else {
      setIsSignupOpen(true);
    }
  };

  const handleEditorChange = (content: string) => {
    setEditorContent(content);
    setValue("description", content, { shouldValidate: true });
  };

  const referralLink = "https://www.kinscare.org/refer-and-earn";
  const shareMsg = "Know a care home or agency hiring caregivers? Share a job lead on KinsCare and get rewarded when your referral signs up! You earn up to $55, and they get a free 7-day trial.";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isLoading = isSubmitting || isJobPosting || (isSignupOpen && !isSignedIn);

  const unsafeMetadata = {
    role: "caregiver",
    signupRoute: "crowd_post",
    userIp: ip || undefined,
    zipcode: zipcode || undefined,
    city: city || undefined,
    address: `${city || ""}, ${region_name || ""}, ${country_code || ""}`.trim() || undefined,
    geocode_address: {
      lng: longitude ?? undefined,
      lat: latitude ?? undefined,
    },
    apply_metadata: true,
    returning: false,
  };


  const handleFieldChange = useCallback(
    (fieldName: keyof FormValues, value: any) => {
      setValue(fieldName, value, { shouldValidate: true, shouldDirty: true });
    },
    [setValue]
  );

  return (
    <>
      <div className="py-6 grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="col-span-12 md:col-span-8">
          <div className="py-8 mx-2 px-4 md:px-10 rounded-xl shadow-lg bg-white">
            <div className="mb-7">
              <h2 className="font-bold text-xl gap-4 flex items-center text-slate-800">
                <span className="inline-flex items-center justify-center bg-blue-100 rounded-full h-12 w-12 shadow">
                  <Gift className="h-7 w-7 text-blue-500" />
                </span>
                Refer & Earn with Kinscare
              </h2>
              <p className="text-base mt-5 text-slate-700">
                Share a job opportunity below—when the provider signs up and hires through your referral, you can earn up to{" "}
                <span className="font-semibold text-blue-700">$55</span> in rewards.
              </p>
            </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="flex flex-col space-y-6">
                <div className="flex flex-col space-y-3">
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

                  <div className="w-full prose-lg prose-h3:my-2 prose-blockquote:my-2 discussion-content max-w-[100%]">
                    <p className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                      Please enter job description
                    </p>
                    <Editor
                      onChange={handleEditorChange}
                      initialContent={editorContent}
                      usage="post"
                    />
                    {errors.description && (
                      <p className="text-red-500 text-sm">
                        {errors.description.message}
                      </p>
                    )}
                  </div>

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

        {/* Referral Sidebar */}
        <div className="col-span-12 md:col-span-4">
          <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl p-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              Help More Caregivers Get Hired—And Earn for Every Connection
            </h1>
            <p className="text-gray-600 mb-6">
              Share your referral link and earn up to <strong>$55</strong> when someone posts a job through you.
            </p>

            <div className="border border-dashed border-indigo-300 rounded-lg p-4 bg-indigo-50 flex items-center justify-between mb-6">
              <span className="text-sm font-medium truncate mr-2">{referralLink}</span>
              <button
                onClick={copyToClipboard}
                className={`p-2 rounded-full ${copied ? "bg-green-100 text-green-600" : "bg-indigo-100 text-indigo-600"}`}
              >
                {copied ? "✓" : "📋"}
              </button>
            </div>

            <WhatsappShareButton url={referralLink} title={shareMsg}>
              <div className="bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-4 px-6 rounded-full flex items-center justify-center gap-3 hover:shadow-lg transition">
                <WhatsappIcon size={28} round />
                Share on WhatsApp
              </div>
            </WhatsappShareButton>
          </div>
        </div>
      </div>

      {/* Clerk SignUp Dialog */}
      <Dialog open={isSignupOpen} onOpenChange={setIsSignupOpen}>
        <DialogContent className="p-0 max-w-md overflow-hidden rounded-2xl border border-gray-100 shadow-2xl">
          <div className="px-5 pt-5 pb-3 bg-white border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Post your crowd job</h3>
            <p className="text-sm text-gray-600">
              Create your account to finish posting and reach caregivers.
            </p>
          </div>
          <div className="p-5">
            {isGeoLoading && (
              <div className="mb-3 flex items-center gap-2 text-sm text-gray-600">
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Detecting your location...
              </div>
            )}

            {isJobPosting ? (
              <div className="text-center py-10">
                <LoaderCircle className="h-12 w-12 animate-spin mx-auto text-blue-600" />
                <p className="mt-4 text-lg font-semibold">Creating your Crowd Post...</p>
                <p className="text-sm text-gray-500">Almost there!</p>
              </div>
            ) : (
              <SignUp
                unsafeMetadata={unsafeMetadata}
                routing="virtual"
                // afterSignUpUrl={window.location.pathname}
                // afterSignInUrl={window.location.pathname}
                appearance={{
                  elements: {
                    rootBox: "m-0 p-0 w-full",
                    cardBox: "w-full shadow-none border-none rounded-none bg-white",
                    card: "m-0 p-0 w-full shadow-none border-none",
                    main: "m-0 p-0 w-full border-none shadow-none flex flex-col gap-0",
                    header: "hidden",
                    headerTitle: "hidden",
                    headerSubtitle: "hidden",
                    form: "m-0 p-2 w-full flex flex-col gap-4",
                    formFieldInput: "h-[3.5rem]",
                    formFieldLabel: "text-sm",
                    socialButtons: "m-0 p-2 pb-4 pt-2 w-full flex gap-2",
                    socialButtonsBlockButton: "h-10",
                    socialButtonsProviderIcon: "w-10",
                    formButtonPrimary: "bg-blue-600 hover:bg-blue-700 shadow-none border-none py-2",
                    footer: "m-0 p-2 w-full",
                    footerAction: "text-sm text-gray-600",
                    footerActionLink: "text-blue-600 font-semibold hover:underline",
                  },
                  layout: {
                    socialButtonsVariant: "blockButton",
                    socialButtonsPlacement: "top",
                  },
                }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CreateJobNewUser;
