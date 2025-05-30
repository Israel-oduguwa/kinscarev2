"use client";
import { useState, useContext, useEffect } from "react";
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
import MongoContext from "@/app/MongoContext";
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
const PublicJobPostForm = ({ onSubmit }: { onSubmit: (data: any) => void }) => {
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
      title: "",
      minHours: 0,
      contacts: { address: "", city: "", email: "", tel: "", zipcode: "" },
      licenses: [],
      schedule: [],
      mobility: "",
      compensation: "",
      description: "",
    },
  });

  // Load form data from local storage on mount
  useEffect(() => {
    try {
      const savedData = localStorage.getItem("publicJobPostData");
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        Object.keys(parsedData).forEach((key: any) => {
          setValue(key, parsedData[key], { shouldValidate: true });
        });
      }
    } catch (error) {
      console.error("Error loading data from localStorage:", error);
    }
  }, [setValue]);

  // Save form data to local storage on change
  useEffect(() => {
    const subscription = watch((value) => {
      try {
        localStorage.setItem("publicJobPostData", JSON.stringify(value));
      } catch (error) {
        console.error("Error saving data to localStorage:", error);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  // Clear errors when form values change
  useEffect(() => {
    const subscription = watch(() => {
      clearErrors(); // Clear all errors when any form field changes
    });
    return () => subscription.unsubscribe();
  }, [watch, clearErrors]);

  const submitHandler = (data: any) => {
    localStorage.removeItem("publicJobPostData"); // Clear local storage on submit
    onSubmit(data);
  };

  const onEditorStateChange = (editorState: any) => {
    setValue("description", editorState);
  };

  return (
    <div className="min-h-screen py-20 bg-gradient-to-br from-blue-50 to-indigo-50 px-4">
      <Card className="shadow-xl max-w-4xl mx-auto rounded-2xl overflow-hidden border-0">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-8">
          <h1 className="text-2xl md:text-3xl font-bold text-center">
            Post Your Caregiver Job Opening
          </h1>
          <p className="text-blue-100 text-center max-w-2xl mx-auto mt-2">
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
                    className={`bg-white ${errors.title ? "border-red-500" : ""}`}
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
                  className={`rounded-lg border ${errors.description ? "border-red-500" : "border-gray-300"} p-2 bg-white`}
                >
                  <Editor
                    onChange={onEditorStateChange}
                    initialContent=""
                    usage="poss"
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
                    className={`${errors.licenses ? "border-red-500 rounded-lg border" : ""}`}
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
                  <Label className="font-medium text-gray-700 mb-2 flex items-center">
                    Schedule
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <div
                    className={`${errors.schedule ? "border-red-500 rounded-lg border" : ""}`}
                  >
                    <MultiSelectField
                      name="schedule"
                      control={control}
                      isAnimation={true}
                      options={groupSchedule}
                      placeholder="Select schedule options"
                      maxCount={4}
                      rules={{ required: true }}
                    />
                  </div>
                  {errors.schedule && (
                    <p className="text-red-500 text-sm mt-2 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.schedule.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Mobility */}
                <div>
                  <Label className="font-medium text-gray-700 mb-2 flex items-center">
                    Requires Driving?
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Controller
                    name="mobility"
                    control={control}
                    render={({ field }) => (
                      <div
                        className={`rounded-lg border ${errors.mobility ? "border-red-500" : "border-gray-300"} p-3 bg-white`}
                      >
                        <select
                          {...field}
                          className="w-full bg-transparent focus:outline-none"
                        >
                          <option value="">Select an option</option>
                          {mobilityOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  />
                  {errors.mobility && (
                    <p className="text-red-500 text-sm mt-2 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.mobility.message}
                    </p>
                  )}
                </div>

                {/* Compensation */}
                <div>
                  <Label
                    htmlFor="compensation"
                    className="font-medium text-gray-700 mb-2 flex items-center"
                  >
                    Compensation
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Input
                    id="compensation"
                    {...register("compensation")}
                    className={`bg-white ${errors.compensation ? "border-red-500" : ""}`}
                    placeholder="e.g., $20-25/hour"
                  />
                  {errors.compensation && (
                    <p className="text-red-500 text-sm mt-2 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.compensation.message}
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
                    className={`bg-white ${errors.contacts?.address ? "border-red-500" : ""}`}
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
                    className={`bg-white ${errors.contacts?.city ? "border-red-500" : ""}`}
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
                    className={`bg-white ${errors.contacts?.zipcode ? "border-red-500" : ""}`}
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
                    className={`bg-white ${errors.contacts?.email ? "border-red-500" : ""}`}
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
                    className={`bg-white ${errors.contacts?.tel ? "border-red-500" : ""}`}
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
                      className={`bg-white ${errors.minHours ? "border-red-500" : ""}`}
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

            <CardFooter className="flex justify-center px-0 pt-8 pb-0">
              <Button type="submit" className="w-full max-w-xs py-6 ">
                Post Job Opening
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

// PublicJobPostPage Component
const PublicJobPostPage = () => {
  const router = useRouter();
  const mongo: any = useContext(MongoContext);
  const { app, client, setAuthenticated, setUser, setUserData } = mongo;
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
  const handleJobSubmit = (data: any) => {
    setJobData(data);
    setIsDialogOpen(true); // Open the sign-up dialog
  };

  // Create user in the database and return user data
  const createUserDuringRegistration = async (payload: any) => {
    try {
      const response = await axios.get("/api/ip");
      const { ip, city, latitude, longitude, country_code, region_name, zip } =
        response.data;
      Object.assign(payload, {
        route: "Regular",
        userIp: ip,
        zipcode: zip,
        address: `${city}, ${region_name}, ${country_code}`,
        geocode_address: { lng: longitude, lat: latitude },
        city,
        returning: false,
        role: "provider",
      });

      const userResponse = await axios.post(
        "https://api.kinscare.org/api/v1/auth/create_user",
        payload
      );
      setAuthenticated(true);
      return userResponse.data.data; // Return addedUser containing userID and hash
    } catch (error) {
      handleError(error);
      throw error; // Re-throw to handle in the calling function
    }
  };

  const getMatchingCaregiver = async (jobID: any) => {
    try {
      setLoading(true);
      const caregiver = await axios.get(
        `https://api.kinscare.org/api/v1/providers/jobs/${jobID}/matching-caregivers`
      );
      console.log(caregiver);
      return caregiver.data.caregivers;
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // Post the job after sign-up using created user data
  const postJob = async (user: any, data: any, createdUserData: any) => {
    try {
      // const jobID = data._id || new Realm.BSON.ObjectId().toString();
      const payload = {
        ...data,
        draft: false,
        userID: createdUserData.userID,
        settings:{
          email:data.email,
          tel:data.tel
        },
        certifcations:"",
        hash: createdUserData.hash,
        profileImage: "", // Empty string as no profile image yet
      };
      const jobs = await axios.post(
        "https://api.kinscare.org/api/v1/providers/post-job",
        payload
      );
      // console.log(jobs);
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

      // Register and log in the user
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
      // console.log(createdUserData)
      const returnedData: any = await postJob(user, jobData, createdUserData);

      // we find MatchingCaregiver
      console.log(returnedData)
      const matchingCaregiver = await getMatchingCaregiver(
        returnedData?.data.id
      );
      setLoading(false);
      setIsDialogOpen(false);
      router.push(`/provider/candidates/${matchingCaregiver[0]?.userID}`);
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
          // For existing users, fetch user data from the database
          createdUserData = await client
            .db("kinshealth")
            .collection("contacts")
            .findOne({ userID: user.id });
        }

        // console.log(createdUserData)
        const returnedData: any = await postJob(user, jobData, createdUserData);
        // we find MatchingCaregiver
        const matchingCaregiver = await getMatchingCaregiver(
          returnedData?.data.id
        );
        setLoading(false);
        setIsDialogOpen(false);
        router.push(`/provider/candidates/${matchingCaregiver[0]?.userID}`);
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
        <PublicJobPostForm onSubmit={handleJobSubmit} />
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

export default PublicJobPostPage;
