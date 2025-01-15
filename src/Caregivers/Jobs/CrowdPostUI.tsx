"use client";
import MongoContext from "@/app/MongoContext";
import Editor from "@/components/Editor";
import MultiSelectField from "@/components/MultiSelect";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/components/ui/use-toast";
import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";
import { debounce } from "lodash";
import { LoaderCircle } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import * as Yup from "yup";
// import MuiTailwindCheckbox from "@/components/muiTailwindcssCheckbox";

const CROWDPOST_URL =  "https://api.kinscare.org/api/v1/providers/post-job" //This should be move to an env file later.

const schema = Yup.object().shape({
  title: Yup.string().required("Please enter title of your job"),
  minHours: Yup.number()
    .max(50, "working hours must not be greater than 50 hrs."),
  contacts: Yup.object().shape({
    address: Yup.string().required(
      "Please enter the address of where your job is located."
    ),
    city: Yup.string().required("Please enter the city your job is located."),
    email: Yup.string()
      .email()
      .required(
        "Please enter the email address caregivers will use to contact you."
      ),
    tel: Yup.string().required(
      "Please enter the telephone number caregivers will use to contact you."
    ),
    zipcode: Yup.string().required(
      "Please enter the zipcode of your job is located."
    ),
  }),
  licenses: Yup.array()
    .min(1, "Select at least 1 license.  If you don't have one, select 'None'.")
    .required(), //.min(1, "at least 1")
  schedule: Yup.array()
    .min(1, "Select at least 1 schedule you are available to work.")
    .required(),
  mobility: Yup.string().required(
    "Please select if your require caregiver to drive"
  ),
  compensation: Yup.string().required(
    "Enter compensation per day/hour or 'DoE' or 'Negotiable'"
  ),
  //   certifications: Yup.string(), //.required("Enter required "),
  description: Yup.string().required("Please enter job description"),
});

const groupSchedule = [
  { label: "Full time", value: "Full time" },
  { label: "Part time", value: "Part time" },
  { label: "Weekend", value: "Weekends" },
  { label: "On Call", value: "on Call" },
  { label: "Live In", value: "Live In" },
];
const config1 = { label: "label", value: "value" };
const groupLicenses = [
  { label: "CNA", value: "CNA or NAC" },
  { label: "HCA", value: "HCA" },
  { label: "NAR", value: "NAR" },
  { label: "Companion", value: "None" },
];

