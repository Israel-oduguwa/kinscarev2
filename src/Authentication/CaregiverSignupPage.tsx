/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import MongoContext from "@/app/MongoContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CustomerSignupParams, sendCustomerSignupEmail } from "@/lib/Email";
import { trackEvent } from "@/lib/mixpanelUtils";
import { fetchUserData, isAnon } from "@/lib/utils";
import { sendSignupDripSMS } from "@/Utils/sendSmsSignup";
import { yupResolver } from "@hookform/resolvers/yup";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import {
  BadgeCheck,
  HeartHandshake,
  Loader2,
  ShieldCheck,
  Star,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useContext, useEffect, useMemo, useState } from "react";
import TagManager from "react-gtm-module";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import * as Realm from "realm-web";
import { toast } from "sonner";
import * as yup from "yup";

const OrSeparator: React.FC = () => (
  <div className="w-full flex items-center gap-2 my-4">
    <div className="flex-grow border-t border-gray-200 dark:border-gray-700" />
    <p className="text-gray-600 dark:text-gray-300 font-normal antialiased text-sm">
      or
    </p>
    <div className="flex-grow border-t border-gray-200 dark:border-gray-700" />
  </div>
);

function useCioId(): string | null {
  const [cioId, setCioId] = useState<string | null>(null);
  const params = useSearchParams();

  useEffect(() => {
    try {
      const fromQuery = params.get("cid");
      const getLname = params.get("ln");
      const getfname = params.get("fn"); // the last name and first name
      const fromLs =
        typeof window !== "undefined"
          ? localStorage.getItem("customerio_id")
          : null;
      const fromCookie =
        typeof document !== "undefined"
          ? document.cookie.match(
              new RegExp("(^| )customerio_id=([^;]+)")
            )?.[2] || null
          : null;

      const chosen = fromQuery || fromLs || fromCookie || null;
      if (fromQuery) {
        localStorage.setItem("customerio_id", fromQuery);
        localStorage.setItem("customerio_lname", getLname ?? "");
        localStorage.setItem("customerio_fname", getfname ?? "");
        document.cookie = `customerio_id=${encodeURIComponent(
          fromQuery
        )}; Max-Age=${60 * 60 * 24 * 30}; Path=/; SameSite=Lax`;
      }
      setCioId(chosen);
    } catch {
      setCioId(null);
    }
  }, [params]);

  return cioId;
}

function usePrefill() {
  const params = useSearchParams();
  return useMemo(() => {
    const get = (k: string) => {
      const v = params.get(k);
      return v ? decodeURIComponent(v) : "";
    };
    return {
      email: get("email"),
      firstName: get("fn") || get("first_name"),
      lastName: get("ln") || get("last_name"),
      city: get("city"),
      phone: get("phone"),
      utm: {
        source: params.get("utm_source") || undefined,
        medium: params.get("utm_medium") || undefined,
        campaign: params.get("utm_campaign") || undefined,
        content: params.get("utm_content") || undefined,
        term: params.get("utm_term") || undefined,
      },
    };
  }, [params]);
}

const schema = yup
  .object({
    email: yup
      .string()
      .email("Enter a valid email")
      .required("Email is required"),
    password: yup
      .string()
      .min(6, "Use at least 6 characters")
      .required("Password is required"),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref("password")], "Passwords must match")
      .required("Confirm password is required"),
    tel: yup.string().required("Phone number is required"),
  })
  .required();

interface IFormInputs {
  email: string;
  password: string;
  confirmPassword: string;
  tel: string;
}

