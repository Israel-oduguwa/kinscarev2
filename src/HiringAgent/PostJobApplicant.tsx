"use client";

import { useAuthContext } from "@/context/AuthContext";
import Editor from "@/components/Editor";
import MultiSelectField from "@/components/MultiSelect";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { yupResolver } from "@hookform/resolvers/yup";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import { useApiClient } from "@/hooks/useApiClient";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";

// ---------- Constants ----------
const API_BASE =
  "https://jrp7pe2xhj.us-east-1.awsapprunner.com/api/v1/providers";

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

const groupAlertPreferences = [
  { label: "Phone Call", value: "Phone_call" },
  { label: "SMS/Text message", value: "SMS/Text message" },
  { label: "Email", value: "Email" },
];

const DAYS = [
  { key: "mon", label: "Mon" },
  { key: "tue", label: "Tue" },
  { key: "wed", label: "Wed" },
  { key: "thu", label: "Thu" },
  { key: "fri", label: "Fri" },
  { key: "sat", label: "Sat" },
  { key: "sun", label: "Sun" },
];

// ---------- Validation ----------
const schema = yup.object({
  firstName: yup.string().trim().required("First name is required"),
  lastName: yup.string().trim().required("Last name is required"),
  address: yup.string().trim().required("Address is required"),
  city: yup.string().trim().required("City is required"),
  state: yup.string().trim().required("State is required"),
  tel: yup
    .string()
    .required(
      "Please enter the telephone number caregivers will use to contact you."
    ),
  email: yup
    .string()
    .email("Enter a valid email")
    .required("Email is required"),
  zipcode: yup
    .string()
    .trim()
    .matches(/^\d{5}(-\d{4})?$/, "Enter a valid US Zipcode")
    .required("Zipcode is required"),
  title: yup.string().trim().required("Job title is required"),
  licenses: yup
    .array()
    .of(yup.string())
    .min(1, "Select at least one license")
    .required("Licenses are required"),
  schedule: yup
    .array()
    .of(yup.string())
    .min(1, "Select at least one schedule option")
    .required("Schedule is required"),
  alert_preferences: yup
    .array()
    .of(yup.string())
    .min(1, "Select at least one alert preference")
    .required("Alert preferences are required"),
  days: yup
    .array()
    .of(
      yup.object({
        key: yup.string().required(),
        label: yup.string().required(),
        checked: yup.boolean().required(),
      })
    )
    .test("at-least-one-day", "Select at least one day", (arr) =>
      Array.isArray(arr) ? arr.some((d) => d.checked) : false
    ),
  minHours: yup
    .number()
    .typeError("Minimum hours must be a number")
    .max(50, "working hours must not be greater than 50 hrs.")
    .nullable()
    .transform((value, originalValue) =>
      originalValue === "" ? null : value
    ),
  compensation: yup
    .string()
    .trim()
    .required("Enter compensation per day/hour or 'DoE' or 'Negotiable'"),
  mobility: yup.string().required("Please select if caregiver needs to drive"),
  smsConsent: yup.boolean(),
  description: yup.string().required("Description is required"),
});

