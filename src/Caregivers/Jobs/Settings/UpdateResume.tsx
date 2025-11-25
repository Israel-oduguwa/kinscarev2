"use client";

import MultiSelectField from "@/components/MultiSelect";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuthContext } from "@/context/AuthContext";
import {
  fetchContactsData,
  fetchUserData
} from "@/lib/utils";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  AlertCircle,
  Camera,
  Cloud,
  Loader,
  LoaderCircle,
  UserRound,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Dropzone from "react-dropzone";
import TagManager from "react-gtm-module";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
// SONNER for UX
import { useApiClient } from "@/hooks/useApiClient";
import { useClerk, useUser } from "@clerk/nextjs";
import { toast as notify } from "sonner";
// import DeleteAccount from "@/Providers/User/DeleteAccount";

// ----------------- Validation -----------------
// Helper: turn "" -> null for optional strings
const emptyToNull = (v: unknown) =>
  typeof v === "string" ? (v.trim() === "" ? null : v) : v;

const schema = yup.object({
  fname: yup.string().required("First name is required"),
  lname: yup.string().required("Last name is required"),
  city: yup.string().required("City is required"),
  zipcode: yup.string().required("Zipcode is required"),
  mobility: yup.string().required("Mobility option is required"),
  settings: yup.object({
    alert_preferences: yup
      .array()
      .min(1, "Select at least one way to be contacted.")
      .required("required"),
    email: yup
      .string()
      .email("Must be a valid email")
      .max(255)
      .required("Email is required"),
    tel: yup.string().required("Please enter your phone number"),
    role: yup.string(),
  }),
  licenses: yup
    .array()
    .of(yup.string())
    .min(1, "Select at least one license.")
    .required("License is required."),
  certifications: yup
    .string()
    .min(10, "Certification description must be at least 10 characters.")
    .max(500, "Certification description can't exceed 500 characters.")
    .required("Certification is required."),
  availability: yup
    .array()
    .of(yup.string())
    .min(1, "Select at least one availability option")
    .required("Availability is required."),
  // Make profile image OPTIONAL; if present, validate as URL
  profileImage: yup
    .mixed()
    .transform(emptyToNull)
    .nullable()
    .test(
      "is-url-or-null",
      "Invalid image URL",
      (val) => val === null || typeof val === "string"
    ),
  resumeDocument: yup.mixed().transform(emptyToNull).nullable(),
  smsConsent: yup
    .boolean()
    .required()
    .oneOf(
      [true],
      "Please confirm that you’d like to receive important updates via text from KinsCare."
    ),
});

// ----------------- Options -----------------
const licenseOptions = [
  { value: "CNA", label: "CNA or NAC" },
  { value: "HCA", label: "HCA" },
  { value: "NAR", label: "NAR" },
  { value: "None", label: "None" },
];
const groupAvalability = [
  { label: "Full time", value: "Full time" },
  { label: "Part time", value: "Part time" },
  { label: "Weekends", value: "Weekends" },
  { label: "On Call", value: "On Call" },
  { label: "Live In", value: "Live In" },
];
const groupAlert = [
  { label: "Phone Call", value: "Phone_call" },
  { label: "SMS/Text message", value: "SMS/Text message" },
  { label: "Email", value: "Email" },
];

const isHostedStorageUrl = (url?: string | null) => {
  if (!url) return false;
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase();
    // adjust to your exact bucket/CF domain(s)
    const OUR_HOSTS = [
      "kinscare-storage.s3.amazonaws.com",
      // "cdn.kinscare.com", // if you serve via CloudFront, add it here
    ];
    // also allow generic s3 path patterns for your bucket (optional)
    const isS3Pattern =
      (host.endsWith(".amazonaws.com") || host.includes("s3")) &&
      u.pathname.startsWith("/kinscare-storage");

    return OUR_HOSTS.includes(host) || isS3Pattern;
  } catch {
    return false;
  }
};

