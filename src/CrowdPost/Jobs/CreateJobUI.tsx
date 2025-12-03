"use client";
import { useState, useContext, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, AlertCircle } from "lucide-react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { toast } from "@/components/ui/use-toast";
import { useAuthContext } from "@/context/AuthContext";
import * as Realm from "realm-web";
import MultiSelectField from "@/components/MultiSelect";
import Editor from "@/components/Editor";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import Link from "next/link";
import TagManager from "react-gtm-module";
import { RadioGroup } from "@radix-ui/react-radio-group";
import { RadioGroupItem } from "@/components/ui/radio-group";
import { debounce } from "lodash";
import { fetchUserData } from "@/lib/utils";
import { trackEvent } from "@/lib/mixpanelUtils";

// Job form validation schema
const jobSchema = Yup.object().shape({
  title: Yup.string().required("Please enter the title of your job"),
  minHours: Yup.number()
    .max(50, "Working hours must not be greater than 50 hrs.")
    .typeError("Please enter a valid number"),
  contacts: Yup.object().shape({
    address: Yup.string().required("Please enter the job location address"),
    city: Yup.string().required("Please enter the city"),
    email: Yup.string()
      .email("Please enter a valid email")
      .required("Please enter a contact email"),
    tel: Yup.string().required("Please enter a contact telephone number"),
    zipcode: Yup.string().required("Please enter the zipcode"),
  }),
  licenses: Yup.array()
    .min(1, "Select at least 1 license. If none, select 'None'")
    .required(),
  schedule: Yup.array().min(1, "Select at least 1 schedule slot").required(),
  mobility: Yup.string().required("Please select if driving is required"),
  compensation: Yup.string().required("Enter compensation or 'Negotiable'"),
  description: Yup.string().required("Please enter a job description"),
});

// Sign-up validation schema
const signupSchema = Yup.object().shape({
  fname: Yup.string().required("First name is required"),
  lname: Yup.string().required("Last name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  tel: Yup.string().required("Phone number is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  terms: Yup.boolean().oneOf(
    [true],
    "You must accept the terms and conditions"
  ),
});

interface ISignupInputs {
  fname: string;
  lname: string;
  email: string;
  tel: string;
  password: string;
  terms: boolean;
}

const groupSchedule = [
  { label: "Full time", value: "Full time" },
  { label: "Part time", value: "Part time" },
  { label: "Weekend", value: "Weekends" },
  { label: "On Call", value: "on Call" },
  { label: "Live In", value: "Live In" },
];

const groupLicenses = [
  { label: "CNA", value: "CNA or NAC" },
  { label: "HCA", value: "HCA" },
  { label: "NAR", value: "NAR" },
  { label: "Companion", value: "None" },
];

const mobilityOptions = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
];