// ---------- Component ----------
export default function PostJobApplicant() {
  // ✅ Safe access to context
  const auth = useAuthContext();
  const {user}:any = useUser();
  // console.log(user.id)
  const userData = auth?.userData ?? null;
// console.log(auth)
  // ✅ Agent ID now guarded
  const agentUserId: string | null = user.id ?? null;

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const params = useParams();
  const id = params?.id as string;
  const isUserId = typeof id === "string" && id.startsWith("user_");
  const router = useRouter();
  const { privateApi } = useApiClient();
  const initialContent = "";

  const [isTwilioSmsProvider, setIsTwilioSmsProvider] = useState<
    boolean | null
  >(null);
  const [providerCheckLoading, setProviderCheckLoading] = useState(false);
  const [providerCheckError, setProviderCheckError] = useState<string | null>(
    null
  );
  const [providerUserId, setProviderUserId] = useState<string | null>(null);
  const [providerHash, setProviderHash] = useState<string | null>(null);
  const [providerProfileImage, setProviderProfileImage] = useState<
    string | null
  >(null);
  const [providerEmail, setProviderEmail] = useState<string | null>(null);
  const [providerExistingAccount, setProviderExistingAccount] = useState<
    boolean | null
  >(null);
  const {
    register,
    control,
    handleSubmit,
    setValue,
    getValues,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onBlur",
    defaultValues: {
      firstName: "",
      lastName: "",
      address: "",
      city: "",
      state: "",
      email: "",
      tel: "",
      zipcode: "",
      title: "",
      licenses: [] as string[],
      schedule: [] as string[],
      alert_preferences: ["SMS/Text message", "Email"],
      days: DAYS.map((d) => ({ ...d, checked: false })),
      minHours: "",
      compensation: "",
      mobility: "car_needed",
      smsConsent: false,
      description: initialContent,
      draft: true,
    },
  });

  // Detect whether the provider is a Twilio SMS signup or a non-SMS provider
  // and capture the provider metadata we need for standard job posting.
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!id) return;
      setProviderCheckLoading(true);
      setProviderCheckError(null);

      let resolvedUserId: string | null = isUserId ? id : null;

      // Try to load provider record (works for Twilio provider IDs as well).
      try {
        const res = await privateApi.get(
          `${API_BASE}/jumpstart/provider/${id}`
        );
        const data = res?.data?.data;
        if (data && !cancelled) {
          const nextUserId =
            data.userID ||
            data.userId ||
            (typeof data._id === "string" ? data._id : null);
          resolvedUserId = nextUserId || resolvedUserId;
          setProviderHash(data.hash || data.temp_hash || null);
          setProviderProfileImage(data.profileImage || null);
          const email =
            data.email ||
            data.contact?.email ||
            data.contacts?.email ||
            data?.provider?.email ||
            null;
          setProviderEmail(email);
          if (email) {
            setValue("email", email);
          }
          const existingAccountFlag =
            typeof data.existingAccount === "boolean"
              ? data.existingAccount
              : typeof data.accountCreated === "boolean"
              ? data.accountCreated
              : !!(data.userID || data.userId);
          setProviderExistingAccount(existingAccountFlag);
        }
      } catch (err: any) {
        // Ignore here; we may be dealing with a Twilio applicant without an account.
      }

      // If no provider record and it's a Twilio applicant ID, try applicant lookup.
      if (!resolvedUserId && !isUserId) {
        try {
          const applicantRes = await privateApi.get(
            `${API_BASE}/jumpstart/applicant/${id}`
          );
          const applicant = applicantRes?.data?.data;
          if (applicant && !cancelled) {
            const nextUserId =
              applicant.linkedUserId ||
              applicant.userID ||
              applicant.userId ||
              (typeof applicant._id === "string" ? applicant._id : null);
            resolvedUserId = nextUserId || resolvedUserId;
            setProviderHash(applicant.hash || applicant.temp_hash || null);
            setProviderProfileImage(applicant.profileImage || null);
            const email =
              applicant.primaryContact?.email ||
              applicant.email ||
              applicant.contact?.email ||
              applicant.contacts?.email ||
              applicant?.provider?.email ||
              null;
            setProviderEmail(email);
            if (email) {
              setValue("email", email);
            }
            const existingAccountFlag =
              typeof applicant.hasAccount === "boolean"
                ? applicant.hasAccount
                : typeof applicant.existingAccount === "boolean"
                ? applicant.existingAccount
                : typeof applicant.accountCreated === "boolean"
                ? applicant.accountCreated
                : !!(applicant.userID || applicant.userId);
            setProviderExistingAccount(existingAccountFlag);
          }
        } catch (err: any) {
          if (!cancelled) {
            setProviderCheckError(
              "Could not load provider/applicant record. Proceeding with fallback check."
            );
          }
        }
      }

      // Check if the provider has a Twilio SMS signup; if the lookup fails,
      // treat it as a non-SMS provider per API contract.
      let twilioFlag: boolean | null = resolvedUserId ? false : true;
      if (resolvedUserId) {
        try {
          const twilioRes = await privateApi.get(
            `${API_BASE}/jumpstart/providers/${resolvedUserId}/twilio-sms`
          );
          const twilioData = twilioRes?.data?.data ?? twilioRes?.data;
          twilioFlag = !!twilioData?.isTwilioSmsProvider;
          if (typeof twilioData?.hasAccount === "boolean") {
            setProviderExistingAccount(twilioData.hasAccount);
          }
        } catch (err) {
          twilioFlag = false;
        }
      }

      if (!cancelled) {
        setProviderUserId(resolvedUserId);
        setIsTwilioSmsProvider(twilioFlag);
        setProviderCheckLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [id, isUserId, privateApi, setValue]);

  // --------- Draft saver (safe no-op now) ---------
  const savetoDB = async (_formData: any) => true;

  const handleFieldUpdate = (name: string, value: any) => {
    setValue(name as any, value, { shouldValidate: true, shouldDirty: true });
    const formData = getValues();
    Object.assign(formData, {
      userID: agentUserId,
      draft: true,
      address: formData.address,
    });
    void savetoDB(formData);
  };

  const onEditorStateChange = (editorState: any) => {
    setValue("description", editorState, {
      shouldValidate: true,
      shouldDirty: true,
    });
    const formData = getValues();
    Object.assign(formData, {
      userID: agentUserId,
      draft: true,
      address: formData.address,
    });
    void savetoDB(formData);
  };

  // --------- Submit to API ----------
  const onSubmit = async (values: any) => {
    setSubmitError(null);
    setSubmitSuccess(null);

    // Extra guard: don't let it submit without a logged-in agent
    if (!agentUserId) {
      setSubmitError("Missing agent user ID. Please sign in again.");
      return;
    }

    if (providerCheckLoading || isTwilioSmsProvider === null) {
      setSubmitError("Checking provider type. Please try again in a moment.");
      return;
    }

    const selectedDays = (values.days || [])
      .filter((d: any) => d.checked)
      .map((d: any) => d.label);

    const contactBlock = {
      firstName: values.firstName,
      lastName: values.lastName,
      address: values.address,
      city: values.city,
      state: values.state,
      zipcode: values.zipcode,
      tel: values.tel,
      email: values.email || providerEmail || undefined,
    };

    const baseJobData = {
      title: values.title,
      licenses: values.licenses,
      schedule: values.schedule,
      alert_preferences: values.alert_preferences,
      days: selectedDays,
      description: values.description,
      minHours: values.minHours,
      compensation: values.compensation,
      mobility: values.mobility,
      smsConsent: values.smsConsent,
      contacts: contactBlock,
    };

    const submitWithAgentPostJob = async () => {
      const jobOwnerUserId =
        providerExistingAccount && providerUserId
          ? providerUserId
          : agentUserId;

      const payload = {
        provider: {
          firstName: values.firstName,
          lastName: values.lastName,
          address: values.address,
          city: values.city,
          state: values.state,
          zipcode: values.zipcode,
        },
        userID: jobOwnerUserId,
        job: {
          title: values.title,
          licenses: values.licenses,
          schedule: values.schedule,
          alert_preferences: values.alert_preferences,
          days: selectedDays,
          description: values.description,
          minHours: values.minHours,
          compensation: values.compensation,
          mobility: values.mobility,
          smsConsent: values.smsConsent,
          contacts: contactBlock,
        },
        meta: {
          createdBy: agentUserId,
          applicantId: id,
          providerUserID: providerUserId || undefined,
          hash: userData?.hash ?? null,
          geocode: userData?.geocode_address ?? null,
          draft: false,
        },
      };

      const res = await privateApi.post(
        `/api/v1/providers/jumpstart/agent-post-job`,
        payload
      );

      if (!res?.data?.ok) {
        const message = res?.data?.error || "Failed to post job.";
        setSubmitError(message);
        toast.error("Job post failed", { description: message });
        return null;
      }

      const job = res.data.data;
      const jobId = job?._id;

      if (!jobId) {
        console.warn("AgentPostJob succeeded but no jobId returned.");
      }

      // --------- Build SMS + send to provider ----------
      try {
        const phoneFromForm = values.tel;
        const toPhone = phoneFromForm;

        if (toPhone && jobId) {
          const jobUrl = `https://www.kinscare.org/job-post/${jobId}`;

          const message =
            `Hi! We have posted your caregiver job opening.\n\n` +
            `Title: ${job.title || "Caregiver job"}\n` +
            `Location: ${job.contacts?.zipcode || ""}\n\n` +
            `Review and approve your job here:\n${jobUrl}`;

          const sms_payload = {
            body: message,
            to: toPhone,
            country: "US",
          };

          await privateApi.post(`/api/v1/twilio/sms/send`, sms_payload);
        } else {
          console.warn("No phone available to send job preview SMS.");
        }
      } catch (smsErr: any) {
        console.error(
          "Failed to send job preview SMS:",
          smsErr?.message || smsErr
        );
        const message =
          "Job posted, but we couldn't send the SMS preview. You may need to resend manually.";
        setSubmitError(message);
        toast.error("SMS failed", { description: message });
      }

      return jobId;
    };

    try {
      const jobId = await submitWithAgentPostJob();
      if (!jobId) return;

      // --------- Success: reset + redirect ----------
      setSubmitSuccess("Job posted successfully.");
      toast.success("Job posted successfully.");

      reset({
        firstName: "",
        lastName: "",
        address: "",
        city: "",
        state: "",
        email: "",
        tel: "",
        zipcode: "",
        title: "",
        licenses: [],
        schedule: [],
        alert_preferences: ["SMS/Text message", "Email"],
        days: DAYS.map((d) => ({ ...d, checked: false })),
        minHours: "",
        compensation: "",
        mobility: "car_needed",
        smsConsent: false,
        description: initialContent,
        agentUserID: agentUserId || "",
        draft: true,
      });

      router.push(`/agent/twilio/provider/${id}`);
    } catch (e: any) {
      console.error("AgentPostJob submit error:", e);
      const message =
        e?.response?.data?.error || e?.message || "Failed to post job.";
      setSubmitError(message);
      toast.error("Job post failed", { description: message });
    }
  };

  return (
    <div className="border p-10 border-slate-200/70 bg-white/80 backdrop-blur shadow-[0_16px_50px_-36px_rgba(15,23,42,0.35)] rounded-2xl">
      {!agentUserId && (
        <Alert className="mb-2" variant="destructive">
          <AlertDescription>
            Agent user ID not found — attribution may be missing.
          </AlertDescription>
        </Alert>
      )}

      {providerCheckLoading && (
        <Alert className="mb-2">
          <AlertDescription>Checking provider type...</AlertDescription>
        </Alert>
      )}

      {providerCheckError && (
        <Alert className="mb-2" variant="destructive">
          <AlertDescription>{providerCheckError}</AlertDescription>
        </Alert>
      )}

      {submitError && (
        <Alert className="mb-2" variant="destructive">
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}

      {submitSuccess && (
        <Alert className="mb-2">
          <AlertDescription>{submitSuccess}</AlertDescription>
        </Alert>
      )}

      <div>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6">
          {/* Job Details */}
          <section className="grid gap-4">
            <h3 className="font-semibold text-gray-900">Job Details</h3>

            <div className="mb-0">
              <label
                htmlFor="job-title"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                Job title
              </label>
              <input
                id="job-title"
                type="text"
                className="bg-gray-50 border border-gray-300 focus-visible:outline-blue-500 text-gray-900 text-sm rounded-lg block w-full p-2.5"
                {...register("title")}
                onBlur={(e) => handleFieldUpdate("title", e.target.value)}
              />
              {errors.title && (
                <p className="text-red-500 text-xs mt-1">
                  {String(errors.title.message)}
                </p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Licenses */}
              <div className="w-full">
                <h3 className="font-semibold text-sm text-gray-900 antialiased mb-2">
                  License(s)
                </h3>
                <Controller
                  control={control}
                  name="licenses"
                  render={({ field }:any) => (
                    <MultiSelectField
                      name="licenses"
                      control={control}
                      isAnimation={true}
                      options={groupLicenses}
                      placeholder="Select licenses"
                      maxCount={4}
                      rules={{ required: true }}
                      value={field.value}
                      onChange={(vals: string[]) => {
                        field.onChange(vals);
                        handleFieldUpdate("licenses", vals);
                      }}
                    />
                  )}
                />
                {errors.licenses && (
                  <p className="text-red-500 text-xs mt-1">
                    {String(errors.licenses.message)}
                  </p>
                )}
              </div>
              {/* Schedule */}
              <div className="w-full">
                <h3 className="font-semibold text-sm text-gray-900 antialiased mb-2">
                  Your Schedule
                </h3>
                <Controller
                  control={control}
                  name="schedule"
                  render={({ field }: any) => (
                    <MultiSelectField
                      name="schedule"
                      control={control}
                      isAnimation={true}
                      options={groupSchedule}
                      placeholder="Select your schedule you want for the job"
                      maxCount={4}
                      rules={{ required: true }}
                      value={field.value}
                      onChange={(vals: string[]) => {
                        field.onChange(vals);
                        handleFieldUpdate("schedule", vals);
                      }}
                    />
                  )}
                />
                {errors.schedule && (
                  <p className="text-red-500 text-xs mt-1">
                    {String(errors.schedule.message)}
                  </p>
                )}
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {/* Days */}
              <div className="w-full">
                <h3 className="font-semibold text-sm text-gray-900 antialiased mb-2">
                  Days
                </h3>
                <Controller
                  control={control}
                  name="days"
                  render={({ field }: any) => (
                    <div className="flex flex-wrap gap-3">
                      {(field.value || []).map((d: any, idx: number) => (
                        <label
                          key={d.key}
                          className="inline-flex items-center gap-2 border rounded-md px-3 py-2"
                        >
                          <input
                            type="checkbox"
                            className="h-4 w-4"
                            checked={!!d.checked}
                            onChange={(e) => {
                              const next = [...field.value];
                              next[idx] = { ...d, checked: e.target.checked };
                              field.onChange(next);
                              handleFieldUpdate("days", next);
                            }}
                          />
                          <span className="text-sm">{d.label}</span>
                        </label>
                      ))}
                    </div>
                  )}
                />
                {errors.days && (
                  <p className="text-red-500 text-xs mt-1">
                    {String(errors.days.message)}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="tel"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="tel"
                  className="bg-gray-50 border border-gray-300 focus-visible:outline-blue-500 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  required
                  {...register("tel")}
                  onBlur={(e) => {
                    handleFieldUpdate(e.target.name, e.target.value);
                  }}
                />
                {errors?.tel && (
                  <p className="text-red-500 text-xs">
                    {String(errors?.tel.message)}
                  </p>
                )}
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label
                  htmlFor="min-hours"
                  className="block mb-2 text-sm font-medium text-gray-900"
                >
                  Minimum hours per week
                </label>
                <input
                  type="number"
                  id="min-hours"
                  className="bg-gray-50 border border-gray-300 focus-visible:outline-blue-500 text-gray-900 text-sm rounded-lg block w-full p-2.5"
                  {...register("minHours")}
                  onBlur={(e) => handleFieldUpdate("minHours", e.target.value)}
                />
                {errors?.minHours && (
                  <p className="text-red-500 text-xs mt-1">
                    {String(errors?.minHours.message)}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="compensation"
                  className="block mb-2 text-sm font-medium text-gray-900"
                >
                  Compensation
                </label>
                <input
                  type="text"
                  id="compensation"
                  className="bg-gray-50 border border-gray-300 focus-visible:outline-blue-500 text-gray-900 text-sm rounded-lg block w-full p-2.5"
                  {...register("compensation")}
                  onBlur={(e) =>
                    handleFieldUpdate("compensation", e.target.value)
                  }
                />
                {errors?.compensation && (
                  <p className="text-red-500 text-xs mt-1">
                    {String(errors?.compensation.message)}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Provider Identity */}
          <section className="grid gap-4">
            <h3 className="font-semibold text-gray-900">Provider Identity</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label
                  htmlFor="first-name"
                  className="block mb-2 text-sm font-medium text-gray-900"
                >
                  First Name
                </label>
                <input
                  id="first-name"
                  type="text"
                  className="bg-gray-50 border border-gray-300 focus-visible:outline-blue-500 text-gray-900 text-sm rounded-lg block w-full p-2.5"
                  {...register("firstName")}
                  onBlur={(e) => handleFieldUpdate("firstName", e.target.value)}
                />
                {errors.firstName && (
                  <p className="text-red-500 text-xs mt-1">
                    {String(errors.firstName.message)}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="last-name"
                  className="block mb-2 text-sm font-medium text-gray-900"
                >
                  Last Name
                </label>
                <input
                  id="last-name"
                  type="text"
                  className="bg-gray-50 border border-gray-300 focus-visible:outline-blue-500 text-gray-900 text-sm rounded-lg block w-full p-2.5"
                  {...register("lastName")}
                  onBlur={(e) => handleFieldUpdate("lastName", e.target.value)}
                />
                {errors.lastName && (
                  <p className="text-red-500 text-xs mt-1">
                    {String(errors.lastName.message)}
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="address"
                    className="block mb-2 text-sm font-medium text-gray-900"
                  >
                    Address
                  </label>
                  <input
                    id="address"
                    type="text"
                    className="bg-gray-50 border border-gray-300 focus-visible:outline-blue-500 text-gray-900 text-sm rounded-lg block w-full p-2.5"
                    {...register("address")}
                    onBlur={(e) =>
                      handleFieldUpdate("address", e.target.value)
                    }
                  />
                  {errors.address && (
                    <p className="text-red-500 text-xs mt-1">
                      {String(errors.address.message)}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label
                  htmlFor="city"
                  className="block mb-2 text-sm font-medium text-gray-900"
                >
                  City
                </label>
                <input
                  id="city"
                  type="text"
                  className="bg-gray-50 border border-gray-300 focus-visible:outline-blue-500 text-gray-900 text-sm rounded-lg block w-full p-2.5"
                  {...register("city")}
                  onBlur={(e) => handleFieldUpdate("city", e.target.value)}
                />
                {errors.city && (
                  <p className="text-red-500 text-xs mt-1">
                    {String(errors.city.message)}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="state"
                  className="block mb-2 text-sm font-medium text-gray-900"
                >
                  State
                </label>
                <input
                  id="state"
                  type="text"
                  className="bg-gray-50 border border-gray-300 focus-visible:outline-blue-500 text-gray-900 text-sm rounded-lg block w-full p-2.5"
                  {...register("state")}
                  onBlur={(e) => handleFieldUpdate("state", e.target.value)}
                />
                {errors.state && (
                  <p className="text-red-500 text-xs mt-1">
                    {String(errors.state.message)}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="zipcode"
                  className="block mb-2 text-sm font-medium text-gray-900"
                >
                  Zipcode
                </label>
                <input
                  id="zipcode"
                  inputMode="numeric"
                  className="bg-gray-50 border border-gray-300 focus-visible:outline-blue-500 text-gray-900 text-sm rounded-lg block w-full p-2.5"
                  {...register("zipcode")}
                  onBlur={(e) => handleFieldUpdate("zipcode", e.target.value)}
                />
                {errors.zipcode && (
                  <p className="text-red-500 text-xs mt-1">
                    {String(errors.zipcode.message)}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block mb-2 text-sm font-medium text-gray-900"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  className="bg-gray-50 border border-gray-300 focus-visible:outline-blue-500 text-gray-900 text-sm rounded-lg block w-full p-2.5"
                  {...register("email")}
                  onBlur={(e) => handleFieldUpdate("email", e.target.value)}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">
                    {String(errors.email.message)}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Description */}
          <section className="grid gap-3">
            <div className="w-full prose-lg prose-h3:my-2 prose-blockquote:my-2 discussion-content max-w-[100%]">
              <p className="block mb-2 text-sm font-medium text-gray-900">
                Please enter job description and required certifications such as
                CPR/First Aid, Food Handler's etc.
              </p>
              <Controller
                control={control}
                name="description"
                render={({ field }) => (
                  <Editor
                    onChange={(val: any) => {
                      field.onChange(val);
                      onEditorStateChange(val);
                    }}
                    initialContent={initialContent}
                    usage="poss"
                  />
                )}
              />
              {errors.description && (
                <p className="text-red-500 text-xs mt-1">
                  {String(errors.description.message)}
                </p>
              )}
            </div>
          </section>

          <section className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="font-semibold text-sm text-gray-900 antialiased mb-2">
                  Does the job require caregiver to drive?
                </h3>
                <Controller
                  name="mobility"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        handleFieldUpdate("mobility", value);
                      }}
                      className="flex gap-4"
                    >
                      <div className="flex gap-1 items-center">
                        <RadioGroupItem value="car_needed" />
                        <Label>Yes</Label>
                      </div>
                      <div className="flex gap-1 items-center">
                        <RadioGroupItem value="no_car_needed" />
                        <Label>No</Label>
                      </div>
                    </RadioGroup>
                  )}
                />
                {errors.mobility && (
                  <p className="text-red-500 text-xs mt-1">
                    {String(errors.mobility.message)}
                  </p>
                )}
              </div>
              <div className="md:pt-7">
                <Controller
                  name="smsConsent"
                  control={control}
                  render={({ field }) => (
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        {...field}
                        checked={field.value}
                        className="form-checkbox h-5 w-5 text-blue-600"
                      />
                      <span className="text-sm text-gray-700">
                        We’ll text you if a provider wants to interview you or
                        respond to your application. Message & data rates may
                        apply. Reply STOP to opt out.
                      </span>
                    </label>
                  )}
                />
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-gray-900 antialiased mb-2">
                Alert preferences
              </h3>
              <Controller
                name="alert_preferences"
                control={control}
                render={({ field }: any) => (
                  <MultiSelectField
                    name="alert_preferences"
                    control={control}
                    isAnimation={true}
                    options={groupAlertPreferences}
                    placeholder="How should caregivers contact you?"
                    maxCount={3}
                    rules={{ required: true }}
                    value={field.value}
                    onChange={(vals: string[]) => {
                      field.onChange(vals);
                      handleFieldUpdate("alert_preferences", vals);
                    }}
                  />
                )}
              />
              {errors.alert_preferences && (
                <p className="text-red-500 text-xs mt-1">
                  {String(errors.alert_preferences.message)}
                </p>
              )}
            </div>
          </section>

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="submit"
              disabled={
                isSubmitting || !agentUserId || providerCheckLoading
              }
            >
              {isSubmitting ? "Posting..." : "Post Job"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
