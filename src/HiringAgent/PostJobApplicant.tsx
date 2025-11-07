"use client";

import MongoContext from "@/app/MongoContext";
import Editor from "@/components/Editor";
import MultiSelectField from "@/components/MultiSelect";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { useContext, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
// ---------- Constants ----------
const API_BASE = "https://jrp7pe2xhj.us-east-1.awsapprunner.com/api/v1/providers";

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
  //   category: yup.string().trim().required("Category is required"),
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
  const { userData }: any = useContext(MongoContext);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  // Agent ID to attribute posts
  const agentUserId: any = userData.userID;

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
      //   category: "",
      schedule: [] as string[],
      days: DAYS.map((d) => ({ ...d, checked: false })),
      description: initialContent,
      // metadata you mentioned
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
        // category: values.category,
        schedule: values.schedule,
        days: selectedDays,
        description: values.description,
      },
      meta: {
        createdBy: agentUserId, // agent user id for metadata
        applicantId: id,
        hash: userData?.hash,
        geocode: userData.geocode_address,
        draft: false,
      },
    };

    try {
      const res = await axios.post(
        `${API_BASE}/jumpstart/agent-post-job`,
        payload
      );
      if (res?.data?.ok) {
        setSubmitSuccess("Job posted successfully.");
        // Optionally reset form after success
        reset({
          firstName: "",
          lastName: "",
          address: "",
          state: "",
          zipcode: "",
          title: "",
          licenses: [],
          //   category: "",
          schedule: [],
          days: DAYS.map((d) => ({ ...d, checked: false })),
          description: initialContent,
          agentUserID: agentUserId || "",
          draft: true,
        });
        router.push(`/agent/twilio/provider/${id}`);
      } else {
        setSubmitError(res?.data?.error || "Failed to post job.");
      }
    } catch (e: any) {
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
                  render={({ field }) => (
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
                  render={({ field }) => (
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

            {/* Days */}
            <div className="w-full">
              <h3 className="font-semibold text-sm text-gray-900 antialiased mb-2">
                Days
              </h3>
              <Controller
                control={control}
                name="days"
                render={({ field }) => (
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
