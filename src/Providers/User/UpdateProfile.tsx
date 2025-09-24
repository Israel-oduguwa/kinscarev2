"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/components/ui/use-toast";
import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import Dropzone from "react-dropzone";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import MongoContext from "@/app/MongoContext";
import MultiSelectField from "@/components/MultiSelect";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchContactsData } from "@/lib/utils";
import {
  Camera,
  Cloud,
  Loader,
  LoaderCircle,
  ShieldAlert,
  UserRound,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import TagManager from "react-gtm-module";
import VerifyAccount from "../Candidates/VerifyAccount";

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

// fire-and-forget deletion for *hosted* files only
const safeDeleteHostedFile = async (fileUrl?: string | null) => {
  if (!fileUrl || !isHostedStorageUrl(fileUrl)) return;
  try {
    await axios.post(
      "https://jrp7pe2xhj.us-east-1.awsapprunner.com/api/v1/delete-file",
      { fileUrl }
    );
  } catch {
    // silent: don't block the UX if cleanup fails
  }
};

// ---------- Helpers ----------
const emptyToNull = (v: unknown) =>
  typeof v === "string" ? (v.trim() === "" ? null : v) : v;

// ---------- Validation ----------
const schema = yup.object({
  address: yup.string().required("Please enter provider's street address"),
  fname: yup.string().required("First name is required"),
  name: yup.string().required("KinsCare or provider name is required"),
  lname: yup.string().required("Last name is required"),
  city: yup.string().required("City is required"),
  zipcode: yup.string().required("Zipcode is required"),
  trainer: yup
    .string()
    .required("Please select whether you offer training or not"),
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
  }),
  type_of_setting: yup
    .array()
    .min(1, "Please select provider type of care setting(s).")
    .required("Must at least select one type of setting."),
  // OPTIONAL profile image
  profileImage: yup
    .mixed()
    .transform(emptyToNull)
    .nullable()
    .test(
      "is-url-or-null",
      "Invalid image URL",
      (val) => val === null || typeof val === "string"
    ),
});

// ---------- Options ----------
const groupProvider = [
  {
    label: "Assisted Living/Nursing Home",
    value: "Assisted Living/Nursing Home",
  },
  { label: "Adult Family/Boarding Home", value: "Adult Family/Boarding Home" },
  { label: "Hospital/Clinic", value: "Hospital/Clinic" },
  { label: "Home Care Agency", value: "Home Care Agency" },
  { label: "Other", value: "Other" },
];

const groupCall = [
  { label: "Phone Call", value: "Phone_call" },
  { label: "SMS/Text message", value: "SMS/Text message" },
  { label: "Email", value: "Email" },
];

interface IFormInput {
  licenses: string[];
}

