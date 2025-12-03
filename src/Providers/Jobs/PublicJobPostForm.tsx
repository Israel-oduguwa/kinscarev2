"use client";
import React, { useState, useRef, useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import axios from "axios";
import { toast } from "@/components/ui/use-toast";
import { CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import MultiSelectField from "@/components/MultiSelect";
import Editor from "@/components/Editor";

import TagManager from "react-gtm-module";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useRouter, useSearchParams } from "next/navigation";
import { useApiClient } from "@/hooks/useApiClient";
import { SignUp, useUser } from "@clerk/nextjs";

// ---------------- Validation Schema ----------------
const jobSchema: any = Yup.object().shape({
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

// ---------------- Options ----------------
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

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ||
  "https://jrp7pe2xhj.us-east-1.awsapprunner.com";

const LS_KEY_PREFS = "kc_search_prefs";
const LS_KEY_FORM_DATA = "publicJobPostData";

// ---------------- LocalStorage Helpers ----------------
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

const safeLocalRemove = (key: string) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {}
};

// ---------------- PublicJobPostForm ----------------
const PublicJobPostForm = ({
  onSubmit,
  defaultValues,
  isPosting,
}: {
  onSubmit: (data: any) => void;
  defaultValues: any;
  isPosting: boolean;
}) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    clearErrors,
    formState: { errors },
  }: any = useForm({
    resolver: yupResolver(jobSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues,
  });

  useEffect(() => {
    const subscription = watch((value: any) => {
      safeLocalSet(LS_KEY_FORM_DATA, value);
      clearErrors();
    });
    return () => subscription.unsubscribe();
  }, [watch, clearErrors]);

  const submitHandler = (data: any) => {
    safeLocalRemove(LS_KEY_FORM_DATA);
    onSubmit(data);
  };

  const onEditorStateChange = (editorState: any) => {
    setValue("description", editorState, { shouldValidate: true });
  };

  const descriptionValue = watch("description");

  return (
    <div className="py-8 px-4 md:px-8 rounded-2xl shadow-lg bg-white">
      <form onSubmit={handleSubmit(submitHandler)} className="space-y-8">
        {/* Job Details */}
        <div className="space-y-6">
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
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.title.message}
              </p>
            )}
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
                initialContent={descriptionValue || ""}
                usage="job_description"
              />
            </div>
            {errors.description && (
              <p className="text-red-500 text-sm mt-2 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.description.message}
              </p>
            )}
          </div>
        </div>

        {/* Requirements */}
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
                  <AlertCircle className="h-4 w-4 mr-1" />
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
                  <AlertCircle className="h-4 w-4 mr-1" />
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
                  <AlertCircle className="h-4 w-4 mr-1" />
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
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.compensation.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Contact Info */}
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
                  <AlertCircle className="h-4 w-4 mr-1" />
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
                  <AlertCircle className="h-4 w-4 mr-1" />
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
                  <AlertCircle className="h-4 w-4 mr-1" />
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
                  <AlertCircle className="h-4 w-4 mr-1" />
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
                  <AlertCircle className="h-4 w-4 mr-1" />
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
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.minHours.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Submit */}
        <CardFooter className="flex justify-center px-0 pt-2 pb-0">
          <Button
            type="submit"
            className="w-full shadow-xl py-6"
            disabled={isPosting}
          >
            {isPosting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              "Post Job Opening"
            )}
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

