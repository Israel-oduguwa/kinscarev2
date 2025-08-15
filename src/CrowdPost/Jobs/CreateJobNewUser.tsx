"use client";

import React, { useCallback, useState, useContext, useRef } from "react";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import { toast } from "@/components/ui/use-toast";
import { Gift, LoaderCircle } from "lucide-react";
import { Controller, useForm, Resolver, get } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import Editor from "@/components/Editor";
import MultiSelectField from "@/components/MultiSelect";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { trackEvent } from "@/lib/mixpanelUtils";
import MongoContext from "@/app/MongoContext";
import SignupDialog from "@/Authentication/SignupDialog";
import { WhatsappIcon, WhatsappShareButton } from "next-share";

const CROWDPOST_URL = "https://kinscare-backend.onrender.com/api/v1/providers/crowd-post";

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

interface CrowdPostProps {
  jobID?: string;
  type: "new" | "repost";
  user?: {
    customData: {
      userID: string;
      hash: string;
    };
  };
  userData?: {
    profileImage?: string;
    address?: string;
    userID: string;
  };
  job?: {
    _id: string;
    title?: string;
    employer_name?: string;
    licenses?: string[];
    schedule?: string[];
    location?: string;
    contact_name?: string;
    email?: string;
    phone_number?: string;
    mobility?: string;
    compensation?: string;
    description?: string;
  };
}

interface FormValues {
  title: string;
  employer_name?: string | undefined;
  licenses: string[];
  schedule: string[];
  location: string;
  contact_name?: string | undefined;
  email: string;
  phone_number: string;
  mobility: "car_needed" | "no_car_needed";
  compensation?: string | undefined;
  description: string;
}

const formSchema: any = Yup.object<FormValues>({
  title: Yup.string().required("Please enter the title of your job"),
  employer_name: Yup.string()
    .max(50, "Employer name must be at most 50 characters")
    .optional()
    .defined(),
  licenses: Yup.array()
    .of(Yup.string().oneOf(groupLicenses.map((g) => g.value)))
    .min(1, "Select at least 1 license")
    .required(),
  schedule: Yup.array()
    .of(Yup.string().oneOf(groupSchedule.map((g) => g.value)))
    .min(1, "Select at least 1 schedule option")
    .required(),
  location: Yup.string().required("Please enter the job location"),
  contact_name: Yup.string().optional().defined(),
  email: Yup.string()
    .email("Enter a valid email address")
    .required("Email is required"),
  phone_number: Yup.string().required("Phone number is required"),
  mobility: Yup.string()
    .oneOf(["car_needed", "no_car_needed"], "Please select mobility")
    .required(
      "Please select if a caregiver needs to drive"
    ) as Yup.StringSchema<"car_needed" | "no_car_needed">,
  compensation: Yup.string().optional().defined(),
  description: Yup.string().required("Please enter job description"),
});

const resolver: Resolver<FormValues> = yupResolver(formSchema);

const postJobApi = async (payload: any) => {
  const response = await axios.post(CROWDPOST_URL, payload);
  return response.data;
};