const UpdateProfile = () => {
  const mongodb: any = useContext(MongoContext);
  const { user, userData, setCustomData } = mongodb || {};
  const router = useRouter();

  const [isVerificationDialogOpen, setIsVerificationDialogOpen] =
    useState(false);
  const [openModal, setOpenModal] = useState(false);

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
      name: "",
      address: "",
      settings: {
        alert_preferences: [] as string[],
        tel: "",
        email: "",
      },
      trainer: "",
      type_of_setting: [] as string[],
      city: "",
      zipcode: "",
      profileImage: null as string | null,
    },
    mode: "onSubmit",
  });

  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [documentLoading] = useState(false); // kept for parity; not used here

  // ---------- Prefill ----------
  useEffect(() => {
    if (!userData || !user) return;

    reset({
      fname: userData?.fname ?? "",
      lname: userData?.lname ?? "",
      name: userData?.name ?? "",
      address: userData?.address ?? "",
      settings: {
        alert_preferences: userData?.settings?.alert_preferences ?? [],
        tel: userData?.settings?.tel ?? userData?.auth?.tel ?? "",
        email: userData?.settings?.email ?? userData?.auth?.email ?? "",
      },
      trainer: userData?.trainer ?? "",
      type_of_setting: userData?.type_of_setting ?? [],
      city: userData?.city ?? "",
      zipcode: userData?.zipcode ?? "",
      profileImage: userData?.profileImage ?? null,
    });

    setProfileImagePreview(userData?.profileImage ?? null);
  }, [userData, user, reset]);

  // ---------- Uploads ----------
  const IMG_MAX_BYTES = 1 * 1024 * 1024; // 1MB

  const handleProfileImageUpload = async (files: File[]) => {
    const file = files?.[0];
    if (!file) return;

    const previousUrl = profileImagePreview;

    try {
      setImageLoading(true);
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await axios.post(
        "https://jrp7pe2xhj.us-east-1.awsapprunner.com/api/v1/upload-file",
        formData
      );
      const url = data?.url ?? "";
      setValue("profileImage", url, { shouldDirty: true });
      setProfileImagePreview(url);
      toast({ title: "Profile image uploaded successfully" });
      // background cleanup of old hosted image
      safeDeleteHostedFile(previousUrl);
    } catch (error: any) {
      toast({
        title: "Error uploading profile image",
        description:
          error?.response?.data?.message || error?.message || "Upload failed",
        variant: "destructive",
      });
    } finally {
      setImageLoading(false);
    }
  };

  const deleteFile = async (url: string | null, type: "image") => {
    if (!url) return;
    const hosted = isHostedStorageUrl(url);

    try {
      setImageLoading(true);
      if (hosted) {
        await axios.post(
          "https://jrp7pe2xhj.us-east-1.awsapprunner.com/api/v1/delete-file",
          { fileUrl: url }
        );
      }
      setProfileImagePreview(null);
      setValue("profileImage", null, { shouldDirty: true });
      toast({ title: "Profile image removed" });
    } catch (error: any) {
      toast({
        title: "Error removing image",
        description: error?.response?.data?.message || error?.message,
        variant: "destructive",
      });
    } finally {
      setImageLoading(false);
    }
  };

  // ---------- Submit ----------
  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const payload = {
        ...data,
        complete: true,
        hash: user?.customData?.hash, // keep existing contract
      };

      await axios.post(
        `https://jrp7pe2xhj.us-east-1.awsapprunner.com/api/v1/providers/settings/update/${userData.userID}`,
        payload
      );

      toast({ title: "Profile updated successfully" });

      TagManager.dataLayer({
        dataLayer: {
          event: "update_profile",
          ...data,
        },
      });

      const updatedData = await fetchContactsData(
        user?.customData?.userID,
        user?.customData?.email
      );
      if (updatedData?.result) {
        await setCustomData(updatedData.result);
        router.push("/provider/candidates/all");
        setTimeout(() => {
          if (typeof window !== "undefined") window.location.reload();
        }, 1200);
      }
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description:
          error?.response?.data?.message || error?.message || "Update failed",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // ---------- Verify ----------
  const verifyPaymentMethod = () => {
    setOpenModal(true);
    setIsVerificationDialogOpen(false);
  };

  return (
    <div className="bg-gray-100 py-10">
      <div className="max-w-6xl mx-auto">
        {!user?.customData?.verified && (
          <div className="flex items-center gap-2 mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <ShieldAlert className="w-5 text-red-700 h-5" />
            <span className="text-yellow-700 text-sm font-medium">
              Your account is not verified.{" "}
              <Button
                variant="link"
                onClick={() => setIsVerificationDialogOpen(true)}
              >
                Click here to verify your account.
              </Button>
            </span>
          </div>
        )}

        <Dialog
          open={isVerificationDialogOpen}
          onOpenChange={setIsVerificationDialogOpen}
        >
          <DialogContent
            closePosition="left"
            className="mx-auto bg-white rounded-lg shadow-lg"
          >
            <DialogTitle className="pt-4">
              Get Verified & Connect To More Caregivers
            </DialogTitle>
            <DialogDescription>
              You probably hate being solicited by scammers and so do our
              caregivers. To prevent exploitation, we now require all employers
              to complete a quick, FREE one-time identity verification. This
              ensures trust, safety, and shows caregivers your interest is
              genuine. Verify now to help maintain a secure community!
            </DialogDescription>
            <Button className="mt-4" onClick={verifyPaymentMethod}>
              Verify Now
            </Button>
          </DialogContent>
        </Dialog>

        <div className="mx-4 xl:mx-0 px-4 py-8 md:px-8 rounded-lg shadow-lg bg-white">
          {userData ? (
            <>
              <div className="mb-5">
                <h2 className="font-bold text-xl text-gray-900">
                  {!user?.customData?.complete
                    ? "Add your company or provider information to find the best match"
                    : "Update your account"}
                </h2>
                <p className="text-sm antialiased text-gray-700">
                  Update your profile so caregivers can recognize you and get
                  connected faster.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-16">
                {/* Form Section */}
                <div className="lg:col-span-2 w-full">
                  <form
                    autoComplete="off"
                    className="space-y-5"
                    onSubmit={handleSubmit(onSubmit)}
                  >
                    {/* Contact Information */}
                    <div className="mb-4">
                      <div className="mb-2">
                        <h3 className="font-semibold text-gray-700">
                          Contact information
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
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

                      <div className="w-full">
                        <div className="mb-0">
                          <label
                            htmlFor="provider-name"
                            className="block mb-2 text-sm font-medium text-gray-900"
                          >
                            Name of care provider
                          </label>
                          <input
                            type="text"
                            id="provider-name"
                            className="bg-gray-50 border border-gray-300 focus-visible:outline-blue-500 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                            required
                            {...register("name")}
                          />
                          {errors.name && (
                            <p className="text-red-500 text-xs">
                              {String(errors.name.message)}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 mb-4">
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

                      <p className="font-semibold text-gray-700 mb-2">
                        To find caregivers close to you
                      </p>
                      <div>
                        <label
                          htmlFor="address"
                          className="block mb-2 text-sm font-medium text-gray-900"
                        >
                          Street address
                        </label>
                        <input
                          type="text"
                          id="address"
                          className="bg-gray-50 border border-gray-300 focus-visible:outline-blue-500 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                          required
                          {...register("address")}
                        />
                        {errors.address && (
                          <p className="text-red-500 text-xs">
                            {String(errors.address.message)}
                          </p>
                        )}
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

                    {/* Type of provider */}
                    <div>
                      <h3 className="font-semibold text-gray-700 antialiased mb-2">
                        What kind of care provider are you?
                      </h3>
                      <MultiSelectField
                        name="type_of_setting"
                        control={control}
                        isAnimation
                        options={groupProvider}
                        placeholder="Kind of provider"
                        maxCount={4}
                        rules={{ required: true }}
                      />
                      {errors.type_of_setting && (
                        <p className="text-red-500 text-xs">
                          {String(errors.type_of_setting.message)}
                        </p>
                      )}
                    </div>

                    {/* In-house training */}
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-2">
                        Do you offer in-house training or sponsor training?
                      </h3>
                      <Controller
                        name="trainer"
                        control={control}
                        render={({ field }) => (
                          <RadioGroup
                            value={field.value}
                            onValueChange={(value) => field.onChange(value)}
                            className="flex gap-6"
                          >
                            <div className="flex gap-2 items-center">
                              <RadioGroupItem
                                value="yes"
                                className="border-gray-600"
                              />
                              <Label>Yes</Label>
                            </div>
                            <div className="flex gap-2 items-center">
                              <RadioGroupItem
                                value="no"
                                className="border-gray-600"
                              />
                              <Label>No</Label>
                            </div>
                          </RadioGroup>
                        )}
                      />
                      {errors.trainer && (
                        <p className="text-red-500 text-xs">
                          {String(errors.trainer.message)}
                        </p>
                      )}
                    </div>

                    {/* Alerts */}
                    <div>
                      <h3 className="font-semibold text-gray-700 antialiased mb-2">
                        How do you want caregivers to contact you? [Must choose
                        one - your contact details won’t be shared]
                      </h3>
                      <MultiSelectField
                        name="settings.alert_preferences"
                        control={control}
                        isAnimation
                        options={groupCall}
                        placeholder="Your alert preferences"
                        maxCount={3}
                        rules={{ required: true }}
                      />
                      {errors.settings?.alert_preferences && (
                        <p className="text-red-500 text-xs">
                          {String(errors.settings.alert_preferences.message)}
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
                      {loading || isSubmitting
                        ? "Updating..."
                        : !user?.customData?.complete
                          ? "Add Details"
                          : "Update Settings"}
                    </Button>
                  </form>
                </div>

                {/* Profile Image Section */}
                <div className="lg:sticky lg:top-10">
                  <div className="mb-6">
                    <h3 className="font-semibold">
                      Profile Image{" "}
                      <span className="text-gray-500 font-normal">
                        (optional)
                      </span>
                    </h3>
                    <p className="text-sm antialiased mb-3 text-gray-700">
                      Add a clear logo/photo to build trust. Drag & drop or
                      click to upload.
                    </p>

                    {profileImagePreview ? (
                      <div className="w-full">
                        <div className="border-4 p-2 border-gray-200 rounded-full w-36 h-36 sm:w-40 sm:h-40 relative mx-auto">
                          <Avatar className="rounded-full w-full h-full">
                            <AvatarImage
                              src={profileImagePreview || "/default-avatar.png"}
                              alt="profile-image"
                            />
                            <AvatarFallback className="bg-gray-100">
                              <UserRound className="w-8 h-8 text-gray-500" />
                            </AvatarFallback>
                          </Avatar>

                          <Button
                            onClick={() =>
                              deleteFile(profileImagePreview, "image")
                            }
                            className="absolute -top-2 -right-2 bg-gray-800 text-white rounded-full"
                            size="icon"
                            type="button"
                            variant="ghost"
                            aria-label="Remove profile image"
                          >
                            <X
                              className={`${imageLoading ? "animate-spin" : ""}`}
                              size={18}
                            />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Encouraging tip */}
                        <div className="mb-2 rounded-md bg-blue-50 text-blue-800 text-xs px-3 py-2 border border-blue-100">
                          Providers with a photo/logo get more responses from
                          caregivers. You can add one now or later.
                        </div>

                        <Dropzone
                          onDrop={(acceptedFiles) =>
                            handleProfileImageUpload(acceptedFiles)
                          }
                          onDropRejected={(rejections) => {
                            const r = rejections?.[0];
                            if (r?.errors?.[0]?.code === "file-too-large") {
                              toast({
                                title: "Image too large (max 1MB).",
                                variant: "destructive",
                              });
                            } else if (
                              r?.errors?.[0]?.code === "file-invalid-type"
                            ) {
                              toast({
                                title: "Unsupported type. Use JPG/PNG.",
                                variant: "destructive",
                              });
                            } else {
                              toast({
                                title:
                                  "Could not add image. Try a different file.",
                                variant: "destructive",
                              });
                            }
                          }}
                          disabled={imageLoading}
                          accept={{ "image/*": [".jpeg", ".jpg", ".png"] }}
                          maxSize={IMG_MAX_BYTES}
                          multiple={false}
                        >
                          {({ getRootProps, getInputProps, isDragActive }) => (
                            <div
                              {...getRootProps()}
                              className={`p-2 border-4 rounded-full w-36 h-36 sm:w-40 sm:h-40 mx-auto text-center cursor-pointer flex justify-center items-center relative transition
                              ${isDragActive ? "border-blue-300 bg-blue-50" : "border-gray-100 bg-white"}`}
                            >
                              {!imageLoading && (
                                <input
                                  {...getInputProps()}
                                  aria-label="Upload profile image"
                                />
                              )}
                              <div className="w-full h-full rounded-full flex items-center justify-center bg-gray-50">
                                <UserRound className="w-12 h-12 text-gray-400" />
                              </div>
                              <div className="absolute bg-gray-50 border border-gray-200 p-2 rounded-full shadow-sm">
                                {imageLoading ? (
                                  <Loader className="animate-spin w-4 h-4" />
                                ) : (
                                  <Camera className="w-4 h-4" />
                                )}
                              </div>
                            </div>
                          )}
                        </Dropzone>
                      </>
                    )}
                  </div>

                  {/* Submit (mobile) */}
                  <div className="mt-4">
                    <Button
                      type="button"
                      disabled={loading || isSubmitting}
                      onClick={handleSubmit(onSubmit)}
                      className="w-full flex gap-2 lg:hidden"
                    >
                      {(loading || isSubmitting) && (
                        <LoaderCircle className="animate-spin" />
                      )}{" "}
                      {loading || isSubmitting
                        ? "Updating..."
                        : !user?.customData?.complete
                          ? "Add Details"
                          : "Update Settings"}
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            // Skeleton state
            <>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                <div className="lg:col-span-2 w-full">
                  <div className="flex flex-col space-y-4">
                    <Skeleton className="h-10 max-w-[850px] bg-slate-200" />
                    <Skeleton className="h-10 max-w-[850px] bg-slate-100" />
                    <Skeleton className="h-[125px] bg-slate-200 w-full rounded-xl" />
                    <Skeleton className="h-[225px] bg-slate-100 w-full rounded-xl" />
                    <Skeleton className="h-[225px] bg-slate-200 w-full rounded-xl" />
                    <div className="space-y-2">
                      <Skeleton className="h-10 bg-slate-200 w-[250px]" />
                      <Skeleton className="h-10 bg-slate-100 w-[200px]" />
                    </div>
                  </div>
                </div>
                <div className="space-y-4 flex flex-col">
                  <Skeleton className="h-32 w-32 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-10 bg-slate-200 w-[250px]" />
                    <Skeleton className="h-10 bg-slate-100 w-[200px]" />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      <VerifyAccount setOpenModal={setOpenModal} openModal={openModal} />
    </div>
  );
};

export default UpdateProfile;
