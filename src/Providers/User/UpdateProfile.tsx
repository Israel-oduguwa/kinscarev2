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
// import MuiTailwindCheckbox from "@/components/muiTailwindcssCheckbox";
import MongoContext from "@/app/MongoContext";
import MultiSelectField from "@/components/MultiSelect";

import { Camera, LoaderCircle, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
// Form Validation Schema with Yup
const schema = yup.object().shape({
  address: yup.string().required("Please enter provider's street address"), //.max(2, 'Full name can only be 6 characters long.'),
  fname: yup.string().required("First name is required"),
  name: yup.string().required("Your company name or provider name is required"),
  lname: yup.string().required("Last name is required"),
  // email: yup.string().email("Invalid email").required("Email is required"),
  city: yup.string().required("City is required"),
  zipcode: yup.string().required("Zipcode is required"),
  trainer: yup
    .string()
    .required("Please select whether you offer training or not"),
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
  }),
  type_of_setting: yup
    .array()
    .min(1, "Please select provider type of care setting(s).")
    .required("Must at least select one type of setting."), //.min(1, "at least 1")
  // profileImage: yup.string().required("image url is required"),
});

// the fields
const groupProvider = [
  {
    label: "Assisted Living/Nursing Home",
    value: "Assisted Living/Nursing Home",
  },
  {
    label: "Adult Family/Boarding Home",
    value: "Adult Family/Boarding Home",
  },
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
  const { user, userData } = mongodb;
  const router = useRouter();
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
        tel: "",
        email: "",
      },
      city: "",
      zipcode: "",
      profileImage: "",
    },
  });

  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(
    null
  );
  const [resumePreview, setResumePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false); // General loading state
  const [imageLoading, setImageLoading] = useState(false); // Image upload loading state
  const [documentLoading, setDocumentLoading] = useState(false); // Document upload loading state
  console.log(errors);
  // Handle Profile Image Upload
  // console.log(userData, "update this is why did");
  useEffect(() => {
    if (userData && user) {
      reset({
        fname: userData.complete || userData.fname !== "" ? userData.fname : "",
        name: userData.name || userData.name !== "" ? userData.name : "",
        lname: userData.complete || userData.lname !== "" ? userData.lname : "",
        address:
          userData.complete || userData.address !== "" ? userData.address : "",
        settings: {
          alert_preferences: userData.complete
            ? userData?.settings?.alert_preferences
            : [],
          tel: userData.complete ? userData.settings.tel : userData?.auth.tel,
          email: userData.complete
            ? userData.settings.email
            : userData.auth.email,
        },
        trainer: userData.complete ? userData.trainer : "",
        type_of_setting: userData.type_of_setting
          ? userData.type_of_setting
          : [],
        city:
          userData.complete || userData?.city !== ""
            ? userData.city
              ? userData?.city
              : ""
            : "",
        zipcode:
          userData.complete || userData?.zipcode
            ? userData?.zipcode
              ? userData?.zipcode
              : ""
            : "",
        profileImage: userData.complete
          ? userData.profileImage
            ? userData.profileImage
            : ""
          : "",
      });
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
        complete: true,
        hash: user.customData.hash,
      };
      console.log(payload);
      await axios.post(
        `https://api.kinscare.org/api/v1/providers/settings/update/${userData.userID}`,
        payload
      );

      toast({ title: "Profile updated successfully", variant: "default" });
      router.push("/provider/candidates/all");
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

  return (
    <div className="bg-gray-100 py-10">
      <div className="max-w-6xl mx-auto ">
        <div className="mx-4 xl:mx-0 px-4 py-10 md:px-10 rounded-lg shadow-lg bg-white">
          {userData ? (
            <>
              <div className="mb-5">
                <h2 className="font-bold text-xl  text-gray-900">
                  {!user?.customData?.complete
                    ? "Add your company or provider information to find the best match"
                    : "Update your account"}
                </h2>
                <p className="text-sm antialiased">
                  Update your resume for caregivers to be able to recognize you
                  and get connected faster
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
                        <h3 className="font-semibold text-gray-700">
                          Contact information
                        </h3>
                        {/* <p className="text-sm font-normal text-gray-00 antialiased">
                  Enter your first and last name
                </p> */}
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-4">
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
                            <p className="text-red-500">
                              {errors.fname.message}
                            </p>
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
                            <p className="text-red-500">
                              {errors.lname.message}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="w-full">
                        <div className="mb-0">
                          <label
                            htmlFor="email"
                            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                          >
                            Name of care provider
                          </label>
                          <input
                            type="text"
                            id="first-name"
                            className="bg-gray-50 border border-gray-300 focus-visible:outline-blue-500 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            required
                            {...register("name")} // To connect with react-hook-form
                          />
                          {errors.name && (
                            <p className="text-red-500">
                              {errors.name.message}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-4 mb-4">
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
                      <p className="font-semibold text-gray-700 mb-2">
                        To find caregivers close to you
                      </p>
                      <div>
                        <label
                          htmlFor="city"
                          className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >
                          Street address
                        </label>
                        <input
                          type="text"
                          id="last-name"
                          className="bg-gray-50 border border-gray-300 focus-visible:outline-blue-500 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                          required
                          {...register("address")} // To connect with react-hook-form
                        />
                        {errors.address && (
                          <p className="text-red-500 text-xs">
                            {errors.address.message}
                          </p>
                        )}
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
                      <h3 className="font-semibold text-gray-700 antialiased mb-2">
                        What kind of care provider are you?
                      </h3>
                      <MultiSelectField
                        name="type_of_setting"
                        control={control}
                        isAnimation={true}
                        options={groupProvider}
                        placeholder="Kind of provider"
                        maxCount={4} // You can limit the number of selections
                        rules={{ required: true }} // Additional rules can be passed here
                      />

                      {errors.type_of_setting && (
                        <p className="text-red-500 text-xs">
                          {errors.type_of_setting.message}
                        </p>
                      )}
                    </div>
                    {/* Mobility */}
                    <div>
                      <h3 className="font-semibold text-gray-700  mb-2">
                        Do you offer in house training or sponsor training? In
                        house training helps with caregiver onboarding.
                      </h3>
                      <Controller
                        name="trainer"
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
                                value="yes"
                                className="border-gray-600"
                              />
                              <Label>Yes</Label>
                            </div>
                            <div className="flex gap-1 items-center">
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
                          {errors.trainer.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-700 antialiased mb-2">
                        How do you want caregivers to contact you? [Must choose
                        one - your contact details would not be shared]:
                      </h3>
                      <MultiSelectField
                        name="settings.alert_preferences"
                        control={control}
                        isAnimation={true}
                        options={groupCall}
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

                    {/* Submit Button */}
                    <Button
                      disabled={loading || isSubmitting}
                      onClick={handleSubmit(onSubmit)}
                      className="w-full hidden gap-2 lg:flex"
                    >
                      {loading && <LoaderCircle className="animate-spin" />}{" "}
                      {loading || isSubmitting
                        ? "Updating..."
                        : `${
                            !user?.customData?.complete
                              ? "Add Details"
                              : "Update Settings"
                          }`}
                    </Button>
                  </form>
                </div>

                {/* Profile Image & Resume Section */}
                <div className="sticky top-10">
                  {/* Profile Image Upload */}
                  <div className="mb-6">
                    <h3 className="font-semibold ">Profile Image</h3>
                    <p className="text-sm antialiased mb-4">
                      Set your profile image to build trust with employers Drag
                      and drop profile image or click to select
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
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-20">
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
    </div>
  );
};

export default UpdateProfile;
