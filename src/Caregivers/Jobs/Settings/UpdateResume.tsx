"use client";

import React, { useContext, useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import Dropzone from "react-dropzone";
// import MuiTailwindCheckbox from "@/components/muiTailwindcssCheckbox";
import MultiSelectField from "@/components/MultiSelect";
import MongoContext from "@/app/MongoContext";

import {
  Camera,
  CameraOffIcon,
  Cloudy,
  Loader,
  LoaderCircle,
  X,
} from "lucide-react";
import { fetchUserData } from "@/lib/utils";
import DeleteAccount from "@/Providers/User/DeleteAccount";
// Form Validation Schema with Yup
const schema = yup.object().shape({
  fname: yup.string().required("First name is required"),
  lname: yup.string().required("Last name is required"),
  // email: yup.string().email("Invalid email").required("Email is required"),
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
    .required("License is required."),
  profileImage: yup.string().required("image url is required"),
  resumeDocument: yup.string().optional(),
});

// the fields
const licenseOptions = [
  { value: "CNA", label: "CNA or NAC" },
  { value: "HCA", label: "HCA" },
  { value: "NAR", label: "NAR" },
  { value: "None", label: "None" },
];
const groupAvalability = [
  { label: "Full time", value: "Full time" },
  { label: "Part time", value: "Part time" },
  { label: "Weekend", value: "Weekends" },
  { label: "On Call", value: "on Call" },
  { label: "Live In", value: "Live In" },
];

const groupAlert = [
  { label: "Phone Call", value: "Phone_call" },
  { label: "SMS/Text message", value: "SMS/Text message" },
  { label: "Email", value: "Email" },
];

interface IFormInput {
  licenses: string[];
}

const CaregiverProfileForm = () => {
  const mongodb: any = useContext(MongoContext);
  const { user, userData, setUserData } = mongodb;
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
    },
  });

  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(
    null
  );
  const [resumePreview, setResumePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false); // General loading state
  const [imageLoading, setImageLoading] = useState(false); // Image upload loading state
  const [documentLoading, setDocumentLoading] = useState(false); // Document upload loading state
  // console.log(errors)
  // Handle Profile Image Upload
  console.log(userData)
  console.log(userData);
  useEffect(() => {
    if (userData && user) {
      reset({
        fname: userData.complete || userData?.fname ? userData.fname : "",
        lname: userData.complete || userData.lname ? userData.lname : "",
        settings: {
          alert_preferences: userData.complete
            ? userData?.settings?.alert_preferences
            : [],
          role: "caregiver",
          tel: userData.complete ? userData.settings.tel : userData?.auth?.tel,
          email: userData.complete
            ? userData.settings.email
            : userData.auth.email,
        },
        certifications:
          userData.complete || userData.certifications
            ? userData.certifications
            : "",
        city:
          userData.complete || userData.city
            ? userData.city
              ? userData?.city
              : ""
            : "",
        licenses: userData.complete || userData?.licenses
          ? userData?.licenses
            ? userData?.licenses
            : []
          : [],
        mobility: userData.complete
          ? userData.mobility
            ? userData.mobility
            : "has_car"
          : "has_car",
        zipcode:
          userData.complete || userData?.zipcode
            ? userData?.zipcode
              ? userData?.zipcode
              : ""
            : "",
        availability: userData.complete
          ? userData?.availability
            ? userData?.availability
            : []
          : [],
        profileImage:
          userData.complete || userData.profileImage
            ? userData.profileImage
              ? userData.profileImage
              : ""
            : "",
        resumeDocument: userData.complete
          ? userData.resumeDocument
            ? userData.resumeDocument
            : ""
          : "",
      });
      setResumePreview(userData.resumeDocument);
      setProfileImagePreview(userData.profileImage);
    }
  }, [userData, reset, user]);
  const handleProfileImageUpload = async (file: File[]) => {
    try {
      setImageLoading(true);
      const formData = new FormData();
      formData.append("file", file[0]);
      const { data } = await axios.post(
        "https://api.kinscare.org/api/v1/upload-file",
        formData
      );
      setValue("profileImage", data.url);
      setProfileImagePreview(data.url);
      toast({
        title: "Profile image uploaded successfully",
        variant: "default",
      });
    } catch (error: any) {
      toast({
        title: "Error uploading profile image",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setImageLoading(false);
    }
  };

  // Handle Resume Upload
  const handleResumeUpload = async (file: File[]) => {
    try {
      setDocumentLoading(true);
      const formData = new FormData();
      formData.append("file", file[0]);
      const { data } = await axios.post(
        "https://api.kinscare.org/api/v1/upload-file",
        formData
      );
      setValue("resumeDocument", data.url);
      setResumePreview(data.url);
      toast({ title: "Resume uploaded successfully", variant: "default" });
    } catch (error: any) {
      toast({
        title: "Error uploading resume",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDocumentLoading(false);
    }
  };

  // Delete Profile Image
  const deleteFile = async (url: string, type: string) => {
    try {
      if (type === "image") {
        setImageLoading(true);
      } else {
        setImageLoading(true);
      }
      const payload = { fileUrl: url };
      const { data } = await axios.post(
        "https://api.kinscare.org/api/v1/delete-file",
        payload
      );
      if (data.success) {
        if (type === "image") {
          setProfileImagePreview(null);
          setImageLoading(false);
        } else {
          setResumePreview(null);
          setDocumentLoading(false);
        }
      }
    } catch (error: any) {
      toast({
        title: "Error deleting file",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setImageLoading(false);
    }
  };
  // console.log(userData);
  // Handle form submission
  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const payload = {
        ...data,
        name: `${data.fname} ${data.lname}`,
        complete: true,
        hash: user.customData.hash,
      };
      console.log(payload);
      await axios.post(
        `https://api.kinscare.org/api/v1/caregivers/resume/update/${userData.userID}`,
        payload
      );
      toast({ title: "Profile updated successfully", variant: "default" });
      const fetchedData: any = await fetchUserData(
        userData.userID,
        userData.email
      );
      // console.log(fetchedData);
      setUserData(fetchedData.result);
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  // console.log(userData?.availability);
  console.log(errors);
  return (
    <div className="bg-gray-100 px-2 md:px-4">
      <div className="py-6 lg:py-10">
        <div className="max-w-6xl mx-auto py-8  px-4 md:px-10 rounded-lg shadow-lg bg-white">
          <div className="mb-5">
            <h2 className="font-bold text-xl  text-gray-900">
              Update your resume
            </h2>
            <p className="text-sm antialiased">
              Update your resume for providers to be able to recognize you and
              get connected faster
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-20">
            {/* Form Section */}

            <div className="lg:col-span-2 w-full">
              <form
                autoComplete="off"
                className="space-y-5 lg:col-span-8  md:col-span-8"
              >
                {/* Contact Information Section */}
                <div className="mb-4">
                  <div className="mb-2">
                    <h3 className="font-semibold text-gray-900">
                      Contact information
                    </h3>
                    {/* <p className="text-sm font-normal text-gray-00 antialiased">
                  Enter your first and last name
                </p> */}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="mb-0">
                      <label
                        htmlFor="email"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        First name
                      </label>
                      <input
                        type="text"
                        id="first-name"
                        className="bg-gray-50 border border-gray-300 focus-visible:outline-blue-500 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        required
                        {...register("fname")} // To connect with react-hook-form
                      />
                      {errors.fname && (
                        <p className="text-red-500">{errors.fname.message}</p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="text"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Last name
                      </label>
                      <input
                        type="text"
                        id="last-name"
                        className="bg-gray-50 border border-gray-300 focus-visible:outline-blue-500 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        required
                        {...register("lname")} // To connect with react-hook-form
                      />
                      {errors.lname && (
                        <p className="text-red-500">{errors.lname.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <label
                        htmlFor="email"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Email
                      </label>
                      <input
                        type="email"
                        autoComplete="new-password"
                        id="email"
                        className="bg-gray-50 border border-gray-300 focus-visible:outline-blue-500 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        required
                        {...register("settings.email")} // To connect with react-hook-form
                      />
                      {errors.settings?.email && (
                        <p className="text-red-500">
                          {errors.settings.email.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="tel"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Telephone
                      </label>
                      <input
                        type="tel"
                        id="tel"
                        autoComplete="new-password"
                        className="bg-gray-50 border border-gray-300 focus-visible:outline-blue-500 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        required
                        {...register("settings.tel")} // To connect with react-hook-form
                      />
                      {errors.settings?.tel && (
                        <p className="text-red-500 text-xs">
                          {errors.settings.tel.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <label
                        htmlFor="city"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        City
                      </label>
                      <input
                        type="text"
                        id="last-name"
                        className="bg-gray-50 border border-gray-300 focus-visible:outline-blue-500 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        required
                        {...register("city")} // To connect with react-hook-form
                      />
                      {errors.city && (
                        <p className="text-red-500 text-xs">
                          {errors.city.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="city"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Zipcode
                      </label>
                      <input
                        type="text"
                        id="last-name"
                        className="bg-gray-50 border border-gray-300 focus-visible:outline-blue-500 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        required
                        {...register("zipcode")} // To connect with react-hook-form
                      />
                      {errors.zipcode && (
                        <p className="text-red-500 text-xs">
                          {errors.zipcode.message}
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
                    maxCount={4} // You can limit the number of selections
                    rules={{ required: true }} // Additional rules can be passed here
                  />

                  {errors.licenses && (
                    <p className="text-red-500 text-xs">
                      {errors.licenses.message}
                    </p>
                  )}
                </div>

                {/* Certifications */}
                <div>
                  <h3 className="font-semibold text-md">Bio/Certifications</h3>
                  <p className="text-sm antialiased mb-2">
                    Give the employers your experience, certification, study
                    overview and what you want
                  </p>
                  <Controller
                    name="certifications"
                    control={control}
                    // defaultValue="ssklklklklk" // Initial value for the field
                    render={({ field }) => (
                      <textarea
                        {...field}
                        defaultValue={field.value}
                        id="certifications"
                        rows={6}
                        placeholder="Write your certifications here..."
                        className="block p-2.5 w-full text-sm focus-visible:outline-blue-500 text-gray-900 bg-gray-50 rounded-sm border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      />
                    )}
                  />
                  {errors.certifications && (
                    <p className="text-red-500 text-xs">
                      {errors.certifications.message}
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
                    placeholder="Select your schedule you want for the job"
                    maxCount={4} // You can limit the number of selections
                    rules={{ required: true }} // Additional rules can be passed here
                  />
                  {errors.availability && (
                    <p className="text-red-500 text-xs">
                      {errors.availability.message}
                    </p>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 antialiased mb-2">
                    How do you want employers to contact you?
                  </h3>
                  <MultiSelectField
                    name="settings.alert_preferences"
                    control={control}
                    isAnimation={true}
                    options={groupAlert}
                    placeholder="your alert preferences for employers to contact you"
                    maxCount={4} // You can limit the number of selections
                    rules={{ required: true }} // Additional rules can be passed here
                  />
                  {errors.settings?.alert_preferences && (
                    <p className="text-red-500 text-xs">
                      {errors.settings.alert_preferences.message}
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
                    // rules={{ required: "This field is required" }}
                    render={({ field }) => (
                      <RadioGroup
                        value={field.value} // Bind value to the field
                        onValueChange={(value) => field.onChange(value)} // Ensure onChange updates the form
                        className="flex gap-4"
                      >
                        <div className="flex gap-1 items-center">
                          <RadioGroupItem
                            value="has_car"
                            className="border-gray-600"
                          />
                          <Label>Yes</Label>
                        </div>
                        <div className="flex gap-1 items-center">
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
                      {errors.mobility.message}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  disabled={loading || isSubmitting}
                  onClick={handleSubmit(onSubmit)}
                  className="w-full hidden gap-2 lg:flex"
                >
                  {loading && <LoaderCircle className="animate-spin" />}{" "}
                  {loading || isSubmitting ? "Updating..." : "Update Profile"}
                </Button>
              </form>
            </div>

            {/* Profile Image & Resume Section */}
            <div className="sticky top-10">
              {/* Profile Image Upload */}
              <div className="mb-6">
                <h3 className="font-semibold ">Profile Image</h3>
                <p className="text-sm antialiased mb-4">
                  Set your profile image to build trust with employers Drag and
                  drop profile image or click to select
                </p>
                {profileImagePreview ? (
                  <div className="w-full">
                    <div className="border-4 p-2 border-gray-200  rounded-full w-40 h-40 relative">
                      <Avatar className="rounded-full w-full h-full">
                        <AvatarImage
                          src={profileImagePreview || "/default-avatar.png"}
                          alt={"profile-image"}
                        />
                        <AvatarFallback>
                          {user?.customData?.name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <Button
                        onClick={() => {
                          deleteFile(profileImagePreview, "image");
                        }}
                        className="absolute top-0 right-0 bg-gray-800 text-white rounded-full"
                        size="icon"
                        variant="ghost"
                      >
                        <X
                          className={`${documentLoading && "animate-spin"}`}
                          size={20}
                        />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Dropzone
                    onDrop={(acceptedFiles: any) => {
                      handleProfileImageUpload(acceptedFiles);
                    }}
                    disabled={imageLoading}
                    accept={{ "image/*": [".jpeg", ".jpg", ".png"] }}
                    maxSize={1048576} // 1 MB limit
                  >
                    {({ getRootProps, getInputProps }: any) => (
                      <div
                        {...getRootProps()}
                        className="p-2 border-4 border-gray-100 rounded-full w-40 h-40 text-center cursor-pointer flex justify-center items-center"
                      >
                        {!imageLoading && <input {...getInputProps()} />}
                        <Avatar className="w-full h-full">
                          <AvatarImage
                            src="https://kinscare-storage.s3.amazonaws.com/Firefly_Generate_a_place_holder_profile_image_cartoony_avatar_Caucasian_man_for_job_application_1309_(1)-transformed.jpeg"
                            alt="placeholder"
                          />
                        </Avatar>
                        <div className="absolute bg-gray-50 p-2 rounded-full">
                          {" "}
                          <Camera
                            className={`${imageLoading && "animate-spin"}`}
                          />
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
                  You can attach your resume to boost the chance of getting
                  connected with employers faster
                </p>
                {resumePreview ? (
                  <div className="relative">
                    <iframe src={resumePreview} className="w-full h-[500px]" />
                    <Button
                      onClick={() => {
                        deleteFile(resumePreview, "resume");
                      }}
                      className="absolute -top-4 right-0 bg-gray-800 text-white rounded-full"
                      size="icon"
                      variant="ghost"
                    >
                      <X
                        className={`${documentLoading && "animate-spin"}`}
                        size={20}
                      />
                    </Button>
                  </div>
                ) : (
                  <Dropzone
                    onDrop={(acceptedFiles: any) => {
                      handleResumeUpload(acceptedFiles);
                    }}
                    disabled={documentLoading}
                    accept={{
                      "application/pdf": [".pdf"],
                      "application/msword": [".doc", ".docx"],
                    }}
                    maxSize={3145728} // 3 MB limit
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
                <div className="mt-10">
                  <Button
                    disabled={loading || isSubmitting}
                    onClick={handleSubmit(onSubmit)}
                    className="w-full flex gap-2 lg:hidden"
                  >
                    {loading && <LoaderCircle className="animate-spin" />}{" "}
                    {loading || isSubmitting ? "Updating..." : "Update Profile"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white shadow-sm my-10 rounded-lg p-8">
              <DeleteAccount />
            </div>
    </div>
  );
};

export default CaregiverProfileForm;