// ----------------- Component -----------------
const CaregiverProfileForm = () => {
  const authData: any = useAuthContext();
  const { userData, contactData, setContactData, setUserData, refreshData } =
    authData || {};
  const clerk = useClerk();
  const { user } = useUser();
  const router = useRouter();
  const { privateApi } = useApiClient();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      fname: "",
      lname: "",
      settings: {
        alert_preferences: [],
        role: "caregiver",
        tel: "",
        email: "",
      },
      certifications: "",
      city: "",
      licenses: [],
      mobility: "has_car",
      zipcode: "",
      availability: [],
      profileImage: null as string | null,
      resumeDocument: null as string | null,
      smsConsent:  Boolean(user?.publicMetadata.smsConsent),
    },
    mode: "onSubmit",
  });


  const [resumePreview, setResumePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [documentLoading, setDocumentLoading] = useState(false);
  // console.log(profileImagePreview);

  // --------- Populate defaults once we have stable userData ----------
  useEffect(() => {
    if (!userData) return;

    try {
      reset({
        fname:
          userData?.complete || userData?.fname ? userData?.fname ?? "" : "",
        lname:
          userData?.complete || userData?.lname ? userData?.lname ?? "" : "",
        settings: {
          alert_preferences: userData?.complete
            ? userData?.settings?.alert_preferences ?? []
            : [],
          role: "caregiver",
          tel: userData?.complete
            ? userData?.settings?.tel ?? ""
            : userData?.auth?.tel ?? "",
          email: userData?.complete
            ? userData?.settings?.email ?? ""
            : userData?.auth?.email ?? "",
        },
        certifications:
          userData?.complete || userData?.certifications
            ? userData?.certifications ?? ""
            : "",
        city: userData?.complete || userData?.city ? userData?.city ?? "" : "",
        licenses:
          userData?.complete || userData?.licenses
            ? userData?.licenses ?? []
            : [],
        mobility: userData?.complete
          ? userData?.mobility ?? "has_car"
          : "has_car",
        zipcode:
          (userData?.complete || userData?.zipcode ? userData?.zipcode : "") ??
          "",
        availability: userData?.complete ? userData?.availability ?? [] : [],
        profileImage:
          (userData?.complete || userData?.profileImage
            ? userData?.profileImage
            : null) ?? null,
        resumeDocument:
          userData?.complete && userData?.resumeDocument
            ? userData?.resumeDocument
            : null,
        smsConsent: Boolean(user?.publicMetadata.smsConsent),
      });

      setResumePreview(userData?.resumeDocument ?? null);
    } catch (e: any) {
      notify.error(
        "We couldn’t load your profile fully. You can continue editing or refresh."
      );
      console.error("Prefill error:", e);
    }
  }, [userData, reset]);
  
  const handleResumeUpload = async (files: File[]) => {
    const file = files?.[0];
    if (!file) return;

    try {
      setDocumentLoading(true);
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await privateApi.post("/api/v1/upload-file", formData);
      const url = data?.url ?? "";
      setValue("resumeDocument", url, { shouldDirty: true });
      setResumePreview(url);
      notify.success("Resume uploaded successfully.");
    } catch (error: any) {
      notify.error(
        error?.response?.data?.message ||
          error?.message ||
          "Error uploading resume."
      );
    } finally {
      setDocumentLoading(false);
    }
  };

  // ----------------- Delete File -----------------
  const deleteFile = async (url: string | null, type: "image" | "resume") => {
    if (!url) return;
    const hosted = isHostedStorageUrl(url);
    try {
      if (type === "image") setImageLoading(true);
      else setDocumentLoading(true);
      if (hosted) {
        // console.log(hosted)
        await privateApi.post("/api/v1/delete-file", { fileUrl: url });
      }
      if (type === "image") {
        setValue("profileImage", null);
        notify.info("Profile image removed.");
      } else {
        setResumePreview(null);
        setValue("resumeDocument", null);
        notify.info("Resume removed.");
      }
    } catch (error: any) {
      notify.error(
        error?.response?.data?.message ||
          error?.message ||
          "Error deleting file."
      );
    } finally {
      if (type === "image") setImageLoading(false);
      else setDocumentLoading(false);
    }
  };

  // ----------------- Submit -----------------
  const onSubmit = async (data: any) => {
    if (!userData) {
      notify.info("You’re signed out. Redirecting to sign up…");
      router.replace("/signup");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...data,
        name: `${data.fname} ${data.lname}`.trim(),
        complete: true,
        hash: contactData?.hash ?? undefined,
      };

      await privateApi.post(
        `/api/v1/caregivers/resume/update/${userData?.userID}`,
        payload,
        {}
      );

      notify.success("Profile updated successfully.");

      // Fire GTM only if profile was already complete (avoid double fire on first save)
      if (userData?.complete) {
        TagManager.dataLayer({
          dataLayer: {
            event: "add_cv",
            settings: userData?.settings,
            lname: userData?.lname,
            fname: userData?.fname,
            tel: userData?.auth?.tel ?? userData?.settings?.tel ?? "",
            zipcode: userData?.zipcode ?? "",
            city: userData?.city ?? "",
            email: userData?.auth?.email ?? userData?.settings?.email ?? "",
          },
        });
      }

      // Refresh local state
      const fetchedData: any = await fetchUserData(
        userData?.userID,
        userData?.email ?? userData?.auth?.email ?? ""
      ).catch(() => null);
      if (fetchedData?.result) setUserData(fetchedData.result);

      const updatedData = await fetchContactsData(
        contactData?.userID,
        contactData?.email
      ).catch(() => null);
      if (updatedData?.result) await setContactData(updatedData.result);

      // Navigate to jobs (soft reload follows)
      router.push("/vitae/jobs/all");
      setTimeout(() => {
        if (typeof window !== "undefined") window.location.reload();
      }, 1200);
    } catch (error: any) {
      notify.error(
        error?.response?.data?.message ||
          error?.message ||
          "Error updating profile."
      );
    } finally {
      setLoading(false);
    }
  };

  // Limits / types for Dropzone
  const IMG_MAX_BYTES = 1 * 1024 * 1024; // 1MB
  const DOC_MAX_BYTES = 3 * 1024 * 1024; // 3MB

  return (
    <div className="bg-gray-100 px-0 md:px-4">
      <div className="py-3 md:py-6 lg:py-10">
        <div className="max-w-7xl mx-auto py-6 sm:py-8 px-3 sm:px-5 md:px-8 rounded-lg shadow-lg bg-white">
          <div className="mb-5">
            <h2 className="font-bold text-xl text-gray-900">
              Update your resume
            </h2>
            <p className="text-sm antialiased text-gray-700">
              Update your profile so providers can match with you faster.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-16">
            {/* Form Section */}
            <div className="lg:col-span-2 w-full">
              <form
                autoComplete="off"
                className="space-y-5"
                onSubmit={handleSubmit(onSubmit)}
              >
                {/* Contact Information */}
                <div className="mb-2">
                  <div className="mb-2">
                    <h3 className="font-semibold text-gray-900">
                      Contact information
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="mb-0">
                      <label
                        htmlFor="first-name"
                        className="block mb-2 text-sm font-medium text-gray-900"
                      >
                        First name
                      </label>
                      <input
                        type="text"
                        id="first-name"
                        className="bg-gray-50 border border-gray-300 focus-visible:outline-blue-500 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                        required
                        {...register("fname")}
                      />
                      {errors.fname && (
                        <p className="text-red-500 text-xs">
                          {String(errors.fname.message)}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="last-name"
                        className="block mb-2 text-sm font-medium text-gray-900"
                      >
                        Last name
                      </label>
                      <input
                        type="text"
                        id="last-name"
                        className="bg-gray-50 border border-gray-300 focus-visible:outline-blue-500 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                        required
                        {...register("lname")}
                      />
                      {errors.lname && (
                        <p className="text-red-500 text-xs">
                          {String(errors.lname.message)}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label
                        htmlFor="email"
                        className="block mb-2 text-sm font-medium text-gray-900"
                      >
                        Email
                      </label>
                      <input
                        type="email"
                        autoComplete="new-password"
                        id="email"
                        className="bg-gray-50 border border-gray-300 focus-visible:outline-blue-500 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                        required
                        {...register("settings.email")}
                      />
                      {errors.settings?.email && (
                        <p className="text-red-500 text-xs">
                          {String(errors.settings.email.message)}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="tel"
                        className="block mb-2 text-sm font-medium text-gray-900"
                      >
                        Telephone
                      </label>
                      <input
                        type="tel"
                        id="tel"
                        autoComplete="new-password"
                        className="bg-gray-50 border border-gray-300 focus-visible:outline-blue-500 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                        required
                        {...register("settings.tel")}
                      />
                      {errors.settings?.tel && (
                        <p className="text-red-500 text-xs">
                          {String(errors.settings.tel.message)}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label
                        htmlFor="city"
                        className="block mb-2 text-sm font-medium text-gray-900"
                      >
                        City
                      </label>
                      <input
                        type="text"
                        id="city"
                        className="bg-gray-50 border border-gray-300 focus-visible:outline-blue-500 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                        required
                        {...register("city")}
                      />
                      {errors.city && (
                        <p className="text-red-500 text-xs">
                          {String(errors.city.message)}
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
                        type="text"
                        id="zipcode"
                        className="bg-gray-50 border border-gray-300 focus-visible:outline-blue-500 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                        required
                        {...register("zipcode")}
                      />
                      {errors.zipcode && (
                        <p className="text-red-500 text-xs">
                          {String(errors.zipcode.message)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Licenses */}
                <div>
                  <h3 className="font-semibold text-gray-900 antialiased mb-2">
                    What licenses do you have
                  </h3>
                  <MultiSelectField
                    name="licenses"
                    control={control}
                    isAnimation={true}
                    options={licenseOptions}
                    placeholder="Select licenses"
                    maxCount={4}
                    rules={{ required: true }}
                  />
                  {errors.licenses && (
                    <p className="text-red-500 text-xs">
                      {String(errors.licenses.message)}
                    </p>
                  )}
                </div>

                {/* Certifications */}
                <div>
                  <h3 className="font-semibold text-md">Bio/Certifications</h3>
                  <p className="text-sm antialiased mb-2 text-gray-700">
                    Give employers your experience, certifications, study
                    overview and what you want.
                  </p>
                  <Controller
                    name="certifications"
                    control={control}
                    render={({ field }) => (
                      <textarea
                        {...field}
                        id="certifications"
                        rows={6}
                        placeholder="Write your certifications here..."
                        className="block p-2.5 w-full text-sm focus-visible:outline-blue-500 text-gray-900 bg-gray-50 rounded-sm border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                      />
                    )}
                  />
                  {errors.certifications && (
                    <p className="text-red-500 text-xs">
                      {String(errors.certifications.message)}
                    </p>
                  )}
                </div>

                {/* Availability */}
                <div>
                  <h3 className="font-semibold text-gray-900 antialiased mb-2">
                    Your availability
                  </h3>
                  <MultiSelectField
                    name="availability"
                    control={control}
                    isAnimation={true}
                    options={groupAvalability}
                    placeholder="Select your preferred schedule"
                    maxCount={4}
                    rules={{ required: true }}
                  />
                  {errors.availability && (
                    <p className="text-red-500 text-xs">
                      {String(errors.availability.message)}
                    </p>
                  )}
                </div>

                {/* Alert Preferences */}
                <div>
                  <h3 className="font-semibold text-gray-900 antialiased mb-2">
                    How do you want employers to contact you?
                  </h3>
                  <MultiSelectField
                    name="settings.alert_preferences"
                    control={control}
                    isAnimation={true}
                    options={groupAlert}
                    placeholder="Your alert preferences"
                    maxCount={4}
                    rules={{ required: true }}
                  />
                  {errors.settings?.alert_preferences && (
                    <p className="text-red-500 text-xs">
                      {String(errors.settings.alert_preferences.message)}
                    </p>
                  )}
                </div>

                {/* Mobility */}
                <div>
                  <h3 className="font-semibold text-md mb-2">
                    Do you have a car?
                  </h3>
                  <Controller
                    name="mobility"
                    control={control}
                    render={({ field }) => (
                      <RadioGroup
                        value={field.value}
                        onValueChange={(value) => field.onChange(value)}
                        className="flex gap-6"
                      >
                        <div className="flex gap-2 items-center">
                          <RadioGroupItem
                            value="has_car"
                            className="border-gray-600"
                          />
                          <Label>Yes</Label>
                        </div>
                        <div className="flex gap-2 items-center">
                          <RadioGroupItem
                            value="no_car"
                            className="border-gray-600"
                          />
                          <Label>No</Label>
                        </div>
                      </RadioGroup>
                    )}
                  />
                  {errors.mobility && (
                    <p className="text-red-500 text-xs">
                      {String(errors.mobility.message)}
                    </p>
                  )}
                </div>

                {/* SMS Consent */}
                <div className="md:col-span-2 mt-4">
                  <Controller
                    name="smsConsent"
                    control={control}
                    render={({ field }) => (
                      <label className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          name={field.name}
                          ref={field.ref}
                          checked={Boolean(field.value)}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          className="form-checkbox h-5 w-5 text-blue-600 mt-0.5"
                        />
                        <span className="text-sm text-gray-700">
                          I agree to receive text messages from KinsCare with
                          updates about my profile, job opportunities, and
                          important hiring information. Message frequency may
                          vary. Standard message and data rates may apply. We do
                          not share or sell your mobile number. Reply STOP to
                          unsubscribe.
                        </span>
                      </label>
                    )}
                  />
                  {errors.smsConsent && (
                    <p className="text-red-500 text-xs mt-1.5 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1.5" />
                      {String(errors.smsConsent.message)}
                    </p>
                  )}
                </div>

                {/* Submit (desktop) */}
                <Button
                  type="submit"
                  disabled={loading || isSubmitting}
                  className="w-full hidden gap-2 lg:flex"
                >
                  {(loading || isSubmitting) && (
                    <LoaderCircle className="animate-spin" />
                  )}{" "}
                  {loading || isSubmitting ? "Updating..." : "Update Profile"}
                </Button>
              </form>
            </div>

            {/* Profile Image & Resume Section */}
            <div className="lg:sticky lg:top-10">
              {/* Profile Image Upload */}
              <div className="mb-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold">Profile Image </h3>
                    <p className="text-sm antialiased mb-2 text-gray-700">
                      Add a clear photo to build trust and get noticed faster.
                    </p>
                  </div>
                </div>

                <div className="w-full">
                  <div onClick={() => clerk.openUserProfile()} className="border-4 p-2 border-gray-200 rounded-full w-36 h-36 sm:w-40 sm:h-40 relative mx-auto">
                    <Avatar className="rounded-full w-full h-full">
                      <AvatarImage
                        src={user?.imageUrl || "/default-avatar.png"}
                        alt="profile-image"
                      />
                      <AvatarFallback className="bg-gray-100">
                        <UserRound className="w-8 h-8 text-gray-500" />
                      </AvatarFallback>
                    </Avatar>
                     <Button
                      onClick={() => clerk.openUserProfile()}
                      className="absolute top-14 right-14 bg-gray-800 text-white rounded-full"
                      size="icon"
                      type="button"
                      variant="ghost"
                      aria-label="Edit profile image"
                    >
                      <Camera size={18} />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Resume Upload */}
              <div>
                <h3 className="font-semibold text-md mb-2">Resume</h3>
                <p className="text-sm antialiased mb-3 text-gray-700">
                  Attach your resume to boost your chances of getting connected
                  faster.
                </p>

                {resumePreview ? (
                  <div className="relative">
                    <iframe
                      src={resumePreview}
                      className="w-full h-[420px] rounded-md border"
                    />
                    <Button
                      onClick={() => deleteFile(resumePreview, "resume")}
                      className="absolute -top-4 right-0 bg-gray-800 text-white rounded-full"
                      size="icon"
                      type="button"
                      variant="ghost"
                      aria-label="Remove resume"
                    >
                      <X
                        className={`${documentLoading ? "animate-spin" : ""}`}
                        size={18}
                      />
                    </Button>
                  </div>
                ) : (
                  <Dropzone
                    onDrop={(acceptedFiles) =>
                      handleResumeUpload(acceptedFiles)
                    }
                    onDropRejected={(rejections) => {
                      const r = rejections?.[0];
                      if (r?.errors?.[0]?.code === "file-too-large") {
                        notify.error("File too large. Max size is 3 MB.");
                      } else if (r?.errors?.[0]?.code === "file-invalid-type") {
                        notify.error(
                          "Unsupported file type. Use PDF/DOC/DOCX."
                        );
                      } else {
                        notify.error(
                          "Could not add resume. Try a different file."
                        );
                      }
                    }}
                    disabled={documentLoading}
                    accept={{
                      "application/pdf": [".pdf"],
                      "application/msword": [".doc"],
                      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                        [".docx"],
                    }}
                    maxSize={DOC_MAX_BYTES}
                    multiple={false}
                  >
                    {({ getRootProps, getInputProps, isDragActive }) => (
                      <div
                        {...getRootProps()}
                        className={`p-4 border-2 border-dashed rounded-lg text-center cursor-pointer transition
                        ${
                          isDragActive
                            ? "border-blue-300 bg-blue-50"
                            : "border-gray-300 bg-white"
                        }`}
                      >
                        {documentLoading ? (
                          <Loader className="animate-spin mx-auto" />
                        ) : (
                          <>
                            <input
                              {...getInputProps()}
                              aria-label="Upload resume"
                            />
                            <div className="flex flex-col items-center gap-3">
                              <Cloud className="w-5 h-5 text-gray-500" />
                              <p className="text-xs antialiased text-gray-700">
                                Drag and drop resume here (PDF/DOCX) or click to
                                select
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </Dropzone>
                )}

                {/* Submit (mobile) */}
                <div className="mt-6">
                  <Button
                    disabled={loading || isSubmitting}
                    onClick={handleSubmit(onSubmit)}
                    className="w-full flex gap-2 lg:hidden"
                  >
                    {(loading || isSubmitting) && (
                      <LoaderCircle className="animate-spin" />
                    )}{" "}
                    {loading || isSubmitting ? "Updating..." : "Update Profile"}
                  </Button>
                </div>
              </div>
              {/* End sidebar */}
            </div>
          </div>
        </div>
      </div>

      {/* <div className="bg-white shadow-sm my-10 rounded-lg p-8">
        <DeleteAccount />
      </div> */}
    </div>
  );
};

export default CaregiverProfileForm;
