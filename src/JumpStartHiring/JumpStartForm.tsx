"use client";
// import SignupDialog from "@/Authentication/SignupDialog";
import MultiSelectField from "@/components/MultiSelect";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
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
  Loader2,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { SignOutButton } from "@clerk/nextjs";
import * as yup from "yup";
import JumpStartPayment from "./JumpStartPayment";
import { useApiClient } from "@/hooks/useApiClient";
import { SignUp, useUser } from "@clerk/nextjs";
import { DialogTitle } from "@radix-ui/react-dialog";

const STRIPE_PUBLIC_KEY = process.env.STRIPE_PUBLIC_KEY ?? "";
const stripePromise = loadStripe(STRIPE_PUBLIC_KEY);

interface FormData {
  fullName: string;
  email: string;
  phoneNumber: string;
  orgName?: string;
  city: string;
  zipcode: string;
  schedule: (string | undefined)[];
  licenses: (string | undefined)[];
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

const schema: any = yup.object({
  fullName: yup.string().required("Full name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  phoneNumber: yup
    .string()
    .required("Phone number is required")
    .test("valid-phone", "Invalid phone number", (value) =>
      value ? value.replace(/\D/g, "").length >= 10 : false
    ),
  orgName: yup.string().optional(),
  city: yup.string().required("City is required"),
  zipcode: yup.string().required("Zip code is required"),
  schedule: yup
    .array()
    .of(yup.string())
    .min(1, "Select at least one schedule")
    .required(),
  licenses: yup
    .array()
    .of(yup.string())
    .min(1, "Select at least one license")
    .required(),
  jobDescription: yup.string().required("Job description is required"),
  smsConsent: yup
    .boolean()
    .required()
    .oneOf(
      [true],
      "To continue, please confirm you’d like to receive important updates by text from KinsCare."
    ),
});

interface SubscriptionData {
  id?: string;
}

interface CreateSubscriptionResponse {
  clientSecret: string;
  subscriptionId: string;
  subscription: SubscriptionData;
}

// ---------- Helpers ----------
type Attribution = {
  cio_id?: string | null;
  email?: string | null;
  name?: string | null;
};

const LS_KEY_PREFS = "kc_search_prefs";
const LS_KEY_SIGNUP_PENDING = "jumpstart_signup_pending";

const safeLocalGet = <T,>(key: string): T | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
};

const safeLocalSet = (key: string, value: unknown) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {}
};

const parseFirstLast = (full?: string | null) => {
  if (!full) return { first: undefined, last: undefined };
  const parts = full.trim().split(/\s+/);
  if (parts.length === 1) return { first: parts[0], last: "" };
  return { first: parts[0], last: parts.slice(1).join(" ") };
};