const CreateJobNewUser: React.FC<CrowdPostProps> = ({
  jobID,
  user: userProp,
  userData: userDataProp,
  job,
  type,
}) => {
  const router = useRouter();
  const mongo = useContext(MongoContext);
  const { user }: any = mongo; // Only use user to check authentication status
  const [isLoading, setIsLoading] = useState(false);
  const [editorContent, setEditorContent] = useState<string>(
    job?.description || ""
  );
  const [copied, setCopied] = useState(false);
  const signupTriggerRef = useRef<HTMLButtonElement>(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    getValues,
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

  const watchedValues = watch();

  const postJob = useCallback(
    async (data: FormValues, userData: any) => {
      setIsLoading(true);
      const payload = {
        ...data,
        description: editorContent,
        userID: userData.userID,
        hash: userData.hash,
        profileImage: userData.profileImage,
      };

      try {
        if (type === "repost") {
          const result = await postJobApi({ ...payload, draft: false });
          toast({
            title: "Crowd Post re-posted successfully",
            variant: "default",
          });
          router.push(`/provider/crowd-post/${result.jobData._id}`);
        } else {
          const result = await postJobApi({
            ...payload,
            _id: jobID,
            draft: false,
          });
          // console.log(result)
          // send the Sms
          const smsPayload = {
            type: "referral_drip",
            providerPhone: result.jobData?.phone_number,
            caregiverName:`${ userData.fname} ${userData.lname}`,
            url: result.referralLink,
            country:"US"
          };
          // console.log("sening sms payload", smsPayload)
          const send = await axios.post(
            "https://kinscare-backend.onrender.com/api/v1/twilio/send-referrred-provider-sms",
            smsPayload
          );
          // console.log(send)
          // track the event
          const mixpanelPayload = {
            name: "Crowd Post",
            user_id: userData.userID,
            authenticated: true,
            date: new Date(),
            referee_employee: true,
            step: "post job",
          };
          trackEvent(userData.hash, "Crowd Post", mixpanelPayload);
          toast({
            title: "Crowd Post job created successfully",
            variant: "default",
          });
          router.push(`/vitae/crowd-post/${result.jobData._id}`);
        }
      } catch (err) {
        let message = "An unexpected error occurred";
        if (axios.isAxiosError(err)) {
          const data = (err as AxiosError).response?.data as any;
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
    [editorContent, jobID, router, type]
  );

  const onSubmit = useCallback(
    (data: FormValues) => {
      if (user && userDataProp) {
        postJob(data, userDataProp);
      } else {
        signupTriggerRef.current?.click();
      }
    },
    [user, userDataProp, postJob]
  );

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

  const handleFieldChange = useCallback(
    (fieldName: keyof FormValues, value: any) => {
      setValue(fieldName, value, { shouldValidate: true, shouldDirty: true });
    },
    [setValue]
  );

  const referralLink = "https://www.kinscare.org/refer-and-earn";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareMsg =
    "Know a care home or agency hiring caregivers? Share a job lead on KinsCare and get rewarded when your referral signs up!,you earn up to $55, and they get a free 7-day trial to connect with top candidates";

  return (
    <div className="py-6 grid grid-cols-1 md:grid-cols-12 gap-8">
      <div className="col-span-12 md:col-span-8">
        <div className="py-8 mx-2 px-4 md:px-10 rounded-xl shadow-lg bg-white">
          <div>
            <div className="mb-7">
              <h2 className="font-bold text-xl gap-4 flex items-center text-slate-800">
                <span className="inline-flex items-center justify-center bg-blue-100 rounded-full h-12 w-12 shadow">
                  <Gift className="h-7 w-7 text-blue-500" />
                </span>
                Refer & Earn with Kinscare
              </h2>
              <p className="text-base mt-5 text-slate-700">
                Share a job opportunity below—when the provider signs up and
                hires through your referral, you can earn up to{" "}
                <span className="font-semibold text-blue-700">$55</span> in
                rewards, while they get a 7-day free trial to connect with
                quality caregivers.
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
        <SignupDialog
          role="caregiver"
          signupRoute="crowd_post"
          trigger={
            <button ref={signupTriggerRef} className="hidden">
              Open Signup
            </button>
          }
          onSuccess={(userData: any) => {
            const formData = getValues();
            postJob(formData, userData);
          }}
          jumpstart={false}
        />
      </div>
      <div className="col-span-12 md:col-span-4">
        <div className="relative">
          {/* Card Container */}
          <div className="relative bg-white/90 backdrop-blur-md rounded-3xl shadow-xl overflow-hidden p-8 md:p-10 z-10">
            {/* Header */}
            <div className=" mb-2">
              <h1 className="text-2xl md:text-xl font-bold text-gray-800 mb-2">
                Help More Caregivers Get Hired—And Earn for Every Connection
              </h1>
              <p className="text-gray-600">
                Know an employer or family looking to hire caregivers? Share
                this link so they can post a job, connect with great candidates,
                and can earn up to <span className="font-bold">$55</span> when
                their referral is claimed.
              </p>
            </div>

            {/* Referral Link */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Your Referral Link:
              </label>
              <div className="border border-dashed border-indigo-300 rounded-lg p-2 flex items-center justify-between bg-indigo-50/50 hover:bg-indigo-50 transition-colors">
                <div className="truncate text-sm text-gray-800 font-medium mr-2">
                  {referralLink}
                </div>
                <button
                  onClick={copyToClipboard}
                  className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
                    copied
                      ? "bg-green-100 text-green-600"
                      : "bg-indigo-100 text-indigo-600 hover:bg-indigo-200"
                  }`}
                  aria-label={copied ? "Copied!" : "Copy to clipboard"}
                >
                  <i className={copied ? "fas fa-check" : "far fa-copy"}></i>
                </button>
              </div>
            </div>

            {/* WhatsApp Button */}
            <div className="flex items-baseline gap-4">
              <WhatsappShareButton
                url={referralLink}
                title={shareMsg}
                separator=" "
                className="w-full"
              >
                <div className="whatsapp-btn bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-3 px-6 rounded-full inline-flex items-center justify-center w-full max-w-xs hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                  <WhatsappIcon size={25} round={false} className="mr-3" />
                  Share on WhatsApp
                </div>
              </WhatsappShareButton>
              {/* <p className="text-gray-700 mb-4 flex items-center justify-center">
                Share via WhatsApp and help more providers hire faster!
              </p> */}
            </div>

            {/* Earnings Animation */}
            <div className="absolute top-100 right-6 flex items-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center shadow-md">
                <i className="fas fa-dollar-sign text-green-600 text-xl"></i>
              </div>
              <div className="w-3 h-3 rounded-full bg-green-500 ml-2 animate-pulse"></div>
            </div>
          </div>

          {/* Floating Icons */}

          <div className="absolute -top-4 -right-4 w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center ">
            <i className="fas fa-briefcase-medical text-indigo-500 text-xl"></i>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateJobNewUser;