function CrowdPostUI({ jobID, user, userData, job, type }: any) {
  const router = useRouter();
  const defaultData = {
    certifications: "",
    compensation: "",
    // contacts: {
    //   address: userData?.address,
    //   city: userData?.city,
    //   email: userData?.settings?.hr_email
    //     ? userData?.settings?.hr_email
    //     : userData?.auth?.email,
    //   tel: userData?.settings?.cell
    //     ? userData?.settings?.cell
    //     : userData?.auth?.tel
    //       ? userData?.auth?.tel
    //       : "",
    //   zipcode: userData?.zipcode,
    // },
    description: "",
    // minHours: "",
    licenses: [],
    mobility: "",
    schedule: [],
    title: "",
  };
  const {
    register,
    handleSubmit,
    control,
    getValues,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      description: job.description,
      compensation: job.compensation,
      contacts: job.contacts,
      licenses: job.licenses ? job.licenses : [],
      schedule: job.schedule ? job.schedule : [],
      minHours: job.minHours,
      title: job.title,
      mobility: "car_needed",
    },
  });
  const [description, setDescription] = useState<string>("");
  const [loading, setLoading] = useState(false); // General loading state
  const initialContent = job.description;
  // console.log(errors);
  // console.log(job);
  // console.log(userData?.profileImage, "snkjs")
  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      if (type === "repost") {
        const payload = {
          ...data,
          draft: false,
          profileImage:userData?.profileImage,
          hash: user.customData.hash,
        };
        console.log(payload);
        const response = await axios.post(
          `${CROWDPOST_URL}`,
          payload
        );
        toast({ title: "Profile updated successfully", variant: "default" });
        router.push(`/provider/crowd-post/${response.data.jobData._id}`);
      } else {
        const payload = {
          ...data,
          draft: false,
          _id: jobID,
          hash: user.customData.hash,
          profileImage:userData?.profileImage,
        };
        console.log(payload);
        await axios.post(
          `${CROWDPOST_URL}`,
          payload
        );
        toast({ title: "Profile updated successfully", variant: "default" });
        router.refresh()
        router.push(`/vitae/crowd-post/${jobID}`);
      }
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
  useEffect(() => {
    if (userData && user) {
      reset({
        description: job.description,
        compensation: job.compensation,
        contacts: job.contacts,
        licenses: job.licenses ? job.licenses : [],
        schedule: job.schedule ? job.schedule : [],
        minHours: job.minHours,
        title: job.title,
        mobility: "car_needed",
      });
    }
  }, [userData, reset, user]);
  const onEditorStateChange = (editorState: any) => {
    setValue(`description`, editorState);
    const formData = getValues(); // Get the entire form data
    Object.assign(formData, {
      userID: user?.customData.userID,
      _id: jobID,
      draft: true,
      hash: user?.customData?.hash,
      address: userData?.address,

    });
    savetoDB(formData);
  };

  const savetoDB = debounce(async (formData: any) => {
    if (type !== "repost") {
      try {
        const save = await axios.post(
          "https://api.kinscare.org/api/v1/providers/post-job",
          formData
        );
        console.log(save);
      } catch (error) {
        console.error(error);
      }
    }
  }, 1000);

  const handleFieldUpdate = (name: any, value: any) => {
    // console.log(value);
    setValue(name, value);
    const formData = getValues();
    Object.assign(formData, {
      userID: user?.customData.userID,
      profileImage:userData?.profileImage,
      _id: jobID,
      draft: true,
      hash: user?.customData?.hash,
      address: userData?.address,
    });
    savetoDB(formData);
  };
  return (
    <div className="py-6">
      <div className="max-w-6xl mx-auto">
        <div className="py-8 mx-6 px-4 md:px-10 rounded-lg shadow-lg bg-white">
          <div>
            <div className="mb-5">
              <h2 className="font-bold text-xl text-gray-900">
              Post a Job
              </h2>
              <p className="text-sm antialiased">
                Post a job opening for any company you are aware of whether he works there or not, and get rewarded.
              </p>
            </div>
            <div className="flex flex-col space-y-6">
              <div className="flex flex-col space-y-3">
                <div className="mb-0">
                  <label
                    htmlFor="job-title"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Job title
                  </label>
                  <input
                    type="text"
                    id="first-name"
                    className="bg-gray-50 border border-gray-300 focus-visible:outline-blue-500 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    required
                    {...register("title")}
                    onBlur={(e) => {
                      handleFieldUpdate(e.target.name, e.target.value);
                    }} // To connect with react-hook-form
                  />
                  {errors.title && (
                    <p className="text-red-500">{errors.title.message}</p>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-gray-900 antialiased mb-2">
                    What licenses are required?
                  </h3>
                  <MultiSelectField
                    name="licenses"
                    control={control}
                    isAnimation={true}
                    options={groupLicenses}
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
                <div className="w-full prose-lg prose-h3:my-2 prose-blockquote:my-2  discussion-content max-w-[100%]">
                  <p className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Please enter job description and required certifications
                    such as CPR/First Aid, Food Handler's etc.
                  </p>
                  <Editor
                    onChange={onEditorStateChange}
                    initialContent={initialContent}
                    usage="poss"
                  />
                </div>
                <div className="w-full">
                  <h3 className="font-semibold text-sm text-gray-900 antialiased mb-2">
                    Your Schedule
                  </h3>
                  <MultiSelectField
                    name="schedule"
                    control={control}
                    isAnimation={true}
                    options={groupSchedule}
                    placeholder="Select your schedule you want for the job"
                    maxCount={4} // You can limit the number of selections
                    rules={{ required: true }} // Additional rules can be passed here
                  />
                  {errors.schedule && (
                    <p className="text-red-500 text-xs">
                      {errors.schedule.message}
                    </p>
                  )}
                </div>
                <div className="mb-0">
                  <label
                    htmlFor="job-title"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Minimum hours per week
                  </label>
                  <input
                    type="number"
                    id="work-hrs"
                    className="bg-gray-50 border border-gray-300 focus-visible:outline-blue-500 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    required
                    {...register("minHours")} // To connect with react-hook-form
                    onBlur={(e) => {
                      handleFieldUpdate(e.target.name, e.target.value);
                    }} // To connect with react-hook-form
                  />
                  {errors?.minHours && (
                    <p className="text-red-500">{errors.minHours?.message}</p>
                  )}
                </div>
              </div>
              <div className="flex flex-col space-y-3">
                <h3 className="font-semibold text-sm text-gray-900 antialiased mb-2">
                  Fill in the Company's details below
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="mb-0">
                    <label
                      htmlFor="city"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                      City
                    </label>
                    <input
                      type="text"
                      id="city"
                      className="bg-gray-50 border border-gray-300 focus-visible:outline-blue-500 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      required
                      {...register("contacts.city")} // To connect with react-hook-form
                      onBlur={(e) => {
                        handleFieldUpdate(e.target.name, e.target.value);
                      }} // To connect with react-hook-form
                    />
                    {errors.contacts?.city && (
                      <p className="text-red-500">
                        {errors.contacts?.city.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="zipcode"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Zipcode
                    </label>
                    <input
                      type="text"
                      id="last-name"
                      className="bg-gray-50 border border-gray-300 focus-visible:outline-blue-500 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      required
                      {...register("contacts.zipcode")} // To connect with react-hook-form
                      onBlur={(e) => {
                        handleFieldUpdate(e.target.name, e.target.value);
                      }} // To connect with react-hook-form
                    />
                    {errors.contacts?.zipcode && (
                      <p className="text-red-500 text-xs">
                        {errors.contacts?.zipcode.message}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mb-0">
                  <label
                    htmlFor="job-title"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Street address
                  </label>
                  <input
                    type="text"
                    id="city"
                    className="bg-gray-50 border border-gray-300 focus-visible:outline-blue-500 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    required
                    {...register("contacts.address")} // To connect with react-hook-form
                    onBlur={(e) => {
                      handleFieldUpdate(e.target.name, e.target.value);
                    }} // To connect with react-hook-form
                  />
                  {errors.contacts?.address && (
                    <p className="text-red-500">
                      {errors.contacts?.address.message}
                    </p>
                  )}
                </div>
                <div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="city"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Email
                      </label>
                      <input
                        type="email"
                        id="Email"
                        className="bg-gray-50 border border-gray-300 focus-visible:outline-blue-500 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        required
                        {...register("contacts.email")} // To connect with react-hook-form
                        onBlur={(e) => {
                          handleFieldUpdate(e.target.name, e.target.value);
                        }} // To connect with react-hook-form
                      />
                      {errors.contacts?.email && (
                        <p className="text-red-500 text-xs">
                          {errors.contacts.email.message}
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
                        id="last-name"
                        className="bg-gray-50 border border-gray-300 focus-visible:outline-blue-500 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        required
                        {...register("contacts.tel")} // To connect with react-hook-form
                        onBlur={(e) => {
                          handleFieldUpdate(e.target.name, e.target.value);
                        }} // To connect with react-hook-form
                      />
                      {errors.contacts?.tel && (
                        <p className="text-red-500 text-xs">
                          {errors.contacts.tel.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-sm mb-2">
                    Does the job require caregiver to drive?
                  </h3>
                  <Controller
                    name="mobility"
                    control={control}
                    // rules={{ required: "This field is required" }}
                    render={({ field }) => (
                      <RadioGroup
                        value={field.value} // Bind value to the field
                        onBlur={(e: any) => {
                          handleFieldUpdate(e.target.name, e.target.value);
                        }} // To connect with react-hook-form
                        onValueChange={(value) => field.onChange(value)} // Ensure onChange updates the form
                        className="flex gap-4"
                      >
                        <div className="flex gap-1 items-center">
                          <RadioGroupItem
                            value="car_needed"
                            className="border-gray-600"
                          />
                          <Label>Yes</Label>
                        </div>
                        <div className="flex gap-1 items-center">
                          <RadioGroupItem
                            value="no_car_needed"
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
                <div className="w-full">
                  <label
                    htmlFor="job-title"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Compensation
                  </label>
                  <input
                    type="text"
                    id="compensation"
                    className="bg-gray-50 border border-gray-300 focus-visible:outline-blue-500 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    required
                    {...register("compensation")} // To connect with react-hook-form
                    onBlur={(e) => {
                      handleFieldUpdate(e.target.name, e.target.value);
                    }} // To connect with react-hook-form
                  />
                  {errors.compensation && (
                    <p className="text-red-500">
                      {errors.compensation.message}
                    </p>
                  )}
                </div>
                <div className="w-full">
                  <Button
                    disabled={loading || isSubmitting}
                    onClick={handleSubmit(onSubmit)}
                    className="w-full flex gap-2 "
                  >
                    {loading && <LoaderCircle className="animate-spin" />}{" "}
                    {loading || isSubmitting
                      ? "Posting...."
                      : type === "repost"
                        ? "Repost Job"
                        : "Post Job"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CrowdPostUI;
