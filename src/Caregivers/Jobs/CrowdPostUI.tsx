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
import { trackEvent } from "@/lib/mixpanelUtils";
// import MuiTailwindCheckbox from "@/components/muiTailwindcssCheckbox";

const CROWDPOST_URL = "https://api.kinscare.org/api/v1/providers/crowd-post" //This should be move to an env file later.

const schema = Yup.object().shape({
  title: Yup.string().required("Please enter title of your job"),
  employer_name: Yup.string()
    .max(50, "Please enter employer name for your job"),
  shift_type: Yup.array()
    .min(1, "Select at least 1 Shift type.  If you don't have one, select 'None'.")
    .required(), //.min(1, "at least 1")
  mobility: Yup.string().required(
    "Please select if your require caregiver to drive"
  ),
  description: Yup.string().required("Please enter job description"),
});

const shiftTypes = [
  { label: "Day", value: "Day" },
  { label: "Evening", value: "Evening" },
  { label: "Overnight", value: "Overnight" }
];

function CrowdPostUI({ jobID, user, userData, job, type }: any) {
  const router = useRouter();
  const defaultData = { 
    compensation: "",
    description: "",
    // minHours: "",
    shift_type: [],
    location:"",
    mobility: "",
    title: "",
    employer_name: "",
    contact_name: "",
    email:"",
    phone_number: "",
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
      description:  "",
      compensation: "",
      shift_type:  [],
      location: "",
      employer_name: "",
      phone_number: "",
      email: "",
      contact_name: "",
      title: "",
      mobility: "car_needed",
    },
  });
  const [description, setDescription] = useState<string>("");
  const [loading, setLoading] = useState(false); // General loading state
  const initialContent = "";
  // console.log(errors);
  // console.log(job);
  // console.log(userData?.profileImage, "snkjs")
  const onSubmit = async (data: any) => {
    setLoading(true);
    console.log(`onSubmit==== ${JSON.stringify(data)}`)
    try {
      if (type === "repost") {
        const payload = {
          ...data,
          draft: false,
          userID: user?.customData.userID,
          profileImage:userData?.profileImage,
          hash: user.customData.hash,
        };
        // console.log(payload);
        const response = await axios.post(
          `${CROWDPOST_URL}`,
          payload
        );
        toast({ title: "Crowd Post Job updated  successfully", variant: "default" });
        router.push(`/provider/crowd-post/${response.data.jobData._id}`);
      } else {
        const payload = {
          ...data,
          draft: false,
          userID: user?.customData.userID,
          _id: jobID,
          hash: user.customData.hash,
          profileImage:userData?.profileImage,
        };
        console.log(payload);
        const response = await axios.post(
          `${CROWDPOST_URL}`,
          payload
        );
        console.log(`response=== ${JSON.stringify(response)}`)
        // send the tracking data to mixpanel
        const mixpanelPayload = {
          name:"Crowd Post",
          user_id:userData.userID,
          authenticated:true,
          date:new Date(),
          referee_employee:true,
          step:'post job'
        }
        trackEvent(user?.customData?.hash, "Crowd Post", mixpanelPayload);
        toast({ title: "Crowd Post Job updated successfully", variant: "default" });
        router.refresh()
        router.push(`/vitae/crowd-post/${response.data.jobData._id}`);
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
    // savetoDB(formData);
  };

  const savetoDB = debounce(async (formData: any) => {
    if (type !== "repost") {
      try {
        const save = await axios.post(
          CROWDPOST_URL,
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
    // savetoDB(formData);
  };
  return (
    <div className="py-6">
      <div className="max-w-6xl mx-auto">
        <div className="py-8 mx-6 px-4 md:px-10 rounded-lg shadow-lg bg-white">
          <div>
            <div className="mb-5">
              <h2 className="font-bold text-xl text-gray-900">
              REFER & MAKE $: Share Job Opportunities
              </h2>
              <p className="text-sm antialiased mt-5">
              Help connect caregivers with the best opportunities while earning up to $5 for your referrals             
               </p>
               <p className="text-sm antialiased">
               Know of a job opening at your workplace or in your community? Post the details here to help others grow their careers. You’ll earn up to $ 5.00 and gift the employer 7 days of free access to Kinscare, where they can connect directly with top applicants!
               </p>
            </div>
            <div className="flex flex-col space-y-6">
              <div className="flex flex-col space-y-3">
                <div className="mb-0">
                  <label
                    htmlFor="job-title"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Position title
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

                <div className="mb-0">
                  <label
                    htmlFor="employer-name"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Employer Name
                  </label>
                  <input
                    type="text"
                    id="first-name"
                    className="bg-gray-50 border border-gray-300 focus-visible:outline-blue-500 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    required
                    {...register("employer_name")}
                    onBlur={(e) => {
                      handleFieldUpdate(e.target.name, e.target.value);
                    }} // To connect with react-hook-form
                  />
                  {errors.employer_name && (
                    <p className="text-red-500">{errors.employer_name.message}</p>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold text-sm text-gray-900 antialiased mb-2">
                    Select the Shift type
                  </h3>
                  <MultiSelectField
                    name="shift_type"
                    control={control}
                    isAnimation={true}
                    options={shiftTypes}
                    placeholder="Select Shift type"
                    maxCount={4} // You can limit the number of selections
                    rules={{ required: true }} // Additional rules can be passed here
                  />

                  {errors.shift_type && (
                    <p className="text-red-500 text-xs">
                      {errors.shift_type.message}
                    </p>
                  )}
                </div>


                <div className="w-full prose-lg prose-h3:my-2 prose-blockquote:my-2  discussion-content max-w-[100%]">
                  <p className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Please enter job description
                  </p>
                  <Editor
                    onChange={onEditorStateChange}
                    initialContent={initialContent}
                    usage="poss"
                  />
                </div>

                <div className="mb-0">
                  <label
                    htmlFor="employer-name"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Location (City/State)
                  </label>
                  <input
                    type="text"
                    id="location"
                    className="bg-gray-50 border border-gray-300 focus-visible:outline-blue-500 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    required
                    {...register("location")}
                    onBlur={(e) => {
                      handleFieldUpdate(e.target.name, e.target.value);
                    }} // To connect with react-hook-form
                  />
                  {errors.location && (
                    <p className="text-red-500">{errors.location.message}</p>
                  )}
                </div>



      
              </div>
              <div className="flex flex-col space-y-3">
            
                <div className="grid grid-cols-2 gap-4">
                  <div className="mb-0">
                    <label
                      htmlFor="contact_name"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Contact Name (Optional)
                    </label>
                    <input
                      type="text"
                      id="contact_name"
                      className="bg-gray-50 border border-gray-300 focus-visible:outline-blue-500 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      required
                      {...register("contact_name")} // To connect with react-hook-form
                      onBlur={(e) => {
                        handleFieldUpdate(e.target.name, e.target.value);
                      }} // To connect with react-hook-form
                    />
                    {errors.contact_name && (
                      <p className="text-red-500">
                        {errors.contact_name.message}
                      </p>
                    )}
                  </div>
               
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
                        {...register("email")} // To connect with react-hook-form
                        onBlur={(e) => {
                          handleFieldUpdate(e.target.name, e.target.value);
                        }} // To connect with react-hook-form
                      />
                      {errors?.email && (
                        <p className="text-red-500 text-xs">
                          {errors.email.message}
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
                        id="phone_number"
                        className="bg-gray-50 border border-gray-300 focus-visible:outline-blue-500 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        required
                        {...register("phone_number")} // To connect with react-hook-form
                        onBlur={(e) => {
                          handleFieldUpdate(e.target.name, e.target.value);
                        }} // To connect with react-hook-form
                      />
                      {errors.phone_number && (
                        <p className="text-red-500 text-xs">
                          {errors.phone_number.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-sm mb-2 pt-5">
                  Do you work at this employer?
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
                    Comments or Special Instructions (Optional)
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
