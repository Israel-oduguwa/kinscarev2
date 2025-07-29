"use client";

import React, { useState, useContext } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import MongoContext from "@/app/MongoContext";
import axios from "axios";
import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";
import { cn, fetchUserData } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/mixpanelUtils";
import TagManager from "react-gtm-module";
import { CustomerSignupParams, sendCustomerSignupEmail } from "@/lib/Email";
import * as Realm from "realm-web";

// Validation schema for the email signup form
const schema = yup.object().shape({
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

const ExcelCNASignupPage = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const hashedUserData = searchParams.get("hashedUserData");

  const mongo:any = useContext(MongoContext);
  const { app, client, setAuthenticated, setUser, setUserData } = mongo;

  // Decode hashedUserData if present
  let decodedData:any = null;
  if (hashedUserData) {
    try {
      decodedData = jwtDecode(hashedUserData);
    } catch (error) {
      console.error("Failed to decode hashedUserData:", error);
      toast({
        variant: "destructive",
        description: "Invalid user data provided. Please try again.",
      });
    }
  }

  // Set default form values based on decoded data
  const defaultValues = {
    fname: decodedData?.fname || "",
    lname: decodedData?.lname || "",
    email: decodedData?.email || "",
    tel: decodedData?.phoneNumber || "",
    password: "",
    terms: false,
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues,
  });

  const handleError = (error:any) => {
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

  const createUserDuringRegistration = async (payload:any) => {
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
          role: decodedData?.role || "caregiver", // Use role from decoded data or default to "caregiver"
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
            authTel: payload.tel.trim(),
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

  const onSubmit = async (data:any) => {
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
        };
        await createUserDuringRegistration(payload);
        const fetchedData = await fetchUserData(userObj.id, email);
        if (fetchedData) {
          setUserData(fetchedData.result);
          trackEvent(userObj.customData.hash, "Sign Up", payload);
          userObj.refreshCustomData();
          router.push("/dashboard"); // Redirect to dashboard after successful signup
        }
      }
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-lg w-full">
        <h1 className="text-3xl font-bold tracking-tight text-center mb-2">
          Welcome to Kinscare
        </h1>
        <p className="text-gray-600 text-sm text-center mb-4">
          {decodedData
            ? "Your information has been pre-filled from ExcelCNA. Please review and complete the form to create your account."
            : "Sign up to join the Kinscare community."}
        </p>
        {loading ? (
          <div className="flex justify-center w-full items-center">
            <Loader2 size={30} className="animate-spin" />
          </div>
        ) : (
          <div className="flex justify-center items-center flex-col gap-4">
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
                  < loader2 className="h-5 w-5 animate-spin" />
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