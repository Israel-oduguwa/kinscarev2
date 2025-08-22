"use client";

import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import Dropzone from "react-dropzone";
import MultiSelectField from "@/components/MultiSelect";
import MongoContext from "@/app/MongoContext";
import {
  AlertCircle,
  Camera,
  Cloudy,
  Loader,
  LoaderCircle,
  X,
} from "lucide-react";
import {
  fetchContactsData,
  fetchUserData,
  getValidAccessTokenFromContext,
} from "@/lib/utils";
import TagManager from "react-gtm-module";
import { useRouter } from "next/navigation";
// Use SONNER for info/warning/error UX
import { toast as notify } from "sonner";
import DeleteAccount from "@/Providers/User/DeleteAccount";

// ----------------- Validation -----------------
const schema = yup.object().shape({
  fname: yup.string().required("First name is required"),
  lname: yup.string().required("Last name is required"),
  city: yup.string().required("City is required"),
  zipcode: yup.string().required("Zipcode is required"),
  mobility: yup.string().required("Mobility option is required"),
  settings: yup.object().shape({
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
  profileImage: yup.string().required("Image URL is required"),
  resumeDocument: yup.string().optional(),
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

// ----------------- Component -----------------
const CaregiverProfileForm = () => {
  const mongodb: any = useContext(MongoContext);
  const { user, userData, setCustomData, setUserData } = mongodb || {};
  const router = useRouter();

  const hasShownSignedOutNotice = useRef(false);

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
      profileImage: "",
      resumeDocument: "",
      smsConsent: false,
    },
  });

  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(
    null
  );
  const [resumePreview, setResumePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [documentLoading, setDocumentLoading] = useState(false);

  // --------- Guard: if signed out, show info + redirect safely ----------
  useEffect(() => {
    // If auth is missing, don't touch nested fields; just inform + redirect.
    if (!user || !userData) {
      if (!hasShownSignedOutNotice.current) {
        notify("You’re signed out. Redirecting to sign up…");
        hasShownSignedOutNotice.current = true;
      }
      const t = setTimeout(() => router.replace("/signup"), 900);
      return () => clearTimeout(t);
    }
  }, [user, userData, router]);

  // --------- Populate defaults once we have stable userData ----------
  useEffect(() => {
    if (!user || !userData) return;

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
        city:
          userData?.complete || userData?.city ? userData?.city ?? "" : "",
        licenses:
          userData?.complete || userData?.licenses
            ? userData?.licenses ?? []
            : [],
        mobility: userData?.complete
          ? userData?.mobility ?? "has_car"
          : "has_car",
        zipcode:
          (userData?.complete || userData?.zipcode
            ? userData?.zipcode
            : "") ?? "",
        availability: userData?.complete
          ? userData?.availability ?? []
          : [],
        profileImage:
          (userData?.complete || userData?.profileImage
            ? userData?.profileImage
            : "") ?? "",
        resumeDocument:
          userData?.complete && userData?.resumeDocument
            ? userData?.resumeDocument
            : "",
        smsConsent: Boolean(userData?.smsConsent ?? false),
      });

      setResumePreview(userData?.resumeDocument ?? null);
      setProfileImagePreview(userData?.profileImage ?? null);
    } catch (e: any) {
      notify.error(
        "We couldn’t load your profile fully. You can continue editing or refresh."
      );
      console.error("Prefill error:", e);
    }
  }, [userData, reset, user]);

  // ----------------- Upload Handlers -----------------
  const handleProfileImageUpload = async (file: File[]) => {
    if (!file?.[0]) return;
    try {
      setImageLoading(true);
      const formData = new FormData();
      formData.append("file", file[0]);
      const { data } = await axios.post(
        "https://jrp7pe2xhj.us-east-1.awsapprunner.com/api/v1/upload-file",
        formData
      );
      const url = data?.url ?? "";
      setValue("profileImage", url);
      setProfileImagePreview(url);
      notify.success("Profile image uploaded successfully.");
    } catch (error: any) {
      notify.error(
        error?.response?.data?.message ||
          error?.message ||
          "Error uploading profile image."
      );
    } finally {
      setImageLoading(false);
    }
  };

  const handleResumeUpload = async (file: File[]) => {
    if (!file?.[0]) return;
    try {
      setDocumentLoading(true);
      const formData = new FormData();
      formData.append("file", file[0]);
      const { data } = await axios.post(
        "https://jrp7pe2xhj.us-east-1.awsapprunner.com/api/v1/upload-file",
        formData
      );
      const url = data?.url ?? "";
      setValue("resumeDocument", url);
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
  const deleteFile = async (url: string, type: "image" | "resume") => {
    if (!url) return;
    try {
      if (type === "image") setImageLoading(true);
      else setDocumentLoading(true);

      const payload = { fileUrl: url };
      const { data } = await axios.post(
        "https://jrp7pe2xhj.us-east-1.awsapprunner.com/api/v1/delete-file",
        payload
      );
      if (data?.success) {
        if (type === "image") {
          setProfileImagePreview(null);
          setValue("profileImage", "");
          notify("Profile image removed.");
        } else {
          setResumePreview(null);
          setValue("resumeDocument", "");
          notify("Resume removed.");
        }
      } else {
        notify("Could not remove file. You can try again.");
      }
    } catch (error: any) {
      notify.error(
        error?.response?.data?.message || error?.message || "Error deleting file."
      );
    } finally {
      if (type === "image") setImageLoading(false);
      else setDocumentLoading(false);
    }
  };

  // ----------------- Submit -----------------
  const onSubmit = async (data: any) => {
    if (!user || !userData) {
      notify("You’re signed out. Redirecting to sign up…");
      router.replace("/signup");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...data,
        name: `${data.fname} ${data.lname}`.trim(),
        complete: true,
        hash: user?.customData?.hash ?? undefined,
      };

      const accessToken = await getValidAccessTokenFromContext(user).catch(
        () => null
      );
      if (!accessToken) {
        notify("Your session expired. Please sign in again.");
        router.replace("/signup");
        return;
      }

      await axios.post(
        `https://jrp7pe2xhj.us-east-1.awsapprunner.com/api/v1/caregivers/resume/update/${userData?.userID}`,
        payload,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      notify.success("Profile updated successfully.");

      // Fire GTM only if we had an existing complete profile (to avoid double-firing on first save)
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

      if (fetchedData?.result) {
        setUserData(fetchedData.result);
      }

      const updatedData = await fetchContactsData(
        user?.customData?.userID,
        user?.customData?.email
      ).catch(() => null);

      if (updatedData?.result) {
        await setCustomData(updatedData.result);
      }

      // Navigate to jobs
      router.push("/vitae/jobs/all");
      setTimeout(() => {
        // Full reload to ensure all widgets pick up the latest profile
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

  // --------------- Render ---------------
  // Hold UI until we know if user/userData exist (prevents flashing errors)
  if (!user || !userData) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <Loader className="mx-auto mb-3 animate-spin" />
          <p className="text-sm text-gray-600">
            Checking your session… If you’re signed out, we’ll take you to sign up.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 px-2 md:px-4">
      <div className="py-6 lg:py-10">
        <div className="max-w-6xl mx-auto py-8 px-4 md:px-10 rounded-lg shadow-lg bg-white">
          <div className="mb-5">
            <h2 className="font-bold text-xl text-gray-900">Update your resume</h2>
            <p className="text-sm antialiased">
              Update your resume for providers to recognize you and get connected faster.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-20">
            {/* Form Section */}
            <div className="lg:col-span-2 w-full">
              <form autoComplete="off" className="space-y-5">
                {/* Contact Information */}
                <div className="mb-4">
                  <div className="mb-2">
                    <h3 className="font-semibold text-gray-900">Contact information</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="mb-0">
                      <label htmlFor="first-name" className="block mb-2 text-sm font-medium text-gray-900">
                        First name
                      </label>
                      <input
                        type="text"
                        id="first-name"
                        className="bg-gray-50 border border-gray-300 focus-visible:outline-blue-500 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                        required
                        {...register("fname")}
                      />
                      {errors.fname && <p className="text-red-500">{String(errors.fname.message)}</p>}
                    </div>

                    <div>
                      <label htmlFor="last-name" className="block mb-2 text-sm font-medium text-gray-900">
                        Last name
                      </label>
                      <input
                        type="text"
                        id="last-name"
                        className="bg-gray-50 border border-gray-300 focus-visible:outline-blue-500 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                        required
                        {...register("lname")}
                      />
                      {errors.lname && <p className="text-red-500">{String(errors.lname.message)}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900">
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
                        <p className="text-red-500">{String(errors.settings.email.message)}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="tel" className="block mb-2 text-sm font-medium text-gray-900">
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
                        <p className="text-red-500 text-xs">{String(errors.settings.tel.message)}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <label htmlFor="city" className="block mb-2 text-sm font-medium text-gray-900">
                        City
                      </label>
                      <input
                        type="text"
                        id="city"
                        className="bg-gray-50 border border-gray-300 focus-visible:outline-blue-500 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                        required
                        {...register("city")}
                      />
                      {errors.city && <p className="text-red-500 text-xs">{String(errors.city.message)}</p>}
                    </div>

                    <div>
                      <label htmlFor="zipcode" className="block mb-2 text-sm font-medium text-gray-900">
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
                        <p className="text-red-500 text-xs">{String(errors.zipcode.message)}</p>
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
                    <p className="text-red-500 text-xs">{String(errors.licenses.message)}</p>
                  )}
                </div>

                {/* Certifications */}
                <div>
                  <h3 className="font-semibold text-md">Bio/Certifications</h3>
                  <p className="text-sm antialiased mb-2">
                    Give employers your experience, certifications, study overview and what you want.
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
                    <p className="text-red-500 text-xs">{String(errors.certifications.message)}</p>
                  )}
                </div>

                {/* Availability */}
                <div>
                  <h3 className="font-semibold text-gray-900 antialiased mb-2">Your availability</h3>
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
                    <p className="text-red-500 text-xs">{String(errors.availability.message)}</p>
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
                  <h3 className="font-semibold text-md mb-2">Do you have a car?</h3>
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
                          <RadioGroupItem value="has_car" className="border-gray-600" />
                          <Label>Yes</Label>
                        </div>
                        <div className="flex gap-1 items-center">
                          <RadioGroupItem value="no_car" className="border-gray-600" />
                          <Label>No</Label>
                        </div>
                      </RadioGroup>
                    )}
                  />
                  {errors.mobility && (
                    <p className="text-red-500 text-xs">{String(errors.mobility.message)}</p>
                  )}
                </div>

                {/* SMS Consent */}
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
                          checked={Boolean(field.value)}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          className="form-checkbox h-10 w-10 text-blue-600"
                        />
                        <span className="text-sm text-gray-700">
                          I agree to receive text messages from KinsCare with updates about my
                          profile, job opportunities, and important hiring information. Message
                          frequency may vary. Standard message and data rates may apply. We do not
                          share or sell your mobile number. Reply STOP to unsubscribe.
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
                  disabled={loading || isSubmitting}
                  onClick={handleSubmit(onSubmit)}
                  className="w-full hidden gap-2 lg:flex"
                >
                  {(loading || isSubmitting) && <LoaderCircle className="animate-spin" />}{" "}
                  {loading || isSubmitting ? "Updating..." : "Update Profile"}
                </Button>
              </form>
            </div>

            {/* Profile Image & Resume Section */}
            <div className="sticky top-10">
              {/* Profile Image Upload */}
              <div className="mb-6">
                <h3 className="font-semibold">Profile Image</h3>
                <p className="text-sm antialiased mb-4">
                  Set your profile image to build trust with employers. Drag and drop or click to select.
                </p>
                {profileImagePreview ? (
                  <div className="w-full">
                    <div className="border-4 p-2 border-gray-200 rounded-full w-40 h-40 relative">
                      <Avatar className="rounded-full w-full h-full">
                        <AvatarImage
                          src={profileImagePreview || "/default-avatar.png"}
                          alt={"profile-image"}
                        />
                        <AvatarFallback>
                          {(user?.customData?.name?.charAt(0) || "U").toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <Button
                        onClick={() => deleteFile(profileImagePreview, "image")}
                        className="absolute top-0 right-0 bg-gray-800 text-white rounded-full"
                        size="icon"
                        variant="ghost"
                      >
                        <X className={`${imageLoading ? "animate-spin" : ""}`} size={20} />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Dropzone
                    onDrop={(acceptedFiles: any) => handleProfileImageUpload(acceptedFiles)}
                    disabled={imageLoading}
                    accept={{ "image/*": [".jpeg", ".jpg", ".png"] }}
                    maxSize={1048576} // 1 MB
                  >
                    {({ getRootProps, getInputProps }: any) => (
                      <div
                        {...getRootProps()}
                        className="p-2 border-4 border-gray-100 rounded-full w-40 h-40 text-center cursor-pointer flex justify-center items-center relative"
                      >
                        {!imageLoading && <input {...getInputProps()} />}
                        <Avatar className="w-full h-full">
                          <AvatarImage
                            src="https://kinscare-storage.s3.amazonaws.com/Firefly_Generate_a_place_holder_profile_image_cartoony_avatar_Caucasian_man_for_job_application_1309_(1)-transformed.jpeg"
                            alt="placeholder"
                          />
                        </Avatar>
                        <div className="absolute bg-gray-50 p-2 rounded-full">
                          <Camera className={`${imageLoading ? "animate-spin" : ""}`} />
                        </div>
                      </div>
                    )}
                  </Dropzone>
                )}
              </div>

              {/* Resume Upload */}
              <div>
                <h3 className="font-semibold text-md mb-2">Resume</h3>
                <p className="text-sm antialiased mb-4">
                  Attach your resume to boost your chances of getting connected faster.
                </p>
                {resumePreview ? (
                  <div className="relative">
                    <iframe src={resumePreview} className="w-full h-[500px]" />
                    <Button
                      onClick={() => deleteFile(resumePreview, "resume")}
                      className="absolute -top-4 right-0 bg-gray-800 text-white rounded-full"
                      size="icon"
                      variant="ghost"
                    >
                      <X className={`${documentLoading ? "animate-spin" : ""}`} size={20} />
                    </Button>
                  </div>
                ) : (
                  <Dropzone
                    onDrop={(acceptedFiles: any) => handleResumeUpload(acceptedFiles)}
                    disabled={documentLoading}
                    accept={{
                      "application/pdf": [".pdf"],
                      "application/msword": [".doc"],
                      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
                        ".docx",
                      ],
                    }}
                    maxSize={3145728} // 3 MB
                  >
                    {({ getRootProps, getInputProps }: any) => (
                      <div
                        {...getRootProps()}
                        className="p-4 border-2 border-dashed rounded-lg text-center cursor-pointer"
                      >
                        {documentLoading ? (
                          <Loader className="animate-spin" />
                        ) : (
                          <>
                            <input {...getInputProps()} />
                            <div className="flex flex-col items-center gap-4">
                              <Cloudy />
                              <p className="text-xs antialiased">
                                Drag and drop resume here (PDF/DOCX) or click to select
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </Dropzone>
                )}

                {/* Submit (mobile) */}
                <div className="mt-10">
                  <Button
                    disabled={loading || isSubmitting}
                    onClick={handleSubmit(onSubmit)}
                    className="w-full flex gap-2 lg:hidden"
                  >
                    {(loading || isSubmitting) && <LoaderCircle className="animate-spin" />}{" "}
                    {loading || isSubmitting ? "Updating..." : "Update Profile"}
                  </Button>
                </div>
              </div>
            </div>
            {/* End sidebar */}
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
