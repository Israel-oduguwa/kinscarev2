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
import { CredentialResponse, GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useContext, useMemo, useState } from "react";
import TagManager from "react-gtm-module";
import { Controller, useForm } from "react-hook-form";
import * as Realm from "realm-web";
import * as yup from "yup";

// Validation schema for the email signup form
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
  }:any = useForm({
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
      action: error.message && error.message.includes("name already in use") ? (
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
          geocode_address: { lng: longitude, lat: latitude },
          city,
          returning: false,
          role: "caregiver", // Force role caregiver
        });

        await axios.post(
          "https://api.kinscare.org/api/v1/auth/create_user",
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
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-lg w-full">
        <h1 className="text-3xl font-bold tracking-tight text-center mb-2">
          Welcome to Kinscare
        </h1>
        <p className="text-gray-600 text-sm text-center mb-4">
          {Object.keys(prefillData).length > 0
            ? "Grow your caregiving career—finish signing up to access KinsCare."
            : "Sign up to join the Kinscare community."}
        </p>
        {loading ? (
          <div className="flex justify-center w-full items-center">
            <Loader2 size={30} className="animate-spin" />
          </div>
        ) : (
          <div className="flex justify-center items-center flex-col gap-4">
              {/* OR Separator and Google OAuth */}
           
            <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_APP_ID as string}>
              <div className="flex justify-center gap-4 w-full">
                <GoogleLogin
                  size="large"
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  theme="filled_black"
                  text="continue_with"
                  width="100%"
                />
              </div>
            </GoogleOAuthProvider>
            <OrSeparator />
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full">
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
                        {...field}
                        type="checkbox"
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
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
                </label>
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
          
          </div>
        )}
      </div>
    </div>
  );
};

export default ExcelCNASignupPage;
