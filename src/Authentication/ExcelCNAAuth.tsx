"use client";
import MongoContext from "@/app/MongoContext";
import { OrSeparator } from "@/components/OrSeperator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";
import { sendCustomerSignupEmail } from "@/lib/Email";
import { trackEvent } from "@/lib/mixpanelUtils";
import { cn, fetchUserData } from "@/lib/utils";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  CredentialResponse,
  GoogleLogin,
  GoogleOAuthProvider,
} from "@react-oauth/google";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useContext, useMemo, useState } from "react";
import TagManager from "react-gtm-module";
import { Controller, useForm } from "react-hook-form";
import * as Realm from "realm-web";
import * as yup from "yup";

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

const ExcelCNASignupPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const mongo = useContext(MongoContext) as any;
  const { app, client, setAuthenticated, setUser, setUserData } = mongo;

  // ---- Prefill Logic: decodedData or fallback to URL params ----
  const prefillData = useMemo(() => {
    let data: any = {};
    const hashedUserData = searchParams.get("hashedUserData");
    if (hashedUserData) {
      try {
        data = jwtDecode<Record<string, any>>(hashedUserData) || {};
      } catch (err) {
        toast({
          variant: "destructive",
          description: "Invalid user data provided. Please try again.",
        });
        data = {};
      }
    }
    // Fallback to URL params
    const urlFields = ["fname", "lname", "email", "tel", "role"];
    urlFields.forEach((key) => {
      if (!data[key] && searchParams.get(key)) {
        data[key] = searchParams.get(key);
      }
    });
    // Map phoneNumber (from JWT) to tel
    if (data.phoneNumber && !data.tel) data.tel = data.phoneNumber;
    if (!data.role) data.role = "caregiver";
    return data;
  }, [searchParams, toast]);

  // Set default form values
  const defaultValues = {
    fname: prefillData.fname || "",
    lname: prefillData.lname || "",
    email: prefillData.email || "",
    tel: prefillData.tel || "",
    password: "",
    terms: false,
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
  }: any = useForm({
    resolver: yupResolver(schema),
    defaultValues,
  });

  const handleError = (error: any) => {
    console.error("An error occurred:", error);
    let description = "An error occurred. Please try again.";
    if (error.message && error.message.includes("name already in use")) {
      description = "This email is already registered. Please log in instead.";
    }
    toast({
      variant: "destructive",
      className: cn(
        "top-0 right-0 flex fixed md:max-w-[640px] md:top-4 md:right-4"
      ),
      description,
      action:
        error.message && error.message.includes("name already in use") ? (
          <ToastAction altText="Log in" onClick={() => router.push("/login")}>
            Log in
          </ToastAction>
        ) : (
          <ToastAction altText="Try again">Try again</ToastAction>
        ),
    });
    setLoading(false);
  };

  const createUserDuringRegistration = async (payload: any) => {
    try {
      const response = await axios.get("/api/ip");
      if (response.data) {
        const {
          ip,
          city,
          latitude,
          longitude,
          country_code,
          region_name,
          zip,
        } = response.data;
        Object.assign(payload, {
          route: "excel_cna",
          userIp: ip,
          zipcode: zip,
          address: `${city}, ${region_name}, ${country_code}`,
          source: "excel-cna",
          geocode_address: { lng: longitude, lat: latitude },
          city,
          returning: false,
          role: "caregiver", // Force role caregiver
        });

        await axios.post(
          "https://jrp7pe2xhj.us-east-1.awsapprunner.com/api/v1/auth/create_user",
          payload
        );
        const tagManagerArgs = {
          dataLayer: {
            event: `${payload.role}_sign_up`,
            userIp: ip,
            added: new Date(),
            authEmail: payload.email,
            authMode: payload.auth_mode,
            authTel: payload.tel?.trim(),
            source:"excel_cna",
            role: payload.role,
            type: "Web",
            userId: payload.userID,
          },
        };
        TagManager.dataLayer(tagManagerArgs);
        setAuthenticated(true);
        const fullName = `${payload.fname || ""} ${payload.lname || ""}`.trim();
        const emailParams = {
          email: payload.email,
          name: fullName,
          role: payload.role,
        };
        await sendCustomerSignupEmail(emailParams);
      }
    } catch (error) {
      handleError(error);
      throw error;
    }
  };

  // -- GOOGLE SIGNUP HANDLER --
  const handleGoogleSuccess = async (response: CredentialResponse) => {
    const token = response.credential;
    if (token) {
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
            googleId: userObj.identities[0]?.id,
            route: "excel_cna",
            created: new Date(),
            role: "caregiver",
          };
          await createUserDuringRegistration(payload);

          const fetchedData: any = await fetchUserData(
            userObj.id,
            userObj.profile.email
          );

          trackEvent(userObj.customData.hash, "Sign Up", payload);

          setUserData(fetchedData.result);
          setUser(userObj);
          setAuthenticated(true);
          userObj.refreshCustomData();
          router.push("/vitae/jobs/all");
        } else {
          const fetchedData: any = await fetchUserData(
            userObj.id,
            userObj.profile.email
          );
          const mixpanelPayload = {
            auth_mode: "oauth2-google",
            date_time: new Date().toISOString(),
            route: "excel_cna",
            created: new Date(),
            role: "caregiver",
          };
          trackEvent(userObj.customData?.hash, "Sign In", mixpanelPayload);
          const tagManagerArgs = {
            dataLayer: {
              event: `sign_in`,
              added: new Date(),
              auth_mode: "oauth2-google",
              hash: userObj.customData?.hash,
              role: "caregiver",
              type: "Web",
              userId: `${userObj?.id}`,
            },
          };
          TagManager.dataLayer(tagManagerArgs);
          setUserData(fetchedData.result);
          setUser(userObj);
          setAuthenticated(true);
          userObj.refreshCustomData();
          router.push("/vitae/jobs/all");
        }
      } catch (error) {
        handleError(error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleGoogleError = () => {
    toast({
      variant: "destructive",
      description: "Google authentication failed. Please try again.",
    });
  };

  // -- EMAIL/PASSWORD SUBMIT --
  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      const email = data.email.toLowerCase();
      const password = data.password;
      await app.emailPasswordAuth.registerUser({ email, password });
      const credentials = Realm.Credentials.emailPassword(email, password);
      const userObj = await app.logIn(credentials);

      if (userObj) {
        setUser(userObj);
        await userObj.refreshCustomData();
        const payload = {
          tel: data.tel,
          fname: data.fname,
          lname: data.lname,
          userID: userObj.id,
          email,
          auth_mode: "local-userpass",
          role: "caregiver",
        };
        await createUserDuringRegistration(payload);
        const fetchedData = await fetchUserData(userObj.id, email);
        if (fetchedData) {
          setUserData(fetchedData.result);
          trackEvent(userObj.customData.hash, "Sign Up", payload);
          userObj.refreshCustomData();
          router.push("/vitae/jobs/all");
        }
      }
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  // -- Render --
  return (
    <>
      {/* Header + Page Shell */}
      <div className="min-h-screen flex flex-col justify-center bg-gray-50 dark:bg-gray-950 px-4 sm:px-6 py-8 sm:py-10 lg:py-12">
        <div className="mx-auto w-full max-w-[28rem] sm:max-w-xl">
          {/* Top header */}
          <header className="py-1 sm:py-2">
            <div className="flex items-center justify-between">
              <Link
                href="/"
                className="flex items-center gap-2 text-base sm:text-lg font-semibold text-gray-900 dark:text-white"
              >
                <Image
                  width={48}
                  height={48}
                  className="w-10 h-10 sm:w-12 sm:h-12"
                  src="https://firebasestorage.googleapis.com/v0/b/exhct2004.appspot.com/o/Kinscare%20Logo.svg?alt=media&token=e0ffb5fe-d0f9-4992-b505-a4180dffe444"
                  alt="KinsCare logo"
                />
                <span className="text-slate-900 dark:text-slate-100 tracking-tight">
                  Kinscare
                </span>
              </Link>
            </div>
          </header>

          {/* Card */}
          <div className="relative overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-lg sm:shadow-xl">
            {/* Decorative blobs (subtle on mobile) */}
            <div className="pointer-events-none absolute -top-24 -right-24 h-40 w-40 rounded-full bg-indigo-100/70 dark:bg-indigo-900/20 blur-xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 h-36 w-36 rounded-full bg-blue-100/60 dark:bg-blue-900/20 blur-xl" />

            <div className="relative z-10 p-5 sm:p-8">
              {/* Title */}
              <div className="mb-6 text-center">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                  Welcome to Kinscare
                </h1>
                <p className="mt-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300 max-w-md mx-auto">
                  {Object.keys(prefillData).length > 0
                    ? "Grow your caregiving career—finish signing up to access KinsCare."
                    : "Sign up to join the Kinscare community."}
                </p>
              </div>

              {loading ? (
                <div className="flex justify-center items-center py-16">
                  <Loader2 size={40} className="animate-spin text-indigo-600" />
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {/* Google */}
                  <GoogleOAuthProvider clientId={`${process.env.GOOGLE_APP_ID}`}>
                    <div className="flex w-full">
                      <div className="w-full">
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
                    </div>
                  </GoogleOAuthProvider>

                  <div className="px-2">
                    <OrSeparator />
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div className="space-y-1.5">
                        <label
                          htmlFor="fname"
                          className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200"
                        >
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
                              className={cn(
                                "h-11 sm:h-11 rounded-lg",
                                errors.fname ? "border-red-500" : ""
                              )}
                            />
                          )}
                        />
                        {errors.fname && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.fname.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <label
                          htmlFor="lname"
                          className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200"
                        >
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
                              className={cn(
                                "h-11 sm:h-11 rounded-lg",
                                errors.lname ? "border-red-500" : ""
                              )}
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

                    <div className="space-y-1.5">
                      <label
                        htmlFor="email"
                        className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200"
                      >
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
                            className={cn(
                              "h-11 sm:h-11 rounded-lg",
                              errors.email ? "border-red-500" : ""
                            )}
                          />
                        )}
                      />
                      {errors.email && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.email.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label
                        htmlFor="tel"
                        className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200"
                      >
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
                            className={cn(
                              "h-11 sm:h-11 rounded-lg",
                              errors.tel ? "border-red-500" : ""
                            )}
                          />
                        )}
                      />
                      {errors.tel && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.tel.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label
                        htmlFor="password"
                        className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200"
                      >
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
                            className={cn(
                              "h-11 sm:h-11 rounded-lg",
                              errors.password ? "border-red-500" : ""
                            )}
                          />
                        )}
                      />
                      {errors.password && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.password.message}
                        </p>
                      )}
                    </div>

                    <div className="flex items-start gap-3 pt-1.5">
                      <Controller
                        name="terms"
                        control={control}
                        render={({ field }) => (
                          <div className="flex items-center h-5">
                            <input
                              {...field}
                              type="checkbox"
                              checked={field.value}
                              onChange={(e) => field.onChange(e.target.checked)}
                              className="h-4 w-4 sm:h-4 sm:w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                              aria-label="Agree to Terms and Conditions"
                            />
                          </div>
                        )}
                      />
                      <div className="text-xs sm:text-sm">
                        <label
                          htmlFor="terms"
                          className="font-medium text-gray-700 dark:text-gray-200"
                        >
                          I agree to the{" "}
                          <a
                            href="/terms"
                            target="_blank"
                            className="text-indigo-600 hover:text-indigo-500 font-medium underline-offset-2 hover:underline"
                          >
                            Terms and Conditions
                          </a>
                        </label>
                        {errors.terms && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.terms.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-11 sm:h-11 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 transition-all shadow-md hover:shadow-lg active:scale-[0.99]"
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="h-5 w-5 animate-spin text-white" />
                      ) : (
                        <span className="text-white font-medium">
                          Create Account
                        </span>
                      )}
                    </Button>
                  </form>

                  <div className="text-center pt-3 sm:pt-4">
                    <p className="text-sm sm:text-sm text-gray-600 dark:text-gray-300">
                      Already have an account?{" "}
                      <a
                        href="/signin"
                        className="font-medium text-indigo-600 hover:text-indigo-500 underline-offset-2 hover:underline"
                      >
                        Sign in
                      </a>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Safe area bottom padding for mobile */}
          <div className="h-6 sm:h-8" />
        </div>
      </div>
    </>
  );
};

export default ExcelCNASignupPage;
