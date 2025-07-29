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
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
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
  orgName?: string;
  city: string;
  zipcode: string;
  schedule: string[];
  licenses: string[];
  jobDescription: string;
  smsConsent: boolean;
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
    .required("Phone number is required")
    .test("valid-phone", "Invalid phone number", (value) =>
      value ? value.replace(/\D/g, "").length >= 10 : false
    ),
  orgName: yup.string().notRequired(),
  city: yup.string().required("City is required"),
  zipcode: yup.string().required("Zip code is required"),
  schedule: yup.array().min(1, "Select at least one schedule"),
  licenses: yup.array().min(1, "Select at least one license"),
  jobDescription: yup.string().required("Job description is required"),
  smsConsent: yup
    .boolean().required()
    .oneOf([true], "To continue, please confirm you’d like to receive important updates by text from KinsCare."),
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

  const fieldsPerStep: (keyof FormData)[][] = [
    ["fullName", "email", "phoneNumber", "orgName", "city", "zipcode"],
    ["schedule", "licenses", "jobDescription", "smsConsent"],
  ];

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
    const payload = {
      userID: userData.userID,
      email: watch("email"),
      name: watch("fullName"),
      phone: watch("phoneNumber"),
      application: {
        jobDescription: watch("jobDescription"),
        licenses: watch("licenses"),
        schedule: watch("schedule"),
        city: watch("city"),
        zipcode: watch("zipcode"),
        orgName: watch("orgName"),
      },
    };
    try {
      const response = await axios.post(
        `https://api.kinscare.org/api/v1/providers/jumpstart/submit-applcation`,
        payload
      );
      console.log(response);
      await createSubscriptionClientSecret(userData.userID);
    } catch (error) {
      console.log(error);
    }
  };

  const percent = Math.round((step / (fieldsPerStep.length - 1)) * 100);

  return (
    <div>
      {/* Progress */}
      <div className="pt-0 pb-4">
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
      <div className="bg-white border-gray-100">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-8">
            {step === 0 && (
              <section className="space-y-6 p-5 bg-gray-50 rounded-lg">
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                  <span className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                    1
                  </span>
                  Contact Information
                </h3>
                <div className="grid text-start py-2 grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-900">
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
                    <label className="block mb-2 text-sm font-medium text-gray-900">
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
                    <label className="block mb-2 text-sm font-medium text-gray-900">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <Controller
                      name="phoneNumber"
                      control={control}
                      render={({ field }) => (
                        <PhoneInput
                          {...field}
                          id="tel"
                          placeholder="Enter phone number"
                          defaultCountry="US"
                          international
                          className={cn(
                            "rounded-lg pr-10 input input-bordered w-full",
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
                    <label className="block mb-2 text-sm font-medium text-gray-900">
                      Organization Name{" "}
                    </label>
                    <Controller
                      name="orgName"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder="BrightView Home"
                          className="rounded-lg"
                        />
                      )}
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-900">
                      City <span className="text-red-500">*</span>
                    </label>
                    <Controller
                      name="city"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder="Seattle"
                          className={cn(
                            "rounded-lg",
                            errors.city && "border-red-500"
                          )}
                        />
                      )}
                    />
                    {errors.city && (
                      <p className="text-red-500 text-xs mt-1.5 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1.5" />
                        {errors.city.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-900">
                      Zip Code <span className="text-red-500">*</span>
                    </label>
                    <Controller
                      name="zipcode"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder="98101"
                          className={cn(
                            "rounded-lg",
                            errors.zipcode && "border-red-500"
                          )}
                        />
                      )}
                    />
                    {errors.zipcode && (
                      <p className="text-red-500 text-xs mt-1.5 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1.5" />
                        {errors.zipcode.message}
                      </p>
                    )}
                  </div>
                </div>
              </section>
            )}

            {step === 1 && (
              <section className="space-y-6 p-5 bg-gray-50 rounded-lg">
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                  <span className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                    2
                  </span>
                  Schedule & Requirements
                </h3>
                <div className="grid text-start py-2 grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-900">
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
                    <label className="block mb-2 text-sm font-medium text-gray-900">
                      Required Licenses <span className="text-red-500">*</span>
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
                  <div className="md:col-span-2">
                    <label className="block mb-2 text-sm font-medium text-gray-900">
                      Please provide a detailed job description for the
                      caregiving role that includes key information such as the
                      desired care start date, any language requirements for the
                      caregiver, and clearly specify who needs care. This will
                      help us find the perfect match.
                      <span className="text-red-500">*</span>
                    </label>
                    <Controller
                      name="jobDescription"
                      control={control}
                      render={({ field }) => (
                        <Textarea
                          {...field}
                          rows={10}
                          placeholder="Describe the role, who needs care, start date, language requirements, and other important details…"
                          className={cn(
                            "rounded-lg min-h-[120px]",
                            errors.jobDescription && "border-red-500"
                          )}
                        />
                      )}
                    />
                    {errors.jobDescription && (
                      <p className="text-red-500 text-xs mt-1.5 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1.5" />
                        {errors.jobDescription.message}
                      </p>
                    )}
                  </div>
                  <div className="md:col-span-2 mt-4">
                    <Controller
                      name="smsConsent"
                      control={control}
                      render={({ field }) => (
                        <label className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            {...field}
                            checked={field.value}
                            className="form-checkbox h-10 w-10 text-blue-600"
                          />
                          <span className="text-sm text-gray-700">
                          I agree to receive text messages from KinsCare with updates about my application, interview reminders, and important hiring information. Message frequency may vary. Standard message and data rates may apply. We do not share or sell your mobile number. Reply STOP to unsubscribe.
                          </span>
                        </label>
                      )}
                    />
                    {errors.smsConsent && (
                      <p className="text-red-500 text-xs mt-1.5 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1.5" />
                        {errors.smsConsent.message}
                      </p>
                    )}
                  </div>
                </div>
              </section>
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
              <div></div>
            )}

            {step < fieldsPerStep.length - 1 ? (
              <Button onClick={onNext}>
                Continue
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={async () => {
                  const fields = fieldsPerStep[step];
                  const valid = await trigger(fields);
                  if (valid) {
                    signupTriggerRef.current?.click();
                  }
                }}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg hover:opacity-90 transition-opacity flex items-center shadow-md"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                Continue
              </Button>
            )}
          </div>
        </form>
      </div>
      {/* Signup Dialog */}
      <SignupDialog
        role="provider"
        jumpstart={true}
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