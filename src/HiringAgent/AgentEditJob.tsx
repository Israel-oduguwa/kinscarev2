"use client";

import { useAuthContext } from "@/context/AuthContext";
import Editor from "@/components/Editor";
import MultiSelectField from "@/components/MultiSelect";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { yupResolver } from "@hookform/resolvers/yup";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import { useApiClient } from "@/hooks/useApiClient";

// ---------- Constants ----------
const API_BASE =
  "http://localhost:8081/api/v1/providers";

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

const DEFAULT_ALERT_PREFERENCES = ["SMS/Text message", "Email"];

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
export default function AgentEditJob() {
  const { userData } = useAuthContext();
  const agentUserId: string | null = userData?.userID ?? null;
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { privateApi } = useApiClient();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [initialContent, setInitialContent] = useState("");
  const [editorKey, setEditorKey] = useState(0);
  const [applicantId, setApplicantId] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
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
      zipcode: "",
      tel: "",
      title: "",
      licenses: [] as string[],
      schedule: [] as string[],
      alert_preferences: DEFAULT_ALERT_PREFERENCES,
      days: DAYS.map((d) => ({ ...d, checked: false })),
      minHours: "",
      compensation: "",
      mobility: "car_needed",
      smsConsent: false,
      description: "",
    },
  });

  const loadJob = async () => {
    if (!id) return;
    setLoading(true);
    setLoadError(null);
    setSubmitError(null);

    try {
      const res = await privateApi.get(
        `${API_BASE}/jumpstart/agent-jobs/${id}`
      );
      const job = res?.data?.data;

      if (!job) {
        throw new Error("Job not found.");
      }

      const contacts = job.contacts || {};
      const jobDays = Array.isArray(job.days) ? job.days : [];
      const alertPreferences = Array.isArray(job.alert_preferences)
        ? job.alert_preferences
        : DEFAULT_ALERT_PREFERENCES;
      const nextDays = DAYS.map((d) => ({
        ...d,
        checked: jobDays.includes(d.label),
      }));

      setApplicantId(job?.agentMeta?.applicantId || job?.applicantId || null);
      reset({
        firstName: contacts.firstName || "",
        lastName: contacts.lastName || "",
        address: contacts.address || "",
        city: contacts.city || "",
        state: contacts.state || "",
        zipcode: contacts.zipcode || "",
        tel: contacts.tel || "",
        email: contacts.email || "",
        title: job.title || "",
        licenses: Array.isArray(job.licenses) ? job.licenses : [],
        schedule: Array.isArray(job.schedule) ? job.schedule : [],
        alert_preferences: alertPreferences,
        days: nextDays,
        description: job.description || "",
        minHours: job.minHours ?? "",
        compensation: job.compensation || "",
        mobility: job.mobility || "car_needed",
        smsConsent:
          typeof job.smsConsent === "boolean" ? job.smsConsent : false,
      });

      setInitialContent(job.description || "");
      setEditorKey((k) => k + 1);
    } catch (err: any) {
      const message =
        err?.response?.data?.error || err?.message || "Failed to load job.";
      setLoadError(message);
      toast({
        variant: "destructive",
        title: "Failed to load job",
        description: message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJob();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const onEditorStateChange = (editorState: any) => {
    setValue("description", editorState, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const onSubmit = async (values: any) => {
    setSubmitError(null);

    if (!agentUserId) {
      const message = "Missing agent user ID. Please sign in again.";
      setSubmitError(message);
      toast({ variant: "destructive", title: "Missing agent", description: message });
      return;
    }

    const selectedDays = (values.days || [])
      .filter((d: any) => d.checked)
      .map((d: any) => d.label);

    const contacts = {
      firstName: values.firstName,
      lastName: values.lastName,
      address: values.address,
      city: values.city,
      state: values.state,
      zipcode: values.zipcode,
      tel: values.tel,
      email: values.email || undefined,
    };

    const payload: any = {
      jobId: id,
      agentUserID: agentUserId,
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
        contacts,
      },
    };

    if (applicantId) {
      payload.applicantId = applicantId;
    }

    try {
      const res = await privateApi.post(
        `${API_BASE}/jumpstart/agent-edit-job`,
        payload
      );

      if (!res?.data?.ok) {
        throw new Error(res?.data?.error || "Failed to update job.");
      }

      toast({ title: "Job updated", description: "Changes saved successfully." });

      const updatedJob = res?.data?.data?.job;
      if (updatedJob) {
        const updatedContacts = updatedJob.contacts || contacts;
        const updatedDays = Array.isArray(updatedJob.days)
          ? updatedJob.days
          : selectedDays;
        reset({
          firstName: updatedContacts.firstName || values.firstName,
          lastName: updatedContacts.lastName || values.lastName,
          address: updatedContacts.address || values.address,
          city: updatedContacts.city || values.city,
          state: updatedContacts.state || values.state,
          zipcode: updatedContacts.zipcode || values.zipcode,
          tel: updatedContacts.tel || values.tel,
          email: updatedContacts.email || values.email,
          title: updatedJob.title || values.title,
          licenses: Array.isArray(updatedJob.licenses)
            ? updatedJob.licenses
            : values.licenses,
          schedule: Array.isArray(updatedJob.schedule)
            ? updatedJob.schedule
            : values.schedule,
          alert_preferences: Array.isArray(updatedJob.alert_preferences)
            ? updatedJob.alert_preferences
            : values.alert_preferences,
          days: DAYS.map((d) => ({
            ...d,
            checked: updatedDays.includes(d.label),
          })),
          description: updatedJob.description || values.description,
          minHours: updatedJob.minHours ?? values.minHours,
          compensation: updatedJob.compensation || values.compensation,
          mobility: updatedJob.mobility || values.mobility,
          smsConsent:
            typeof updatedJob.smsConsent === "boolean"
              ? updatedJob.smsConsent
              : values.smsConsent,
        });
        setInitialContent(updatedJob.description || values.description);
        setEditorKey((k) => k + 1);
      }

      router.push(`/agent/jobs/${id}`);
    } catch (err: any) {
      const message =
        err?.response?.data?.error || err?.message || "Failed to update job.";
      setSubmitError(message);
      toast({ variant: "destructive", title: "Update failed", description: message });
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl">
        <div className="grid gap-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-full" />
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="max-w-7xl">
        <Alert className="mb-4" variant="destructive">
          <AlertDescription>{loadError}</AlertDescription>
        </Alert>
        <Button onClick={loadJob}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl">
      {!agentUserId && (
        <Alert className="mb-2" variant="destructive">
          <AlertDescription>
            Agent user ID not found — updates may fail.
          </AlertDescription>
        </Alert>
      )}

      {submitError && (
        <Alert className="mb-2" variant="destructive">
          <AlertDescription>{submitError}</AlertDescription>
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
                  render={({ field }: any) => (
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
                  className="bg-gray-50 border border-gray-300 focus-visible:outline-blue-500 text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  required
                  {...register("tel")}
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
                  />
                  {errors.address && (
                    <p className="text-red-500 text-xs mt-1">
                      {String(errors.address.message)}
                    </p>
                  )}
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
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">
                      {String(errors.email.message)}
                    </p>
                  )}
                </div>
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
                    key={editorKey}
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
                      onValueChange={(value) => field.onChange(value)}
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
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/agent/jobs/${id}`)}
            >
              Back to Job
            </Button>
            <Button type="submit" disabled={isSubmitting || !agentUserId}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
