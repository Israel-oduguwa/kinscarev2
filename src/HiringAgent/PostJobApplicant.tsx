"use client";

import { useAuthContext } from "@/context/AuthContext";
import Editor from "@/components/Editor";
import MultiSelectField from "@/components/MultiSelect";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import { useApiClient } from "@/hooks/useApiClient";

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
  state: yup.string().trim().required("State is required"),
  tel: yup
    .string()
    .required(
      "Please enter the telephone number caregivers will use to contact you."
    ),
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
  description: yup.string().required("Description is required"),
});

// ---------- Component ----------
export default function PostJobApplicant() {
  // ✅ Safe access to context
  const auth = useAuthContext();
  const userData = auth?.userData ?? null;

  // ✅ Agent ID now guarded
  const agentUserId: string | null = userData?.userID ?? null;

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { privateApi } = useApiClient();
  const initialContent = "";

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
      state: "",
      zipcode: "",
      title: "",
      licenses: [] as string[],
      schedule: [] as string[],
      days: DAYS.map((d) => ({ ...d, checked: false })),
      description: initialContent,
      draft: true,
    },
  });

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

    const selectedDays = (values.days || [])
      .filter((d: any) => d.checked)
      .map((d: any) => d.label);

    const payload = {
      provider: {
        firstName: values.firstName,
        lastName: values.lastName,
        address: values.address,
        state: values.state,
        zipcode: values.zipcode,
      },
      userID: agentUserId,
      job: {
        title: values.title,
        licenses: values.licenses,
        schedule: values.schedule,
        days: selectedDays,
        description: values.description,
      },
      meta: {
        createdBy: agentUserId,
        applicantId: id,
        hash: userData?.hash ?? null,
        geocode: userData?.geocode_address ?? null,
        draft: false,
      },
    };

    try {
      const res = await privateApi.post(
        `/api/v1/providers/jumpstart/agent-post-job`,
        payload
      );
      console.log(res.data);
      if (!res?.data?.ok) {
        setSubmitError(res?.data?.error || "Failed to post job.");
        return;
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
        setSubmitError(
          "Job posted, but we couldn't send the SMS preview. You may need to resend manually."
        );
      }

      // --------- Success: reset + redirect ----------
      setSubmitSuccess("Job posted successfully.");

      reset({
        firstName: "",
        lastName: "",
        address: "",
        state: "",
        zipcode: "",
        title: "",
        licenses: [],
        schedule: [],
        days: DAYS.map((d) => ({ ...d, checked: false })),
        description: initialContent,
        agentUserID: agentUserId || "",
        draft: true,
      });

      router.push(`/agent/twilio/provider/${id}`);
    } catch (e: any) {
      console.error("AgentPostJob submit error:", e);
      setSubmitError(
        e?.response?.data?.error || e?.message || "Failed to post job."
      );
    }
  };

  return (
    <div className="max-w-7xl">
      {!agentUserId && (
        <Alert className="mb-2" variant="destructive">
          <AlertDescription>
            Agent user ID not found — attribution may be missing.
          </AlertDescription>
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
                  type="number"
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

            <div className="grid gap-4 md:grid-cols-4">
              <div className="md:col-span-2">
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
                  onBlur={(e) => handleFieldUpdate("address", e.target.value)}
                />
                {errors.address && (
                  <p className="text-red-500 text-xs mt-1">
                    {String(errors.address.message)}
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

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="submit" disabled={isSubmitting || !agentUserId}>
              {isSubmitting ? "Posting..." : "Post Job"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