export default function CaregiverSignupPage() {
  const {
    app,
    client,
    user,
    setUser,
    setUserData,
    setAuthenticated,
    loadingAuth,
  } = useContext(MongoContext) as any;

  const { push, refresh } = useRouter();
  const prefill = usePrefill();
  const cioId = useCioId();

  const {
    control,
    handleSubmit,
    setError,
    setValue,
    formState: { errors, isValid },
  } = useForm<IFormInputs>({
    mode: "onChange",
    shouldFocusError: true,
    resolver: yupResolver(schema),
    defaultValues: {
      email: prefill.email || "",
      password: "",
      confirmPassword: "",
      tel: prefill.phone || "",
    },
  });

  const [googleLoading, setGoogleLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [signupPageLoading, setSignupPageLoading] = useState(true);

  useEffect(() => {
    if (prefill.email) setValue("email", prefill.email);
    if (prefill.phone) setValue("tel", prefill.phone);
  }, [prefill.email, prefill.phone]);

  const routeUser = () => push("/vitae/jobs/all");

  const handleError = (
    error: any,
    fallback = "Something went wrong. Please try again."
  ) => {
    console.error(error);
    toast.error(error?.message || fallback, {
      description: "Please try again.",
      duration: 4000,
      position: "top-right",
    });
    setLoading(false);
    setGoogleLoading(false);
  };

  const createUserDuringRegistration = async (payload: any) => {
    setLoading(true);
    try {
      // get the customerid from LocalStorage or cookie
      const customerioId = localStorage.getItem("customerio_id") || cioId;
      const ipResponse = await axios.get("/api/ip").catch(() => null);
      if (ipResponse?.data) {
        const {
          ip,
          city,
          latitude,
          longitude,
          country_code,
          region_name,
          zip,
        } = ipResponse.data;
        Object.assign(payload, {
          userIp: ip,
          lname: prefill.lastName || "",
          fname: prefill.firstName || "",
          zipcode: zip,
          address: `${city}, ${region_name}, ${country_code}`,
          geocode_address: { lng: longitude, lat: latitude },
          city: payload.city || city,
          customerioId,
          returning: false,
        });
      }

      payload.role = "caregiver";

      payload.utm = prefill.utm;

      await axios.post(
        "https://kinscare-backend.onrender.com/api/v1/auth/create_user",
        payload
      );
      // update the cusstomerio Data

      await axios.post(
        `https://kinscare-backend.onrender.com/api/v1/auth/update_customerio_user`,
        {
          personId: customerioId,
          userID: payload.userID,
        }
      );
      try {
        TagManager.dataLayer({
          dataLayer: {
            event: `caregiver_sign_up`,
            userIp: payload.userIp,
            added: new Date(),
            authEmail: payload.email,
            lname: prefill.lastName || "",
            fname: prefill.firstName || "",
            authMode: payload.auth_mode,
            authTel: payload.tel?.trim(),
            role: "caregiver",
            type: "Web",
            userId: `${payload.userID}`,
          },
        });
      } catch (gtmError) {
        console.warn("Tag Manager error:", gtmError);
      }

      setAuthenticated(true);
      toast.success("Welcome to KinsCare! 🎉");
    } catch (error: any) {
      handleError(error, "Could not complete registration. Please try again.");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (response: any) => {
    const token = response?.credential;
    if (!token)
      return handleError(
        new Error("No Google credential."),
        "Google authentication failed."
      );
    setGoogleLoading(true);

    try {
      let decoded: any;
      try {
        decoded = jwtDecode(token);
      } catch {
        throw new Error("Invalid Google token format.");
      }

      const credentials = Realm.Credentials.jwt(token);
      const userObj = await app.logIn(credentials);

      if (!client)
        throw new Error(
          "Database client not initialized. Refresh and try again."
        );

      const existingUser = await client
        .db("kinshealth")
        .collection("contacts")
        .findOne({
          userID: userObj.id,
          email: userObj.profile.email,
        });

      if (!existingUser) {
        const payload: any = {
          email: userObj.profile.email,
          userID: userObj.id,
          profileImage: decoded.picture,
          fname: decoded.given_name,
          lname: decoded.family_name,
          verified: decoded.email_verified,
          auth_mode: "oauth2-google",
          googleId: userObj.identities?.[0]?.id,
          route: "Regular",
          created: new Date(),
          role: "caregiver",
          tel: prefill.phone || undefined,
          city: prefill.city || undefined,
        };

        await createUserDuringRegistration(payload);

        await userObj.refreshCustomData();
        setUser(userObj);
        refresh();
        routeUser();
      } else {
        // update the cusstomerio Data
        // get the customerid from LocalStorage or cookie
        const customerioId = localStorage.getItem("customerio_id") || cioId;
        const send = await axios.post(
          `https://kinscare-backend.onrender.com/api/v1/auth/update_customerio_user`,
          {
            personId: customerioId,
            userID: userObj.id,
          }
        );
        // console.log(send);
        setUser(userObj);
        const fetched: any = await fetchUserData(
          userObj.id,
          userObj.profile.email
        );
        if (fetched?.result) {
          await setUserData(fetched.result);
          setAuthenticated(true);
          await userObj.refreshCustomData();
          refresh();
          routeUser();
        } else {
          throw new Error(
            "Unable to retrieve your user data. Please try again."
          );
        }
      }
    } catch (error: any) {
      handleError(error, "Google login failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleError = () =>
    toast.error("Google Login Failed. Please try again.");

  const RedirectUser = async (realmUser: Realm.User | null) => {
    if (!realmUser) {
      setSignupPageLoading(false);
      return;
    }
    try {
      await realmUser.refreshCustomData();
      const cd = realmUser.customData || {};
      if (!isAnon(realmUser) && Object.keys(cd).length > 0) {
        routeUser();
      } else {
        setSignupPageLoading(false);
      }
    } catch (err: any) {
      console.error("RedirectUser error:", err);
      setSignupPageLoading(false);
    }
  };

  useEffect(() => {
    if (!loadingAuth) RedirectUser(user);
  }, [user, loadingAuth]);

  const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
    setLoading(true);
    try {
      const email = data.email.toLowerCase();
      const password = data.password;

      await app.emailPasswordAuth.registerUser({ email, password });

      const credentials = Realm.Credentials.emailPassword(email, password);
      const credentialUser = await app.logIn(credentials);
      if (!credentialUser)
        throw new Error(
          "Registration succeeded but login failed. Please sign in."
        );

      await credentialUser.refreshCustomData();
      setUser(credentialUser);

      const payload: any = {
        tel: data.tel,
        role: "caregiver",
        userID: credentialUser.id,
        email,
        auth_mode: "local-userpass",
        city: prefill.city || undefined,
      };

      await createUserDuringRegistration(payload);

      const emailParams: CustomerSignupParams = {
        email: payload.email,
        name: prefill.firstName || "there",
        role: "caregiver",
      };
      await sendCustomerSignupEmail(emailParams).catch(() => null);
      await sendSignupDripSMS({
        providerPhone: data.tel,
        country: "NG",
        role: "caregiver",
        actionUrl: "https://www.kinscare.org/vitae/update",
        jumpstartUrl: "https://www.kinscare.org/jumpstart-hiring",
      });
      const fetched: any = await fetchUserData(credentialUser.id, email);
      if (fetched?.result) {
        await setUserData(fetched.result);
        await credentialUser.refreshCustomData();
        refresh();

        try {
          trackEvent(credentialUser.customData.hash, "Sign Up", {
            phone: data.tel,
            role: "caregiver",
            userID: credentialUser.id,
            email,
            id: credentialUser.id,
            created: new Date(),
            auth_mode: "local-userpass",
          });
        } catch (mpError) {
          console.warn("Mixpanel tracking error:", mpError);
        }

        routeUser();
      } else {
        throw new Error("Unable to retrieve your user data. Please try again.");
      }
    } catch (error: any) {
      handleError(
        error,
        "Sign-up failed. Please check your details and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
 <div className="w-full min-h-screen bg-gradient-to-b from-gray-50 to-indigo-50 dark:from-neutral-900 dark:to-neutral-950">
  {/* Header */}
  <header className="py-5 px-6">
    <div className="max-w-7xl mx-auto flex justify-between items-center">
      <Link href="/" className="flex items-center gap-1 group">
        <div className=" dark:bg-neutral-800  rounded-xlgroup-hover:shadow-md transition-all">
          <Image
            width={40}
            height={40}
            className="w-10 h-10"
            src="https://firebasestorage.googleapis.com/v0/b/exhct2004.appspot.com/o/Kinscare%20Logo.svg?alt=media&token=e0ffb5fe-d0f9-4992-b505-a4180dffe444"
            alt="KinsCare logo"
          />
        </div>
        <span className="font-bold tracking-tight">KinsCare</span>
      </Link>
      <div className="flex items-center gap-3">
        <span className="hidden md:block text-sm text-gray-700 dark:text-gray-300">
          Already have an account?
        </span>
        <Link href="/signin">
          <Button className="shadow bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:from-indigo-700 hover:to-blue-700 transition-all">
            Sign in
          </Button>
        </Link>
      </div>
    </div>
  </header>

  {/* Hero */}
  <section className="px-6 py-8">
    <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-10 items-center">
      {/* Left Content */}
      <div className="space-y-8">
        <div className="bg-gradient-to-br from-indigo-600 to-blue-600 rounded-3xl p-6 shadow-xl text-white relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-blue-500/20 blur-xl"></div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-indigo-500/20 blur-2xl"></div>

          <div className="relative z-10">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Build Your Caregiving Career
            </h1>
            <p className="mt-3 text-blue-100 max-w-lg">
              Join thousands of caregivers finding meaningful work on KinsCare.
              It&apos;s free to sign up, apply, and message employers. Get matched
              to roles that fit your skills and availability.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
            <div className="flex items-start gap-3 p-3 bg-white/10 backdrop-blur-sm rounded-xl">
              <BadgeCheck className="w-6 h-6 mt-0.5 flex-shrink-0 text-blue-200" />
              <div>
                <h3 className="font-medium">Verified Facilities</h3>
                <p className="text-sm text-blue-100 mt-1">
                  Only licensed and vetted care centers
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-white/10 backdrop-blur-sm rounded-xl">
              <ShieldCheck className="w-6 h-6 mt-0.5 flex-shrink-0 text-blue-200" />
              <div>
                <h3 className="font-medium">No Fees for Caregivers</h3>
                <p className="text-sm text-blue-100 mt-1">
                  Apply and get hired—KinsCare is free for caregivers.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-white/10 backdrop-blur-sm rounded-xl">
              <HeartHandshake className="w-6 h-6 mt-0.5 flex-shrink-0 text-blue-200" />
              <div>
                <h3 className="font-medium">Supportive Community</h3>
                <p className="text-sm text-blue-100 mt-1">
                  Connect with fellow caregivers
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-white/10 backdrop-blur-sm rounded-xl">
              <Star className="w-6 h-6 mt-0.5 flex-shrink-0 text-blue-200" />
              <div>
                <h3 className="font-medium">Priority Matching</h3>
                <p className="text-sm text-blue-100 mt-1">
                  Get recommended for top roles
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="hidden md:block relative">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray to-gray-900 dark:via-neutral-900/80 dark:to-neutral-900 z-10"></div>
          <Image
            src="https://images.unsplash.com/photo-1612277795009-f95f2e8c4a02?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Caregiver at work"
            width={1200}
            height={800}
            className="rounded-2xl shadow-lg object-cover w-full h-64"
          />
          <div className="absolute bottom-4 left-4 bg-white dark:bg-neutral-800 px-4 py-2 rounded-xl shadow-md z-20">
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
              &quot;KinsCare helped me find work that fits my schedule and
              values&quot;
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              — Maria, Caregiver since 2022
            </p>
          </div>
        </div>
      </div>

      {/* Right Form */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-neutral-800 p-6 md:p-8 transition-all hover:shadow-2xl">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Create Your Caregiver Account
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Sign up to find caregiving opportunities near you—totally free.
          </p>
        </div>

        <div className="flex justify-center">
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

        <OrSeparator />

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label
              htmlFor="tel"
              className="block mb-2 text-sm font-medium text-gray-800 dark:text-gray-200"
            >
              Phone number
            </label>
            <Controller
              name="tel"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="tel"
                  inputMode="tel"
                  placeholder="+1 555 123 4567"
                  className={`rounded-xl ${errors.tel ? "border-red-500" : ""}`}
                />
              )}
            />
            {errors.tel && (
              <p className="text-red-500 mt-1 text-xs">
                {errors.tel.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="email"
              className="block mb-2 text-sm font-medium text-gray-800 dark:text-gray-200"
            >
              Email
            </label>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className={`rounded-xl ${errors.email ? "border-red-500" : ""}`}
                />
              )}
            />
            {errors.email && (
              <p className="text-red-500 mt-1 text-xs">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="password"
                className="block mb-2 text-sm font-medium text-gray-800 dark:text-gray-200"
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
                    placeholder="••••••••"
                    className={`rounded-xl ${errors.password ? "border-red-500" : ""}`}
                  />
                )}
              />
              {errors.password && (
                <p className="text-red-500 mt-1 text-xs">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="confirm-password"
                className="block mb-2 text-sm font-medium text-gray-800 dark:text-gray-200"
              >
                Confirm password
              </label>
              <Controller
                name="confirmPassword"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="confirm-password"
                    type="password"
                    placeholder="••••••••"
                    className={`rounded-xl ${errors.confirmPassword ? "border-red-500" : ""}`}
                  />
                )}
              />
              {errors.confirmPassword && (
                <p className="text-red-500 mt-1 text-xs">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>

          <div className="pt-2">
            <Button
              disabled={loading || googleLoading || !isValid}
              type="submit"
              className="w-full rounded-xl py-6 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-lg font-medium transition-all"
            >
              {(loading || googleLoading) && (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              )}
              Create Free Account
            </Button>

            <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
              By signing up, you agree to our{" "}
              <Link
                href="/terms"
                className="text-blue-600 hover:underline font-medium"
              >
                Terms
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="text-blue-600 hover:underline font-medium"
              >
                Privacy Policy
              </Link>
            </p>

            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-neutral-800">
              <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{" "}
                <Link
                  href="/signin"
                  className="font-medium text-blue-600 hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  </section>

  {/* Features */}
  <section className="py-12 px-6 bg-gradient-to-b from-white to-indigo-50 dark:from-neutral-900 dark:to-neutral-950">
    <div className="max-w-7xl mx-auto">
      <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 dark:text-white mb-10">
        Why Caregivers Choose KinsCare
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm hover:shadow-md transition-all">
          <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Smart Job Matching
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Our algorithm matches you with roles that fit your
            qualifications, schedule, and preferences.
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm hover:shadow-md transition-all">
          <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-indigo-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Fees — Ever
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Caregivers never pay to use KinsCare. Apply, chat, and get hired at no cost.
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm hover:shadow-md transition-all">
          <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Competitive Pay
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Find roles with clear pay rates and transparent expectations.
          </p>
        </div>
      </div>
    </div>
  </section>

  {/* Footer */}
  {/* <Footer /> */}
</div>

  );
}
