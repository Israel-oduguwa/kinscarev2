"use client";

import SignupDialog from "@/Authentication/SignupDialog";
import MultiSelectField from "@/components/MultiSelect";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { yupResolver } from "@hookform/resolvers/yup";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import axios from "axios";
import {
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import JumpStartPayment from "./JumpStartPayment";
import { Button } from "@/components/ui/button";

const STRIPE_PUBLIC_KEY = process.env.STRIPE_PUBLIC_KEY ?? "";
const stripePromise = loadStripe(STRIPE_PUBLIC_KEY);

interface FormData {
  fullName: string;
  email: string;
  phoneNumber: string;
  orgName: string;
  whoNeedsCare: string;
  location: string;
  careTypes: string[];
  schedule: string[];
  careStart: string;
  licenses: string[];
  languages: string;
  notes: string;
}

const groupSchedule = [
  { label: "Full time", value: "Full time" },
  { label: "Part time", value: "Part time" },
  { label: "Weekend", value: "Weekends" },
  { label: "On Call", value: "On Call" },
  { label: "Live In", value: "Live In" },
];

const groupLicenses = [
  { label: "CNA", value: "CNA or NAC" },
  { label: "HCA", value: "HCA" },
  { label: "NAR", value: "NAR" },
  { label: "Companion", value: "None" },
];

const careTypes = [
  { label: "Personal Care", value: "Personal Care" },
  { label: "Companionship", value: "Companionship" },
  { label: "Medical/Skilled", value: "Medical/Skilled" },
  { label: "Other", value: "Other" },
];

const schema = yup.object({
  fullName: yup.string().required("Full name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  phoneNumber: yup
    .string()
    .matches(/^\+?\d{10,15}$/, "Invalid phone number")
    .required("Phone number is required"),
  orgName: yup
    .string()
    .required("Organization name or 'Private Family' is required"),
  whoNeedsCare: yup.string().required("Who needs care is required"),
  location: yup.string().required("Location is required"),
  careTypes: yup.array().min(1, "Select at least one type of care"),
  schedule: yup.array().min(1, "Select at least one schedule"),
  careStart: yup.string().required("Care start date is required"),
  licenses: yup.array().min(1, "Select at least one license"),
  languages: yup.string().notRequired(),
  notes: yup.string().notRequired(),
});
interface SubscriptionData {
  id?: string;
  // Extend as needed to match your subscription object structure
}
interface CreateSubscriptionResponse {
  clientSecret: string;
  subscriptionId: string;
  subscription: SubscriptionData;
}

function JumpStartForm() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const signupTriggerRef = useRef<HTMLButtonElement>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isFetchingSecret, setIsFetchingSecret] = useState(false);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(
    null
  );
  const [subscriptionID, setSubscriptionID] = useState<string>("");
  const saved =
    typeof window !== "undefined"
      ? localStorage.getItem("jumpstartForm")
      : null;
  const defaultValues = saved ? JSON.parse(saved) : {};

  const {
    control,
    handleSubmit,
    trigger,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues,
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    const subscription = watch((data) => {
      localStorage.setItem("jumpstartForm", JSON.stringify(data));
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const allFields: (keyof FormData)[] = [
    "fullName",
    "email",
    "phoneNumber",
    "orgName",
    "whoNeedsCare",
    "location",
    "careTypes",
    "schedule",
    "careStart",
    "licenses",
    "languages",
    "notes",
  ];

  const fieldsPerStep: (keyof FormData)[][] = [allFields, []];

  const onNext = async () => {
    const fields = fieldsPerStep[step];
    const valid = await trigger(fields);
    if (valid && step < fieldsPerStep.length - 1) {
      setStep((s) => s + 1);
    }
  };

  const onBack = () => setStep((s) => Math.max(0, s - 1));

  const onSubmit = async (data: FormData) => {
    console.log("Final payload:", data);
    localStorage.removeItem("jumpstartForm");
    reset();
    setOpen(false);
    setStep(0);
  };
  const formData = watch();
  console.log(formData);

  const createSubscriptionClientSecret = async (userID: any) => {
    setIsFetchingSecret(true);
    try {
      const response = await axios.post<CreateSubscriptionResponse>(
        "https://api.kinscare.org/api/v1/providers/jumpstart/make-payment",
        {
          userID,
          customerEmail: formData.email,
          priceId: "price_1RgAOgAoahxG9SLGmlFb19nn",
        }
      );
      const payload = {
        collectionName: "contacts",
        operation: "updateOne",
        filter: { userID, role: "provider" },
        update: {
          $set: {
            plan: "bi-weekly",
          },
        },
      };
      const database_response = await axios.post(
        "https://api.kinscare.org/api/v1/auth/crud-operation",
        payload,
        { headers: { "Content-Type": "application/json" } }
      );
      const { clientSecret, subscriptionId, subscription } = response.data;
      setSubscriptionID(subscriptionId);
      setSubscription(subscription);
      setClientSecret(clientSecret);
      localStorage.setItem("client_secret", clientSecret);
      setIsPaymentOpen(true);
    } catch (error) {
      console.error("Error creating subscription client secret:", error);
    } finally {
      setIsFetchingSecret(false);
    }
  };

  const handleSignupSuccess = async (userData: any) => {
    // we update the database and the user in here
    const payload = {
      userID: userData.userID,
      email: formData.email,
      name: formData.fullName,
      phone: formData.phoneNumber,
      application: {
        careStart: formData.careStart,
        type: formData.careTypes,
        languages: formData.languages,
        licenses: formData.licenses,
        location: formData.location,
        notes: formData.notes,
        organizationName: formData.orgName,
        schedule: formData.schedule,
        whoNeedsCare: formData.whoNeedsCare,
        name: formData.fullName,
        phone: formData.phoneNumber,
      },
    };
    try {
      const response = await axios.post(
        `https://api.kinscare.org/api/v1/providers/jumpstart/submit-applcation`,
        payload
      );
      console.log(response);
      // Create the Subscription for the Users
      await createSubscriptionClientSecret(userData.userID);
    } catch (error) {
      console.log(error);
    }
  };

  const percent = Math.round((step / (fieldsPerStep.length - 1)) * 100);

  return (
    <div>
      {/* Progress */}
      <div className=" pt-0 pb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-blue-600">
            Step {step + 1} of 2
          </span>
          <span className="text-sm font-medium text-gray-700">
            {percent}% Complete
          </span>
        </div>
        <Progress value={percent} className="h-2.5 bg-gray-200 rounded-full" />
      </div>

      {/* Form */}
      <div className=" bg-white border-gray-100 ">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-8">
            {step === 0 && (
              <div className="space-y-6">
                {/* Contact Information */}
                <section className="space-y-6 p-5 bg-gray-50 rounded-lg">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center">
                    <span className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                      1
                    </span>
                    Contact Information
                  </h3>
                  <div className="grid text-start py-2 grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <Controller
                        name="fullName"
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            placeholder="John Doe"
                            className={cn(
                              "rounded-lg",
                              errors.fullName && "border-red-500"
                            )}
                          />
                        )}
                      />
                      {errors.fullName && (
                        <p className="text-red-500 text-xs mt-1.5 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1.5" />
                          {errors.fullName.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <Controller
                        name="email"
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            type="email"
                            placeholder="john@example.com"
                            className={cn(
                              "rounded-lg",
                              errors.email && "border-red-500"
                            )}
                          />
                        )}
                      />
                      {errors.email && (
                        <p className="text-red-500 text-xs mt-1.5 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1.5" />
                          {errors.email.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <Controller
                        name="phoneNumber"
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            placeholder="+1234567890"
                            className={cn(
                              "rounded-lg",
                              errors.phoneNumber && "border-red-500"
                            )}
                          />
                        )}
                      />
                      {errors.phoneNumber && (
                        <p className="text-red-500 text-xs mt-1.5 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1.5" />
                          {errors.phoneNumber.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                        Organization Name{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <Controller
                        name="orgName"
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            placeholder="BrightView Home"
                            className={cn(
                              "rounded-lg",
                              errors.orgName && "border-red-500"
                            )}
                          />
                        )}
                      />
                      {errors.orgName && (
                        <p className="text-red-500 text-xs mt-1.5 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1.5" />
                          {errors.orgName.message}
                        </p>
                      )}
                    </div>
                  </div>
                </section>

                {/* Care Needs */}
                <section className="space-y-6 p-5 bg-gray-50 rounded-lg">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center">
                    <span className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                      2
                    </span>
                    Care Needs
                  </h3>
                  <div className="grid text-start py-2 grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                        Who Needs Care? <span className="text-red-500">*</span>
                      </label>
                      <Controller
                        name="whoNeedsCare"
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            placeholder="Elderly parent"
                            className={cn(
                              "rounded-lg",
                              errors.whoNeedsCare && "border-red-500"
                            )}
                          />
                        )}
                      />
                      {errors.whoNeedsCare && (
                        <p className="text-red-500 text-xs mt-1.5 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1.5" />
                          {errors.whoNeedsCare.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                        Location <span className="text-red-500">*</span>
                      </label>
                      <Controller
                        name="location"
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            placeholder="Seattle, WA"
                            className={cn(
                              "rounded-lg",
                              errors.location && "border-red-500"
                            )}
                          />
                        )}
                      />
                      {errors.location && (
                        <p className="text-red-500 text-xs mt-1.5 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1.5" />
                          {errors.location.message}
                        </p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                        Type of Care Needed{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <div
                        className={cn(
                          "rounded-lg",
                          errors.careTypes && "border border-red-500 rounded-lg"
                        )}
                      >
                        <MultiSelectField
                          name="careTypes"
                          control={control}
                          options={careTypes}
                          placeholder="Select care types"
                          maxCount={4}
                          isAnimation={true}
                        />
                      </div>
                      {errors.careTypes && (
                        <p className="text-red-500 text-xs mt-1.5 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1.5" />
                          {errors.careTypes.message}
                        </p>
                      )}
                    </div>
                  </div>
                </section>

                {/* Schedule */}
                <section className="space-y-6 p-5 bg-gray-50 rounded-lg">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center">
                    <span className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                      3
                    </span>
                    Schedule & Requirements
                  </h3>
                  <div className="grid text-start py-2 grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                        Schedule <span className="text-red-500">*</span>
                      </label>
                      <div
                        className={cn(
                          "rounded-lg",
                          errors.schedule && "border border-red-500 rounded-lg"
                        )}
                      >
                        <MultiSelectField
                          name="schedule"
                          control={control}
                          options={groupSchedule}
                          placeholder="Select schedule"
                          maxCount={5}
                          isAnimation={true}
                        />
                      </div>
                      {errors.schedule && (
                        <p className="text-red-500 text-xs mt-1.5 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1.5" />
                          {errors.schedule.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                        Care Start Date <span className="text-red-500">*</span>
                      </label>
                      <Controller
                        name="careStart"
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            type="date"
                            placeholder="ASAP or YYYY-MM-DD"
                            className={cn(
                              "rounded-lg bg-background pr-10",
                              errors.careStart && "border-red-500"
                            )}
                          />
                        )}
                      />
                      {errors.careStart && (
                        <p className="text-red-500 text-xs mt-1.5 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1.5" />
                          {errors.careStart.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                        Required Licenses{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <div
                        className={cn(
                          "rounded-lg",
                          errors.licenses && "border border-red-500 rounded-lg"
                        )}
                      >
                        <MultiSelectField
                          name="licenses"
                          control={control}
                          options={groupLicenses}
                          placeholder="Select licenses"
                          maxCount={4}
                          isAnimation={true}
                        />
                      </div>
                      {errors.licenses && (
                        <p className="text-red-500 text-xs mt-1.5 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1.5" />
                          {errors.licenses.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                        Languages Required
                      </label>
                      <Controller
                        name="languages"
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            placeholder="Spanish, English"
                            className="rounded-lg"
                          />
                        )}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                        Additional Notes
                      </label>
                      <Controller
                        name="notes"
                        control={control}
                        render={({ field }) => (
                          <Textarea
                            {...field}
                            placeholder="Any other important details..."
                            className="rounded-lg min-h-[120px]"
                          />
                        )}
                      />
                    </div>
                  </div>
                </section>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-8">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    <span className="text-blue-600">
                      Premium Caregiver Matching
                    </span>{" "}
                    Package
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                      <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mb-3">
                        <CheckCircle className="text-blue-600 w-6 h-6" />
                      </div>
                      <h3 className="font-bold text-gray-900">
                        3 Pre-Screened Caregivers
                      </h3>
                      <p className="text-gray-600 text-sm mt-1">
                        Professionally vetted candidates
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                      <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mb-3">
                        <CheckCircle className="text-blue-600 w-6 h-6" />
                      </div>
                      <h3 className="font-bold text-gray-900">
                        2 Weeks Unlimited Access
                      </h3>
                      <p className="text-gray-600 text-sm mt-1">
                        Full platform features
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                      <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mb-3">
                        <CheckCircle className="text-blue-600 w-6 h-6" />
                      </div>
                      <h3 className="font-bold text-gray-900">
                        Verified Status
                      </h3>
                      <p className="text-gray-600 text-sm mt-1">
                        Priority in search results
                      </p>
                    </div>
                  </div>
                </div>

                <section className="border rounded-xl overflow-hidden">
                  <div className="bg-gray-50 px-6 py-4 border-b">
                    <h3 className="text-lg font-bold text-gray-900">
                      Your Care Request Summary
                    </h3>
                  </div>
                  <div className="divide-y">
                    {[
                      { label: "Full Name", value: watch("fullName") },
                      { label: "Email", value: watch("email") },
                      { label: "Phone", value: watch("phoneNumber") },
                      { label: "Organization", value: watch("orgName") },
                      { label: "Care Recipient", value: watch("whoNeedsCare") },
                      { label: "Location", value: watch("location") },
                      {
                        label: "Care Types",
                        value: watch("careTypes")?.join(", "),
                      },
                      {
                        label: "Schedule",
                        value: watch("schedule")?.join(", "),
                      },
                      { label: "Start Date", value: watch("careStart") },
                      {
                        label: "Licenses",
                        value: watch("licenses")?.join(", "),
                      },
                      {
                        label: "Languages",
                        value: watch("languages") || "None",
                      },
                      { label: "Notes", value: watch("notes") || "None" },
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-1 md:grid-cols-3 px-6 py-4 hover:bg-gray-50"
                      >
                        <div className="text-sm font-medium text-gray-500">
                          {item.label}
                        </div>
                        <div className="md:col-span-2 text-gray-900 font-medium text-sm">
                          {item.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="mt-8 pt-6 border-t flex justify-between">
            {step > 0 ? (
              <button
                type="button"
                onClick={onBack}
                className="px-5 py-2.5 bg-white text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors flex items-center"
              >
                <ChevronLeft className="w-5 h-5 mr-2" />
                Back
              </button>
            ) : (
              <div></div> // Empty div for spacing
            )}

            {step < 1 ? (
              <Button onClick={onNext}>
                Continue
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            ) : (
              <button
                type="button"
                onClick={() => signupTriggerRef.current?.click()}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg hover:opacity-90 transition-opacity flex items-center shadow-md"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                Confirm & Continue to Payment
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Signup Dialog */}
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

      {/* Payment Dialog */}
      <Dialog open={isPaymentOpen}>
        <DialogContent className="rounded-xl max-w-md">
          {clientSecret && (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <JumpStartPayment
                subscription={subscription}
                plan="bi-weekly"
                subscriptionID={subscriptionID}
                onSuccess={(result) => console.log("Payment success:", result)}
                onError={(error) => console.log("Payment error:", error)}
                close={function (): void {
                  throw new Error("Function not implemented.");
                }}
              />
            </Elements>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default JumpStartForm;