// PublicJobPostForm Component
const PublicJobPostForm = ({ onSubmit, job, jobID, loading }: any) => {
  const [editorContent, setEditorContent] = useState<string>(
    job?.description || ""
  );
  const {
    register,
    handleSubmit,
    watch,
    getValues,
    setValue,
    control,
    clearErrors,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(jobSchema),

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
  // console.log(job);
  // Clear errors when form values change
  useEffect(() => {
    const subscription = watch(() => {
      clearErrors(); // Clear all errors when any form field changes
    });
    return () => subscription.unsubscribe();
  }, [watch, clearErrors]);

  const submitHandler = (data: any) => {
    // localStorage.removeItem("publicJobPostData"); // Clear local storage on submit
    onSubmit(data);
  };

  // const onEditorStateChange = (editorState: any) => {
  //   setValue("description", editorState);
  // };

  const onEditorStateChange = useCallback(
    (content: string) => {
      setEditorContent(content);
      setValue("description", content, {
        shouldValidate: true,
        shouldDirty: true,
      });
    },
    [setValue]
  );
  const savetoDB = debounce(async (formData: any) => {
    try {
      await axios.post(
        "http://localhost:8081/api/v1/providers/post-job",
        formData
      );
      console.log("hi");
    } catch (error) {
      console.error(error);
    }
  }, 1000);

  const handleFieldUpdate = (name: any, value: any) => {
    setValue(name, value);
    const formData = getValues();
    Object.assign(formData, {
      _id: jobID,
      draft: true,
    });
    savetoDB(formData);
  };

  return (
    <div className="min-h-screen  bg-gradient-to-br from-blue-50 to-indigo-50 px-4">
      <Card className="shadow-xl max-w-6xl mx-auto rounded-2xl overflow-hidden border-0">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-8">
          <h1 className="text-xl md:text-2xl font-bold ">
            Post Your Caregiver Job Opening
          </h1>
          <p className="text-blue-100 mt-2">
            Post a job opening for potential caregivers to view the job opening,
            and apply
          </p>
        </CardHeader>

        <CardContent className="p-6 md:p-8">
          <form onSubmit={handleSubmit(submitHandler)} className="space-y-8">
            {/* Job Information Section */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                {/* Job Title */}
                <div>
                  <Label
                    htmlFor="title"
                    className="font-medium text-gray-700 mb-2 flex items-center"
                  >
                    Job Title
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Input
                    id="title"
                    {...register("title")}
                    onBlur={(e) => {
                      handleFieldUpdate(e.target.name, e.target.value);
                    }}
                    className={`bg-white ${
                      errors.title ? "border-red-500" : ""
                    }`}
                    placeholder="e.g., Senior Caregiver"
                  />
                  {errors.title && (
                    <p className="text-red-500 text-sm mt-2 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.title.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <Label className="font-medium text-gray-700 mb-2 flex items-center">
                  Job Description
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <div
                  className={`rounded-lg border ${
                    errors.description ? "border-red-500" : "border-gray-300"
                  } p-2 bg-white`}
                >
                  <Editor
                    onChange={onEditorStateChange}
                    initialContent={editorContent}
                    usage="post"
                  />
                </div>
                {errors.description && (
                  <p className="text-red-500 text-sm mt-2 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.description.message}
                  </p>
                )}
              </div>
            </div>

            {/* Requirements Section */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-800 pb-2 border-b border-gray-200">
                Requirements
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Licenses */}
                <div>
                  <Label className="font-medium text-gray-700 mb-2 flex items-center">
                    Required Licenses
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <div
                    className={`${
                      errors.licenses ? "border-red-500 rounded-lg border" : ""
                    }`}
                  >
                    <MultiSelectField
                      name="licenses"
                      control={control}
                      isAnimation={true}
                      options={groupLicenses}
                      placeholder="Select licenses"
                      maxCount={4}
                      rules={{ required: true }}
                    />
                  </div>
                  {errors.licenses && (
                    <p className="text-red-500 text-sm mt-2 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.licenses.message}
                    </p>
                  )}
                </div>

                {/* Schedule */}
                <div>
                  <h3 className="font-semibold text-sm mb-2">
                    Does the job require caregiver to drive?
                  </h3>
                  <Controller
                    name="mobility"
                    control={control}
                    render={({ field }) => (
                      <RadioGroup
                        value={field.value}
                        onBlur={(e: any) => {
                          handleFieldUpdate(e.target.name, e.target.value);
                        }}
                        onValueChange={(value) => field.onChange(value)}
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
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-800 pb-2 border-b border-gray-200">
                Contact Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Address */}
                <div>
                  <Label
                    htmlFor="address"
                    className="font-medium text-gray-700 mb-2 flex items-center"
                  >
                    Street Address
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Input
                    id="address"
                    {...register("contacts.address")}
                    className={`bg-white ${
                      errors.contacts?.address ? "border-red-500" : ""
                    }`}
                    onBlur={(e) => {
                      handleFieldUpdate(e.target.name, e.target.value);
                    }}
                    placeholder="123 Main St"
                  />
                  {errors.contacts?.address && (
                    <p className="text-red-500 text-sm mt-2 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.contacts.address.message}
                    </p>
                  )}
                </div>

                {/* City */}
                <div>
                  <Label
                    htmlFor="city"
                    className="font-medium text-gray-700 mb-2 flex items-center"
                  >
                    City
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Input
                    id="city"
                    {...register("contacts.city")}
                    className={`bg-white ${
                      errors.contacts?.city ? "border-red-500" : ""
                    }`}
                    onBlur={(e) => {
                      handleFieldUpdate(e.target.name, e.target.value);
                    }}
                    placeholder="e.g., Seattle"
                  />
                  {errors.contacts?.city && (
                    <p className="text-red-500 text-sm mt-2 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.contacts.city.message}
                    </p>
                  )}
                </div>

                {/* Zipcode */}
                <div>
                  <Label
                    htmlFor="zipcode"
                    className="font-medium text-gray-700 mb-2 flex items-center"
                  >
                    Zipcode
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Input
                    id="zipcode"
                    {...register("contacts.zipcode")}
                    className={`bg-white ${
                      errors.contacts?.zipcode ? "border-red-500" : ""
                    }`}
                    onBlur={(e) => {
                      handleFieldUpdate(e.target.name, e.target.value);
                    }}
                    placeholder="e.g., 98101"
                  />
                  {errors.contacts?.zipcode && (
                    <p className="text-red-500 text-sm mt-2 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.contacts.zipcode.message}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <Label
                    htmlFor="email"
                    className="font-medium text-gray-700 mb-2 flex items-center"
                  >
                    Email
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Input
                    id="email"
                    {...register("contacts.email")}
                    className={`bg-white ${
                      errors.contacts?.email ? "border-red-500" : ""
                    }`}
                    onBlur={(e) => {
                      handleFieldUpdate(e.target.name, e.target.value);
                    }}
                    placeholder="contact@example.com"
                  />
                  {errors.contacts?.email && (
                    <p className="text-red-500 text-sm mt-2 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.contacts.email.message}
                    </p>
                  )}
                </div>

                {/* Telephone */}
                <div>
                  <Label
                    htmlFor="tel"
                    className="font-medium text-gray-700 mb-2 flex items-center"
                  >
                    Phone Number
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Input
                    id="tel"
                    {...register("contacts.tel")}
                    className={`bg-white ${
                      errors.contacts?.tel ? "border-red-500" : ""
                    }`}
                    onBlur={(e) => {
                      handleFieldUpdate(e.target.name, e.target.value);
                    }}
                    placeholder="(123) 456-7890"
                  />
                  {errors.contacts?.tel && (
                    <p className="text-red-500 text-sm mt-2 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.contacts.tel.message}
                    </p>
                  )}
                </div>
                {/* Minimum Hours */}
                <div>
                  <Label
                    htmlFor="minHours"
                    className="font-medium text-gray-700 mb-2 flex items-center"
                  >
                    Minimum Hours
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="minHours"
                      type="number"
                      {...register("minHours")}
                      className={`bg-white ${
                        errors.minHours ? "border-red-500" : ""
                      }`}
                      onBlur={(e) => {
                        handleFieldUpdate(e.target.name, e.target.value);
                      }}
                      placeholder="e.g., 20"
                    />
                    <span className="absolute text-xs right-3 top-3 text-gray-500">
                      hours/week
                    </span>
                  </div>
                  {errors.minHours && (
                    <p className="text-red-500 text-sm mt-2 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.minHours.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <CardFooter className="flex w-full justify-center px-0 pt-1 pb-0">
              <Button
                type="submit"
                className="w-full  py-6"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  "Post Job Opening"
                )}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>

      <div className="mt-8 text-center text-gray-600 text-sm">
        <p>
          Your job will be visible to qualified caregivers immediately after
          submission
        </p>
        <p className="mt-1">
          Need help?{" "}
          <Link href="/contact" className="text-blue-600 hover:underline">
            Contact our support team
          </Link>
        </p>
      </div>
    </div>
  );
};

// CreateJobUI Component
const CreateJobUI = ({ job, jobID }: any) => {
  const router = useRouter();
  const authData: any = useAuthContext()
  const {
    app,
    client,
    setAuthenticated,
    setUser,
    setUserData,
    user,
    userData,
  } = mongo;
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [jobData, setJobData] = useState<any>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ISignupInputs>({
    resolver: yupResolver(signupSchema),
  });

  // Handle job form submission
  const handleJobSubmit = async (data: any) => {
    if (user && userData) {
      setLoading(true);
      try {
        await postJob(user, data, userData);
        toast({ title: "Job Posted Successfully", variant: "default" });
      } catch (error) {
        handleError(error);
      } finally {
        setLoading(false);
      }
    } else {
      setJobData(data);
      setIsDialogOpen(true);
    }
  };

  // Create user in the database and return user data
  const createUserDuringRegistration = async (payload: any) => {
    try {
      const response = await axios.get("/api/ip");
      // Since this is a Referred Customer, we neeed to add a refered field
      const { ip, city, latitude, longitude, country_code, region_name, zip } =
        response.data;
      Object.assign(payload, {
        route: "Regular",
        userIp: ip,
        referred: true, // this tells the provider is referred
        zipcode: zip,
        refererUserID: job.refererUserID,
        jobID:jobID,
        referral_code: job.referral_code,
        address: `${city}, ${region_name}, ${country_code}`,
        geocode_address: { lng: longitude, lat: latitude },
        city,
        returning: false,
        role: "provider",
      });

      const userResponse = await axios.post(
        "http://localhost:8081/api/v1/auth/create_user",
        payload
      );
      setAuthenticated(true);
      return userResponse.data.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  };

  // Post the job after sign-up using created user data
  const postJob = async (user: any, data: any, createdUserData: any) => {
    // console.log(createdUserData, "line 594");
    try {
      const payload = {
        ...data,
        draft: false,
        _id: jobID,
        hash: createdUserData.hash,
        crowdPostID:job.crowdPostID,
        userID: createdUserData.userID,
        settings: {
          email: data.email,
          tel: data.tel,
        },
        referrerUserID: job.refererUserID,
        certification: "",
        referral: true,
        profileImage: createdUserData.profileImage,
        address: createdUserData.address,
      };
      const jobs = await axios.post(
        "http://localhost:8081/api/v1/providers/post-job",
        payload
      );
      setJobData(jobs?.data?.jobData);
      toast({ title: "Job Posted Successfully", variant: "default" });
      TagManager.dataLayer({
        dataLayer: {
          event: `post_job`,
          type: "post",
          ...payload,
        },
      });
      return jobs;
    } catch (error: any) {
      handleError(error);
    }
  };

  // Handle email/password sign-up
  const onSubmit: SubmitHandler<ISignupInputs> = async (data) => {
    try {
      setLoading(true);
      const email = data.email.toLowerCase();
      const password = data.password;

      await app.emailPasswordAuth.registerUser({ email, password });
      const credentials = Realm.Credentials.emailPassword(email, password);
      const user = await app.logIn(credentials);
      setUser(user);
      await user.refreshCustomData();

      const payload = {
        tel: data.tel,
        role: "provider",
        fname: data.fname,
        lname: data.lname,
        userID: user.id,
        email,
        auth_mode: "local-userpass",
      };

      const createdUserData = await createUserDuringRegistration(payload);
      await postJob(user, jobData, createdUserData);
      // after saving the user to the database, we redirect to the dashboard
      const fetchedData: any = await fetchUserData(user.id, user.profile.email);

      // console.log(fetchedData);
      setUserData(fetchedData.result);
      setUser(user);
      setAuthenticated(true);
      setLoading(false);
      router.push(`/provider/job/${jobID}`);
      setIsDialogOpen(false);
    } catch (error: any) {
      handleError(error);
    }
  };

  // Handle Google sign-up
  const handleGoogleSuccess = async (response: any) => {
    const token = response.credential;
    if (token) {
      try {
        setLoading(true);
        const decodedToken: any = jwtDecode(token);
        const credentials = Realm.Credentials.jwt(token);
        const user = await app.logIn(credentials);
        setUser(user);

        const existingUser = await client
          .db("kinshealth")
          .collection("contacts")
          .findOne({ userID: user.id, email: user.profile.email });

        let createdUserData;
        if (!existingUser) {
          const payload = {
            email: user.profile.email,
            userID: user.id,
            profileImage: decodedToken.picture,
            fname: decodedToken.given_name,
            lname: decodedToken.family_name,
            verified: decodedToken.email_verified,
            auth_mode: "oauth2-google",
            googleId: user.identities[0].id,
            created: new Date(),
          };
          createdUserData = await createUserDuringRegistration(payload);
        } else {
          createdUserData = await client
            .db("kinshealth")
            .collection("contacts")
            .findOne({ userID: user.id });
        }
        console.log(createdUserData);
        await postJob(user, jobData, createdUserData);
        // after saving the user to the database, we redirect to the dashboard
        const fetchedData: any = await fetchUserData(
          user.id,
          user.profile.email
        );

        // console.log(fetchedData);
        setUserData(fetchedData.result);
        setUser(user);
        setAuthenticated(true);
        user.refreshCustomData();
        router.push(`/provider/job/${jobID}`);
        setLoading(false);
        setIsDialogOpen(false);
      } catch (error) {
        handleError(error);
      }
    }
  };

  const handleError = (error: any) => {
    console.error("An error occurred:", error);
    toast({
      variant: "destructive",
      description: error?.message || "An error occurred. Please try again.",
    });
    setLoading(false);
  };

  return (
    <GoogleOAuthProvider clientId={process.env.GOOGLE_APP_ID || ""}>
      <div className="min-h-screen bg-gray-100 p-4">
        <PublicJobPostForm
          job={job}
          jobID={jobID}
          onSubmit={handleJobSubmit}
          loading={loading}
        />
        {/* Sign-Up Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="rounded-lg shadow-xl p-6 bg-white max-w-lg">
            <DialogTitle className="text-3xl font-bold tracking-tight text-center">
              Welcome to Kinscare
            </DialogTitle>
            <DialogDescription className="text-gray-600 text-sm text-center mb-6">
              Sign up to post your job opening.
            </DialogDescription>

            {!loading ? (
              <div className="flex justify-center gap-4">
                <GoogleLogin
                  size="large"
                  onSuccess={handleGoogleSuccess}
                  onError={() => handleError("Google login failed")}
                  theme="filled_black"
                  text="continue_with"
                />
              </div>
            ) : (
              <div className="flex justify-center w-full items-center">
                <Loader2 size={30} className="animate-spin" />
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="flex gap-4">
                <div className="w-1/2">
                  <Label htmlFor="fname">First Name</Label>
                  <Controller
                    name="fname"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="fname"
                        placeholder="First Name"
                        className={errors.fname ? "border-red-500" : ""}
                      />
                    )}
                  />
                  {errors.fname && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.fname.message}
                    </p>
                  )}
                </div>
                <div className="w-1/2">
                  <Label htmlFor="lname">Last Name</Label>
                  <Controller
                    name="lname"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="lname"
                        placeholder="Last Name"
                        className={errors.lname ? "border-red-500" : ""}
                      />
                    )}
                  />
                  {errors.lname && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.lname.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email Address</Label>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="email"
                      placeholder="Email Address"
                      className={errors.email ? "border-red-500" : ""}
                    />
                  )}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="tel">Phone Number</Label>
                <Controller
                  name="tel"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="tel"
                      placeholder="123-456-7890"
                      className={errors.tel ? "border-red-500" : ""}
                    />
                  )}
                />
                {errors.tel && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.tel.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="password"
                      type="password"
                      placeholder="Create a password"
                      className={errors.password ? "border-red-500" : ""}
                    />
                  )}
                />
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div>
                <Label className="inline-flex items-center space-x-2">
                  <Controller
                    name="terms"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="checkbox"
                        id="checkbox"
                        className="form-checkbox h-5 w-5 text-blue-600"
                      />
                    )}
                  />
                  <span className="text-sm">
                    I agree to the{" "}
                    <a
                      href="/terms"
                      target="_blank"
                      className="text-blue-500 underline"
                    >
                      Terms and Conditions
                    </a>
                  </span>
                </Label>
                {errors.terms && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.terms.message}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  "Signup"
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </GoogleOAuthProvider>
  );
};

export default CreateJobUI;