// ---------------- PublicJobPostPage (UPDATED WITH PROPER LOADING) ----------------
const PublicJobPostPage = () => {
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [isJobCreating, setIsJobCreating] = useState(false); // Track job creation loading

  const [zipcode, setZipcode] = useState<string | null>(null);
  const [city, setCity] = useState<string | null>(null);
  const [region_name, setRegionName] = useState<string | null>(null);
  const [country_code, setCountryCode] = useState<string | null>(null);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [ip, setIp] = useState<string | null>(null);

  const [isGeoLoading, setIsGeoLoading] = useState(false);

  const mountedRef = useRef(true);
  const hasPostedRef = useRef(false); // guard against double submissions
  const { privateApi } = useApiClient();
  const router = useRouter();
  const { isSignedIn, user, isLoaded: isClerkLoaded } = useUser();
  const searchParams = useSearchParams();

  const savedFormData = useMemo(
    () => safeLocalGet<any>(LS_KEY_FORM_DATA) ?? {},
    []
  );

  const mergedAttribution = useMemo(() => {
    const urlCio = searchParams.get("cio_id");
    const urlEmail = searchParams.get("email");
    const urlName =
      searchParams.get("name") ??
      searchParams.get("contact_name") ??
      searchParams.get("Contact%20Name");
    const urlUtmSource = searchParams.get("utm_source");
    const urlUtmMedium = searchParams.get("utm_medium");
    const urlUtmCampaign = searchParams.get("utm_campaign");

    const ls = safeLocalGet<any>(LS_KEY_PREFS) ?? {};

    return {
      cio_id: urlCio ?? ls?.cio_id ?? null,
      email: urlEmail ?? ls?.email ?? null,
      name: urlName ?? ls?.name ?? null,
      utm_source: urlUtmSource ?? ls?.utm_source ?? null,
      utm_medium: urlUtmMedium ?? ls?.utm_medium ?? null,
      utm_campaign: urlUtmCampaign ?? ls?.utm_campaign ?? null,
      landing_path:
        ls?.path ??
        (typeof window !== "undefined" ? window.location.pathname : null),
      landing_href:
        ls?.href ??
        (typeof window !== "undefined" ? window.location.href : null),
    };
  }, [searchParams]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Fetch Geo Data
  useEffect(() => {
    const controller = new AbortController();
    let timeoutId: any = null;

    const fetchGeo = async () => {
      try {
        if (!mountedRef.current) return;
        setIsGeoLoading(true);

        timeoutId = setTimeout(() => controller.abort(), 7000);

        const res = await axios.get("/api/ip", {
          signal: controller.signal,
          headers: { "Cache-Control": "no-cache" },
        });

        const data = res?.data || {};

        const zip =
          data.zip ??
          data.zipcode ??
          data.postal ??
          data.postal_code ??
          "";
        const _city = data.city ?? data.town ?? data.locality ?? "";
        const lat = data.latitude ?? data.lat ?? null;
        const lng = data.longitude ?? data.lng ?? null;
        const ccode = data.country_code ?? data.countryCode ?? "";
        const rname =
          data.region_name ?? data.region ?? data.state ?? data.state_prov ?? "";
        const _ip = data.ip ?? data.query ?? "";

        if (!mountedRef.current) return;

        setZipcode(zip || "");
        setCity(_city || "");
        setLatitude(typeof lat === "number" ? lat : null);
        setLongitude(typeof lng === "number" ? lng : null);
        setCountryCode(ccode || "");
        setRegionName(rname || "");
        setIp(_ip || "");
      } catch (err) {
        console.error("Geo fetch failed:", err);
      } finally {
        if (timeoutId) clearTimeout(timeoutId);
        if (mountedRef.current) setIsGeoLoading(false);
      }
    };

    fetchGeo();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      controller.abort();
    };
  }, []);

  // After successful signup → post job if form data exists
  useEffect(() => {
    if (isSignedIn && user && isClerkLoaded) {
      const savedData = safeLocalGet<any>(LS_KEY_FORM_DATA);
      if (savedData && !isJobCreating) {
        maybePostJob({
          userID: user.id,
          hash: (user.publicMetadata as any)?.hash || "",
        });
      }
      setIsSignupOpen(false); // Close dialog after signup
    }
  }, [isSignedIn, user, isClerkLoaded]);

  // If already signed in as provider on mount → auto-post saved job
  useEffect(() => {
    if (isSignedIn && user?.publicMetadata?.role === "provider" && isClerkLoaded) {
      const savedData = safeLocalGet<any>(LS_KEY_FORM_DATA);
      if (savedData && !isJobCreating) {
        maybePostJob({
          userID: user.id,
          hash: (user.publicMetadata as any)?.hash || "",
        });
      }
    }
  }, [isSignedIn, user, isClerkLoaded]);

  const handleFormSubmit = (data: any) => {
    safeLocalSet(LS_KEY_FORM_DATA, data);

    if (isSignedIn && user?.publicMetadata?.role === "provider") {
      maybePostJob({
        userID: user.id,
        hash: (user.publicMetadata as any)?.hash || "",
      });
    } else {
      setIsSignupOpen(true);
    }
  };

  const maybePostJob = (ud: { userID: string; hash: string }) => {
    if (hasPostedRef.current || isJobCreating) return;
    hasPostedRef.current = true;
    void postJob(ud);
  };

  const postJob = async (ud: { userID: string; hash: string }) => {
    if (isJobCreating) return; // Prevent double submission

    setIsJobCreating(true);

    try {
      const formData = safeLocalGet<any>(LS_KEY_FORM_DATA);
      if (!formData) {
        toast({ variant: "destructive", description: "Form data missing." });
        hasPostedRef.current = false;
        return;
      }

      const rawDesc = (formData.description || "").toString();
      const strippedDesc = rawDesc.replace(/<[^>]*>/g, "").trim();
      if (!strippedDesc) {
        toast({
          variant: "destructive",
          description: "Job description cannot be empty.",
        });
        hasPostedRef.current = false;
        return;
      }
      const cleanedDesc = rawDesc.trim();

      const payload = {
        ...formData,
        draft: false,
        userID: ud.userID,
        settings: {
          email: formData.contacts.email,
          tel: formData.contacts.tel,
        },
        certifications: "",
        description: cleanedDesc,
        hash: ud.hash,
        profileImage: "",
      };

      const response = await privateApi.post("/api/v1/providers/post-job", payload);

      toast({ title: "Job Posted Successfully!", variant: "default" });

      TagManager.dataLayer({
        dataLayer: {
          event: "post_job",
          type: "post",
          ...payload,
        },
      });

      safeLocalRemove(LS_KEY_FORM_DATA);
      router.push(`/provider/job/${response.data.jobId}`);
    } catch (error: any) {
      console.error("Error posting job:", error);
      toast({
        variant: "destructive",
        title: "Failed to post job",
        description: error?.response?.data?.message || error?.message || "Please try again.",
      });
      hasPostedRef.current = false;
    } finally {
      setIsJobCreating(false);
    }
  };

  const unsafeMetadata = {
    role: "provider",
    signup_route: "public_job_post",
    apply_metadata: true,
    zipcode: zipcode || undefined,
    city: city || undefined,
    geocode_address: {
      lng: longitude ?? undefined,
      lat: latitude ?? undefined,
    },
    address: `${city || ""}, ${region_name || ""}, ${country_code || ""}`.trim(),
    userIp: ip || undefined,
    acquisition_channel: mergedAttribution.utm_source || "email",
    utm_source: mergedAttribution.utm_source ?? null,
    utm_medium: mergedAttribution.utm_medium ?? null,
    utm_campaign: mergedAttribution.utm_campaign ?? null,
    landing_path: mergedAttribution.landing_path ?? null,
    landing_href: mergedAttribution.landing_href ?? null,
    attribution_cio_id: mergedAttribution.cio_id ?? null,
    attribution_email: mergedAttribution.email ?? null,
    attribution_name: mergedAttribution.name ?? null,
    api_base: API_BASE,
  };

  // Determine final loading state for button
  const isLoading = isJobCreating || (isSignupOpen && !isSignedIn);

  return (
    <div>
      <PublicJobPostForm
        onSubmit={handleFormSubmit}
        defaultValues={savedFormData}
        isPosting={isLoading} // This controls the button spinner
      />

      <Dialog open={isSignupOpen} onOpenChange={setIsSignupOpen}>
        <DialogContent className="p-0 max-w-md overflow-hidden rounded-2xl border border-gray-100 shadow-2xl">
          <div className="px-5 pt-5 bg-white">
            <h3 className="text-lg font-semibold text-gray-900">Finish creating your job</h3>
            <p className="text-sm text-gray-600">
              Create your provider account to publish and manage this posting.
            </p>
          </div>
          <div className="p-5">
            {isGeoLoading && (
              <div className="mb-3 flex items-center gap-2 text-sm text-gray-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                Detecting your location…
              </div>
            )}

            {isJobCreating ? (
              <div className="text-center py-6">
                <Loader2 className="h-10 w-10 animate-spin mx-auto text-blue-600" />
                <p className="mt-4 text-lg font-medium">Creating your job post...</p>
                <p className="text-sm text-gray-500">This won't take long!</p>
              </div>
            ) : (
              <SignUp
                unsafeMetadata={unsafeMetadata}
                routing="virtual"
                afterSignUpUrl={window.location.pathname}
                afterSignInUrl={window.location.pathname}
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
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PublicJobPostPage;