function JumpStartForm() {
  const [step, setStep] = useState(0);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const signupRequestedRef = useRef(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isFetchingSecret, setIsFetchingSecret] = useState(false);
  const [contactData, setContactData] = useState<any>(null);
  const [isGeoLoading, setIsGeoLoading] = useState(false);
  const [zipcode, setZipcode] = useState<string | null>(null);
  const [isSignOutPromptOpen, setIsSignOutPromptOpen] = useState(false);
  const { isSignedIn, user } = useUser();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(
    null
  );
  const [subscriptionID, setSubscriptionID] = useState<string>("");
  const { privateApi } = useApiClient();

  const { toast } = useToast();
  const notify = {
    success: (message: string) => toast({ description: message }),
    error: (message: string) =>
      toast({ variant: "destructive", description: message }),
    warning: (message: string) => toast({ description: message }),
  };

  const searchParams = useSearchParams();

  const saved =
    typeof window !== "undefined"
      ? localStorage.getItem("jumpstartForm")
      : null;
  const defaultValues = saved
    ? JSON.parse(saved)
    : {
        orgName: contactData?.name ? contactData?.name : "",
      };

  const {
    control,
    handleSubmit,
    trigger,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues,
    resolver: yupResolver(schema),
  });

  // Prefill form values: use LS if present, else fetch and use contact data if logged in
  useEffect(() => {
    if (saved || !isSignedIn || !user) return;
    const fetchProfile = async () => {
      try {
        const payload = {
          collectionName: "contacts",
          operation: "findOne",
          filter: { userID: user.id, role: "provider" },
        };
        const res = await privateApi.post("/auth/crud-operation", payload);
        const profile = res.data.result;
        if (profile) {
          setContactData(profile);
          const prefill: Partial<FormData> = {
            fullName: `${profile.fname ?? ""} ${profile.lname ?? ""}`.trim(),
            email: profile.email || "",
            orgName: profile.name || "",
            phoneNumber: profile.tel || "",
            city: profile.city || "",
            zipcode: profile.zipcode || "",
          };
          reset((prev) => ({ ...prev, ...prefill }), { keepDirty: true });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignedIn, user, saved]);

  // Detect signup completion and proceed immediately after Clerk signs in the new user.
  // Persist a flag in localStorage because Clerk redirects after signup, resetting component state.
  useEffect(() => {
    if (!isSignedIn || !user) return;
    const pending =
      signupRequestedRef.current ||
      (typeof window !== "undefined" &&
        window.localStorage.getItem(LS_KEY_SIGNUP_PENDING) === "1");
    if (!pending) return;

    // Reset the flag so we only run once per signup attempt
    signupRequestedRef.current = false;
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(LS_KEY_SIGNUP_PENDING);
    }
    setIsSignupOpen(false);

    const synthetic = {
      userID: user.id,
      email:
        user.primaryEmailAddress?.emailAddress ||
        formData.email ||
        contactData?.email ||
        "",
    };
    handleSignupSuccess(synthetic);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignedIn, user]);

  // Attribution from URL -> persist to LS (shared with your other flows)
  const attribution: Attribution = useMemo(() => {
    const urlCio = searchParams.get("cio_id");
    const urlEmail = searchParams.get("email");
    const urlName =
      searchParams.get("name") ??
      searchParams.get("contact_name") ??
      searchParams.get("Contact%20Name");
    return { cio_id: urlCio, email: urlEmail, name: urlName };
  }, [searchParams]);

  useEffect(() => {
    // Merge into kc_search_prefs
    const prev = safeLocalGet<any>(LS_KEY_PREFS) ?? {};
    const merged = {
      ...prev,
      cio_id: attribution.cio_id ?? prev.cio_id ?? null,
      email: attribution.email ?? prev.email ?? null,
      name: attribution.name ?? prev.name ?? null,
      path:
        typeof window !== "undefined" ? window.location.pathname : prev.path,
      href: typeof window !== "undefined" ? window.location.href : prev.href,
      updatedAt: new Date().toISOString(),
    };
    if (attribution.cio_id || attribution.email || attribution.name) {
      safeLocalSet(LS_KEY_PREFS, merged);
    }

    // Prefill form fields only if they are empty/not already saved by user
    const current = saved ? JSON.parse(saved) : {};
    const next: Partial<FormData> = { ...current };
    if (!current?.fullName && attribution.name) {
      next.fullName = attribution.name;
    }
    if (!current?.email && attribution.email) {
      next.email = attribution.email.toLowerCase();
    }
    if (next.fullName || next.email) {
      reset({ ...current, ...next }, { keepDirty: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // once

  // Persist draft to LS
  useEffect(() => {
    const subscription = watch((data) => {
      try {
        localStorage.setItem("jumpstartForm", JSON.stringify(data));
      } catch {}
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
    // Not used since we gate through Signup/Direct-pay, but keep for safety.
    // console.log("Final payload:", data);
    try {
      localStorage.removeItem("jumpstartForm");
    } catch {}
    setStep(0);
  };

  const formData = watch();

  // Track provider signup (via Customer.io) FIRST, if they came from email
  const trackProviderSignupFirst = async (userID: string) => {
    if (!attribution.cio_id) return; // only if came from your email
    const { first, last } = parseFirstLast(formData.fullName);
    try {
      await axios.post(
        "https://jrp7pe2xhj.us-east-1.awsapprunner.com/api/v1/auth/track-provider-signup",
        {
          cio_id: attribution.cio_id,
          email: formData.email,
          userID,
          first,
          last,
        }
      );
    } catch (err) {
      console.warn("Customer.io tracking failed (jumpstart):", err);
      notify.warning("We couldn't record email attribution. Continuing...");
    }
  };

  const createSubscriptionClientSecret = async (userID: string) => {
    setIsFetchingSecret(true);
    try {
      // Create Stripe subscription
      const response = await axios.post<CreateSubscriptionResponse>(
        "https://jrp7pe2xhj.us-east-1.awsapprunner.com/api/v1/providers/jumpstart/make-payment",
        {
          userID,
          customerEmail: formData.email,
          priceId: "price_1SYRanAoahxG9SLG5HyUbAQ1",
        }
      );

      // Patch user plan
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
      await privateApi.post(
        "https://jrp7pe2xhj.us-east-1.awsapprunner.com/api/v1/auth/crud-operation",
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      const { clientSecret, subscriptionId, subscription } = response.data;
      setSubscriptionID(subscriptionId);
      setSubscription(subscription);
      setClientSecret(clientSecret);
      try {
        localStorage.setItem("client_secret", clientSecret);
      } catch {}
      setIsPaymentOpen(true);
      notify.success("Secured checkout is ready.");
    } catch (error) {
      console.error("Error creating subscription client secret:", error);
      notify.error("Unable to prepare payment. Please try again.");
    } finally {
      setIsFetchingSecret(false);
    }
  };

  const handleSignupSuccess = async (ud: any) => {
    const finalUserID: string = ud?.userID || user?.id || contactData?.id || "";

    if (!finalUserID) {
      notify.error("Could not resolve your user ID. Please sign in again.");
      return;
    }

    // 1) Track goal FIRST for attribution (only if cio_id present)
    await trackProviderSignupFirst(finalUserID);

    // 2) Submit Jumpstart application
    const payload = {
      userID: finalUserID,
      email: formData.email,
      name: formData.fullName,
      phone: formData.phoneNumber,
      application: {
        jobDescription: formData.jobDescription,
        licenses: formData.licenses,
        schedule: formData.schedule,
        city: formData.city,
        zipcode: formData.zipcode,
        orgName: formData.orgName,
      },
    };
    try {
      await axios.post(
        `https://jrp7pe2xhj.us-east-1.awsapprunner.com/api/v1/providers/jumpstart/submit-applcation`,
        payload
      );

      notify.success("Application submitted. Loading payment…");
      // 3) Proceed to payment
      await createSubscriptionClientSecret(finalUserID);
    } catch (error) {
      console.error("Application submit error:", error);
      notify.error("Could not submit application. Please try again.");
    }
  };

  // NEW: Final continue handler — skip signup if already signed in
  const handleFinalContinue = async () => {
    const fields = fieldsPerStep[step];
    const valid = await trigger(fields);
    if (!valid) return;

    if (isSignedIn) {
      if (user.publicMetadata.role === "provider") {
        notify.success("You're signed in — skipping signup.");
        const synthetic = {
          userID: user.id,
          email:
            user.primaryEmailAddress?.emailAddress ||
            formData.email ||
            contactData?.email ||
            "",
        };
        await handleSignupSuccess(synthetic);
      } else {
        const fetchGeo = async () => {
          try {
            setIsGeoLoading(true);
            const response = await axios.get("/api/ip");
            const { zip } = response.data || {};
            setZipcode(zip || "");
          } catch (error) {
            console.error("Failed to retrieve IP data:", error);
            setZipcode("");
          } finally {
            setIsGeoLoading(false);
          }
        };

        fetchGeo();
        setIsSignOutPromptOpen(true);
      }
    } else {
      signupRequestedRef.current = true;
      if (typeof window !== "undefined") {
        window.localStorage.setItem(LS_KEY_SIGNUP_PENDING, "1");
      }
      setIsSignupOpen(true);
    }
  };

  const percent = Math.round((step / (fieldsPerStep.length - 1)) * 100);

  const metadata = {
    role: "provider",
    jumpstart: true,
    signupRoute: "public_job_post",
    apply_metadata: true,
    zipcode: zipcode,
  };

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
                            name={field.name}
                            ref={field.ref}
                            checked={field.value}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            className="form-checkbox h-10 w-10 text-blue-600"
                          />
                          <span className="text-sm text-gray-700">
                            I agree to receive text messages from KinsCare with
                            updates about my application, interview reminders,
                            and important hiring information. Message frequency
                            may vary. Standard message and data rates may apply.
                            We do not share or sell your mobile number. Reply
                            STOP to unsubscribe.
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
          <div className="mt-8 pt-6 border-t flex items-center justify-between">
            {step > 0 ? (
              <Button
                variant="outline"
                onClick={onBack}
                className="px-6 py-2 bg-white text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors flex items-center"
              >
                <ChevronLeft className="w-5 h-5 mr-2" />
                Back
              </Button>
            ) : (
              <div />
            )}

            {step < fieldsPerStep.length - 1 ? (
              <Button
                className="w-full lg:w-auto rounded-xl px-8 py-3 bg-linear-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-300"
                onClick={onNext}
              >
                <ChevronRight className="w-5 h-5 ml-2" /> Continue
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleFinalContinue}
                className="px-8 py-3 bg-linear-to-r from-blue-600 to-indigo-700 text-white rounded-lg hover:opacity-90 transition-opacity flex items-center shadow-md"
                disabled={isFetchingSecret}
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                {isFetchingSecret ? (
                  <>
                    {" "}
                    <Loader2 className="animate-spin" /> Preparing Payment…{" "}
                  </>
                ) : (
                  "Submit"
                )}
              </Button>
            )}
          </div>
        </form>
      </div>

      {/* Signup Dialog */}
      <Dialog open={isSignupOpen} onOpenChange={setIsSignupOpen}>
        <DialogContent className="p-0 max-w-md overflow-hidden rounded-2xl border border-gray-100 shadow-2xl">
          <div className="px-5 pt-5 pb-3 bg-white border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">
              Apply for Jumpstart
            </h3>
            <p className="text-sm text-gray-600">
              Create your provider account to connect with our team and start
              hiring faster.
            </p>
          </div>
          <SignUp
            routing="path"
            path="/jumpstart-hiring/apply"
            unsafeMetadata={metadata}
            fallbackRedirectUrl="/jumpstart-hiring/apply"
            forceRedirectUrl="/jumpstart-hiring/apply"
            appearance={{
              elements: {
                rootBox: "m-0 p-3 w-full",
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
                formButtonPrimary:
                  "bg-blue-600 shadow-xl py-2 border-none hover:bg-blue-500",
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
        </DialogContent>
      </Dialog>
      <Dialog open={isSignOutPromptOpen} onOpenChange={setIsSignOutPromptOpen}>
        <DialogContent className="rounded-xl max-w-md">
          <div className="p-6 text-center">
            <DialogTitle>
              {" "}
              <h3 className="text-lg font-semibold mb-4">
                Account Role Mismatch
              </h3>
            </DialogTitle>
            <p className="text-gray-600 mb-6">
              Only providers can apply for Jumpstart. You are signed in as a
              different role. Please sign out to create a new provider account.
            </p>
            <SignOutButton>
              <Button className="w-full bg-blue-600 text-white hover:bg-blue-700">
                Sign Out
              </Button>
            </SignOutButton>
          </div>
        </DialogContent>
      </Dialog>
      {/* Payment Dialog */}
      <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
        <DialogContent className="rounded-xl max-w-md">
          {clientSecret && (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <JumpStartPayment
                subscription={subscription}
                plan="bi-weekly"
                subscriptionID={subscriptionID}
                formData={formData}
                onSuccess={(result) => {
                  notify.success("Payment successful. Welcome to Jumpstart!");
                  setIsPaymentOpen(false);
                }}
                onError={(error) => {
                  // console.log("Payment error:", error);
                  notify.error("Payment failed. Please try again.");
                }}
                close={() => setIsPaymentOpen(false)}
              />
            </Elements>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default JumpStartForm;
