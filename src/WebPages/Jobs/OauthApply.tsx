"use client";

import React, { useContext, useState } from "react";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import * as Realm from "realm-web";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import MongoContext from "@/app/MongoContext";
import axios from "axios";
import { toast } from "sonner";
import { cn, fetchUserData } from "@/lib/utils";
import { ArrowBigLeft, Loader2 as LoaderIcon } from "lucide-react";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ApplyNow from "@/Caregivers/Jobs/JobsUI/ApplyNow";
import TagManager from "react-gtm-module";
import { CustomerSignupParams, sendCustomerSignupEmail } from "@/lib/Email";
import { sendSignupDripSMS } from "@/Utils/sendSmsSignup";
import { OrSeparator } from "@/components/OrSeperator";

interface OauthApplyProps {
  jobID?: string;
  children: React.ReactNode;
  job: any;
  // publicPage: any;
}

// Validation schema for the email signup form
const schema: any = yup.object().shape({
  fname: yup.string().required("First name is required"),
  lname: yup.string().required("Last name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  tel: yup.string().required("Phone number is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  terms: yup.bool().oneOf([true], "You must accept the Terms and Conditions"),
});

interface SignupFormInputs {
  fname: string;
  lname: string;
  email: string;
  tel: string;
  password: string;
  terms: boolean;
}

const TRACK_BASE = "https://jrp7pe2xhj.us-east-1.awsapprunner.com";

const identifyUserCustomerIO = async (args: {
  userID: string;
  email: string;
  first?: string | null;
  last?: string | null;
  role?: string;
}) => {
  const { userID, email, first, last, role = "provider" } = args;
  try {
    await axios.post(`${TRACK_BASE}/api/v1/auth/identify_user_customerio`, {
      userID,
      email,
      first: first ?? "",
      last: last ?? "",
      role,
    });
  } catch (e) {
    console.warn("Customer.io identify failed", e);
  }
};

const OauthApply: React.FC<OauthApplyProps> = ({
  jobID,
  job,
  children,
  // publicPage,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // NEW: Forgot password dialog state
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [sendingReset, setSendingReset] = useState(false);

  const router = useRouter();

  const mongo: any = useContext(MongoContext);
  const {
    app,
    client,
    user,
    setAuthenticated,
    setUser,
    setUserData,
    userData,
  } = mongo;

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch, // NEW: to prefill reset email
  } = useForm<SignupFormInputs>({
    resolver: yupResolver(schema),
    defaultValues: {
      fname: "",
      lname: "",
      email: "",
      tel: "",
      password: "",
      terms: false,
    },
  });

  const formEmail = String(watch("email") || "").trim();

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
      const response = await axios.get("/api/ip");
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

      await axios.post(
        "https://jrp7pe2xhj.us-east-1.awsapprunner.com/api/v1/auth/create_user",
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
          profileImage: decodedToken.picture,
          fname: decodedToken.given_name,
          lname: decodedToken.family_name,
          verified: decodedToken.email_verified,
          auth_mode: "oauth2-google",
          googleId: userObj.identities[0].id,
          route: "Regular",
          created: new Date(),
        };
        await createUserDuringRegistration(payload);
        await identifyUserCustomerIO({
          userID: payload.userID,
          email: payload.email,
          first: payload.fname,
          last: payload.lname,
          role: "provider",
        });
        const fetchedData: any = await fetchUserData(
          userObj.id,
          userObj.profile.email
        );
        setUserData(fetchedData.result);
        setUser(userObj);
        setAuthenticated(true);
        await userObj.refreshCustomData();

        router.push(`/vitae/jobs/${jobID}`);
      } else {
        const fetchedData: any = await fetchUserData(
          userObj.id,
          userObj.profile.email
        );
        setUserData(fetchedData.result);
        setUser(userObj);
        setAuthenticated(true);
        await userObj.refreshCustomData();

        router.push(`/vitae/jobs/${jobID}`);
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

  const onSubmit: SubmitHandler<SignupFormInputs> = async (data) => {
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
          email,
          auth_mode: "local-userpass",
        };
        await createUserDuringRegistration(payload);
        await identifyUserCustomerIO({
          userID: payload.userID,
          email: payload.email,
          first: payload.fname,
          last: payload.lname,
          role: "provider",
        });
        await sendSignupDripSMS({
          providerPhone: data.tel,
          country: "NG",
          role: "caregiver",
          actionUrl: "https://www.kinscare.org/vitae/update",
          jumpstartUrl: "https://www.kinscare.org/jumpstart-hiring",
        });
        const fetchedData: any = await fetchUserData(userObj.id, email);
        setUserData(fetchedData.result);
        await userObj.refreshCustomData();

        router.push(`/vitae/jobs/${jobID}`);
      }
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    setIsEmailDialogOpen(false);
    setIsDialogOpen(true);
  };

  // --- Forgot Password helpers ---
  const isValidResetEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resetEmail || "");
  const openForgotWithPrefill = () => {
    setResetEmail(formEmail);
    setIsForgotOpen(true);
  };
  const sendReset = async () => {
    try {
      const email = (resetEmail || "").trim().toLowerCase();
      if (!email || !isValidResetEmail) {
        toast.error("Enter a valid email address.");
        return;
      }
      setSendingReset(true);
      try {
        // Signature A

        await app.emailPasswordAuth.sendResetPasswordEmail(email);
      } catch {
        // Signature B

        await app.emailPasswordAuth.sendResetPasswordEmail({ email });
      }
      toast.success(`If ${email} is registered, a reset link has been sent.`);
      setIsForgotOpen(false);
    } catch (e: any) {
      toast.error(e?.message || "Couldn't send reset link");
    } finally {
      setSendingReset(false);
    }
  };

  return (
    <>
      {/* If already a signed-in caregiver, show ApplyNow */}
      {userData && userData.role === "caregiver" ? (
        <ApplyNow providerName={job.provider} job={job} jobID={jobID} />
      ) : (
        <>
          {userData?.role !== "provider" && (
            <GoogleOAuthProvider clientId={`${process.env.GOOGLE_APP_ID}`}>
              {/* Social/Login + Email Signup Dialog */}
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger>{children}</DialogTrigger>
                <DialogContent className="rounded-lg shadow-xl p-6 overflow-auto h-full md:h-min bg-white max-w-lg">
                  <div>
                    <DialogTitle className="text-3xl font-bold tracking-tight text-center">
                      Welcome to Kinscare
                    </DialogTitle>
                    <DialogDescription className="text-gray-600 text-sm text-center mb-6">
                      To apply for this job you need to register with Kinscare
                    </DialogDescription>
                  </div>

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
                        theme="filled_blue"
                        text="continue_with"
                        width="100%"
                        shape="pill"
                      />
                    </div>
                  )}
                  <OrSeparator />
                  {/* Email signup form */}
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

                      {/* NEW: Forgot password link */}
                      <div className="flex justify-end mt-1">
                        <button
                          type="button"
                          onClick={openForgotWithPrefill}
                          className="text-xs text-blue-600 underline hover:opacity-80"
                        >
                          Forgot password?
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="inline-flex items-center space-x-2">
                        <Controller
                          name="terms"
                          control={control}
                          render={({ field }) => (
                            <input
                              {...field}
                              type="checkbox"
                              className="form-checkbox h-5 w-5 text-blue-600"
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
                </DialogContent>
              </Dialog>

              {/* Email Signup Dialog (kept as-is, with back button) */}
              <Dialog
                open={isEmailDialogOpen}
                onOpenChange={setIsEmailDialogOpen}
              >
                <DialogContent className="rounded-lg shadow-xl p-6 overflow-auto h-full md:h-min bg-white max-w-lg">
                  <div className="flex w-full space-x-10">
                    <Button onClick={goBack} size="icon" variant="outline">
                      <ArrowBigLeft />
                    </Button>
                    <DialogTitle className="text-3xl justify-center font-bold tracking-tight mb-2 text-center">
                      Signup with Email
                    </DialogTitle>
                  </div>
                </DialogContent>
              </Dialog>

              {/* NEW: Forgot Password dialog */}
              <Dialog open={isForgotOpen} onOpenChange={setIsForgotOpen}>
                <DialogContent className="rounded-lg shadow-xl p-6 overflow-auto h-full md:h-min bg-white max-w-md">
                  <DialogTitle className="text-xl font-semibold">
                    Reset your password
                  </DialogTitle>
                  <DialogDescription className="text-gray-600 text-sm">
                    Enter the email tied to your account. We’ll send you a
                    secure reset link.
                  </DialogDescription>

                  <div className="mt-3 space-y-3">
                    <div>
                      <label
                        htmlFor="reset-email"
                        className="block mb-1 text-sm"
                      >
                        Email address
                      </label>
                      <Input
                        id="reset-email"
                        type="email"
                        placeholder="you@example.com"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                      />
                      {!isValidResetEmail && resetEmail?.length > 0 && (
                        <p className="text-xs text-red-500 mt-1">
                          Enter a valid email address.
                        </p>
                      )}
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsForgotOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        onClick={sendReset}
                        disabled={sendingReset || !isValidResetEmail}
                      >
                        {sendingReset ? (
                          <LoaderIcon className="h-4 w-4 animate-spin" />
                        ) : (
                          "Send reset link"
                        )}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </GoogleOAuthProvider>
          )}
        </>
      )}
    </>
  );
};

export default OauthApply;
