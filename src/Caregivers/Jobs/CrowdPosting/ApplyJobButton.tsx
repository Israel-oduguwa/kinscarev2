"use client";

import { useAuthContext } from "@/context/AuthContext";
import MultiSelectField from "@/components/MultiSelect";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { CustomerSignupParams, sendCustomerSignupEmail } from "@/lib/Email";
import { fetchUserData, trackEvents } from "@/lib/utils";
import { yupResolver } from "@hookform/resolvers/yup";

import { useApiClient } from "@/hooks/useApiClient";
import { jwtDecode } from "jwt-decode";
import { Loader2 as LoaderIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useContext, useState } from "react";
import TagManager from "react-gtm-module";
import { Controller, useForm } from "react-hook-form";
import * as Realm from "realm-web";
import { toast } from "sonner";
import * as yup from "yup";

interface OauthApplyProps {
  jobID?: string;
  job: any;
}

const schema:any = yup.object().shape({
  fname: yup.string().required("First name is required"),
  lname: yup.string().required("Last name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  tel: yup.string().required("Phone number is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  terms: yup.bool().oneOf([true], "You must accept the Terms and Conditions"),
  licenses: yup
    .array()
    .of(yup.string())
    .min(1, "Please select at least one license")
    .required("Licenses are required"),
  availability: yup
    .array()
    .of(yup.string())
    .min(1, "Please select at least one availability option")
    .required("Availability is required"),
});

interface FormInputs {
  fname: string;
  lname: string;
  email: string;
  tel: string;
  password: string;
  terms: boolean; // must be required, not optional
  licenses: string[];
  availability: string[];
}

function ApplyJobButton({ jobID, job }: OauthApplyProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const authData: any = useAuthContext();
  const {
    app,
    client,
    user,
    setAuthenticated,
    setUser,
    setUserData,
    userData,
  } = authData

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

  const {
    control,
    handleSubmit,
    trigger,
    getValues,
    watch,
    formState: { errors },
  } = useForm<FormInputs>({
    resolver: yupResolver(schema),
    defaultValues: {
      fname: "",
      lname: "",
      email: "",
      tel: "",
      password: "",
      terms: false,
      licenses: [],
      availability: [],
    },
  });

  const handleError = (error: any) => {
    console.error("An error occurred:", error);
    toast.error((error as any)?.message || "An unexpected error occurred.");
    setLoading(false);
  };

  const sendConfirmationEmail = async (params: CustomerSignupParams) => {
    try {
      await sendCustomerSignupEmail(params);
      toast.success("Confirmation email sent.");
    } catch (err) {
      console.error("Failed to send signup email:", err);
      toast.error("Signup succeeded, but email failed to send.");
    }
  };

  const createUserDuringRegistration = async (payload: any) => {
    try {
      const response = await privateApi.get("/api/ip");
      if (!response.data) throw new Error("Failed to retrieve IP data.");

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
        role: "caregiver",
        signup_route: "job_search",
        jobID,
      });

      await privateApi.post(
        "/api/v1/auth/create_user",
        payload
      );
      setAuthenticated(true);

      const tagManagerArgs =
        payload.auth_mode === "local-userpass"
          ? {
              dataLayer: {
                event: `${payload.role}_sign_up`,
                userIp: ip,
                added: new Date(),
                signup_route: "find_job",
                authEmail: payload.email,
                authMode: payload.auth_mode,
                authTel: payload.tel.trim(),
                role: payload.role,
                type: "Web",
                userId: payload.userID,
              },
            }
          : {
              dataLayer: {
                event: `${payload.role}_sign_up`,
                added: new Date(),
                userIp: ip,
                authEmail: payload.email,
                signup_route: "find_job",
                authMode: payload.auth_mode,
                socialFname: payload.fname,
                socialLname: payload.lname,
                type: "Web",
                userId: payload.userID,
              },
            };
      TagManager.dataLayer(tagManagerArgs);

      const fullName = `${payload.fname || ""} ${payload.lname || ""}`.trim();
      const emailParams: CustomerSignupParams = {
        email: payload.email,
        name: fullName,
        role: payload.role,
      };
      await sendConfirmationEmail(emailParams);
    } catch (error) {
      handleError(error);
      throw error;
    }
  };
  const {licenses,  availability, tel} = watch();
  // console.log(licenses, availability)
  const handleGoogleSuccess = async (response: any) => {
    const token = response.credential;
    if (!token) return;

    try {
      setLoading(true);
      const decodedToken: any = jwtDecode(token);
      const credentials = Realm.Credentials.jwt(token);
      const userObj = await app.logIn(credentials);

      const existingUser = await client
        ?.db("kinshealth")
        .collection("contacts")
        .findOne({
          userID: userObj.id,
          email: userObj.profile.email,
        });

      if (!existingUser) {
        const payload = {
          email: userObj.profile.email,
          userID: userObj.id,
          tel,
          profileImage: decodedToken.picture,
          availability,
          licenses,
          fname: decodedToken.given_name,
          lname: decodedToken.family_name,
          verified: decodedToken.email_verified,
          auth_mode: "oauth2-google",
          googleId: userObj.identities[0].id,
          route: "Regular",
          created: new Date(),
        };
        await createUserDuringRegistration(payload);

        const fetchedData: any = await fetchUserData(
          userObj.id,
          userObj.profile.email
        );
        setUserData(fetchedData.result);
        setUser(userObj);
        setAuthenticated(true);
        await userObj.refreshCustomData();
        await applyJob(
          fetchedData.result.userID,
          getValues("licenses"),
          getValues("availability")
        );
        router.push(`/vitae/applied-jobs`);
      } else {
        const fetchedData: any = await fetchUserData(
          userObj.id,
          userObj.profile.email
        );
        setUserData(fetchedData.result);
        setUser(userObj);
        setAuthenticated(true);
        await userObj.refreshCustomData();
        await applyJob(
          fetchedData.result.userID,
          getValues("licenses"),
          getValues("availability")
        );
        router.push(`/vitae/applied-jobs`);
      }
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    toast.error("Google Login Failed. Please try again.");
  };

  const onSubmit = async (data: FormInputs) => {
    try {
      setLoading(true);
      const email = data.email.toLowerCase();
      await app.emailPasswordAuth.registerUser({
        email,
        password: data.password,
      });
      const credentials = Realm.Credentials.emailPassword(email, data.password);
      const userObj = await app.logIn(credentials);

      if (userObj) {
        setUser(userObj);
        await userObj.refreshCustomData();

        const payload = {
          tel: data.tel,
          role: "caregiver",
          fname: data.fname,
          lname: data.lname,
          userID: userObj.id,
          availability:data.availability,
          licenses:data.licenses,
          email,
          auth_mode: "local-userpass",
        };
        await createUserDuringRegistration(payload);

        const fetchedData: any = await fetchUserData(userObj.id, email);
        setUserData(fetchedData.result);
        await userObj.refreshCustomData();
        await applyJob(
          fetchedData.result.userID,
          data.licenses,
          data.availability
        );
        router.push(`/vitae/applied-jobs`);
      }
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const applyJob = async (
    caregiverId: string,
    licenses: string[],
    availability: string[]
  ) => {
    try {
      const payload = {
        jobId: jobID,
        caregiverId,
        providerName: job.employer_name,
        availability,
        licenses,
        claimed: job.claimed,
      };
      const { data } = await privateApi.post(
        "/api/v1/caregivers/job/apply-referred",
        payload
      );
      // console.log(data);
      const eventPayload = {
        // subscription_id: subscriptionID,
        settings: userData?.settings,
        lname: userData?.lname,
        fname: userData?.fname,
        mode:"referral",
        tel: userData?.auth?.tel,
        jobTitle: job?.title,
        jobID: jobID,
        zipcode: userData?.zipcode,
        city: userData?.city,
        email: userData?.auth?.email,
      };

      const tagManagerArgs = {
        dataLayer: {
          ...eventPayload,
          event: `apply_job`,
        },
      };
      TagManager.dataLayer(tagManagerArgs);

      // Track purchase event
      trackEvents(contactData?.hash, "Apply Job", eventPayload);
      toast.success("Job application submitted successfully.");
    } catch (error) {
      console.error("Error applying for job:", error);
      toast.error("Failed to apply for the job.");
      throw error;
    }
  };

  return (
    <>
      <div className="my-2 space-y-3">
        <h3 className="font-semibold mb-4  text-gray-900">
          Take the next step in your caregiving career. Apply today and connect
          with trusted employers seeking reliable caregivers like you.
        </h3>

        <form className="space-y-6">
          <div>
            <p className="font-semibold text-sm text-gray-900 antialiased mb-2">
              What licenses do you have?
            </p>
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
              <p className="text-red-500 text-xs mt-1">
                {errors.licenses.message}
              </p>
            )}
          </div>
          <div>
            <p className="font-semibold text-sm text-gray-900 antialiased mb-2">
              Your availability
            </p>
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
              <p className="text-red-500 text-xs mt-1">
                {errors.availability.message}
              </p>
            )}
          </div>
        </form>
      </div>
      <GoogleOAuthProvider clientId={`${process.env.GOOGLE_APP_ID}`}>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full my-4 py-6">Start Your Application</Button>
          </DialogTrigger>
          <DialogContent className="rounded-lg shadow-xl p-6 bg-white max-w-lg">
            <div>
              <DialogTitle className="text-3xl font-bold tracking-tight text-center">
                Welcome to Kinscare
              </DialogTitle>
              <DialogDescription className="text-gray-600 text-sm text-center mb-6">
                To apply for this job, you’ll need a free KinsCare account. Sign
                up in seconds to unlock full access, apply to multiple jobs, and
                track your applications—all in one place.
              </DialogDescription>

              {loading ? (
                <div className="flex justify-center w-full items-center py-6">
                  <LoaderIcon
                    size={30}
                    className="animate-spin text-blue-600"
                  />
                </div>
              ) : (
                <div className="flex justify-center gap-4">
                  <GoogleLogin
                    size="large"
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    theme="filled_black"
                    text="continue_with"
                  />
                </div>
              )}

              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-4 mt-6"
              >
                <div className="flex gap-4">
                  <div className="w-1/2">
                    <label htmlFor="fname" className="block mb-1 text-sm">
                      First Name
                    </label>
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
                    <label htmlFor="lname" className="block mb-1 text-sm">
                      Last Name
                    </label>
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
                  <label htmlFor="email" className="block mb-1 text-sm">
                    Email Address
                  </label>
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
                  <label htmlFor="tel" className="block mb-1 text-sm">
                    Phone Number
                  </label>
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
                  <label htmlFor="password" className="block mb-1 text-sm">
                    Password
                  </label>
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
                  <label className="inline-flex items-center space-x-2">
                    <Controller
                      name="terms"
                      control={control}
                      render={({ field }) => (
                        <input
                          type="checkbox"
                          className="form-checkbox h-5 w-5 text-blue-600"
                          checked={field.value}
                          onChange={e => field.onChange(e.target.checked)}
                          onBlur={field.onBlur}
                          ref={field.ref}
                          name={field.name}
                        />
                      )}
                    />
                    <span className="text-sm">
                      I agree to the{" "}
                      <a
                        href="/terms"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 underline"
                      >
                        Terms and Conditions
                      </a>
                    </span>
                  </label>
                  {errors.terms && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.terms.message}
                    </p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <LoaderIcon className="h-5 w-5 animate-spin" />
                  ) : (
                    "Signup"
                  )}
                </Button>
              </form>
            </div>
          </DialogContent>
        </Dialog>
      </GoogleOAuthProvider>
    </>
  );
}

export default ApplyJobButton;
