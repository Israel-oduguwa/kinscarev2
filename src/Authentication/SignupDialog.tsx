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
import { OrSeparator } from "@/components/OrSeperator";

// Validation schema for the email signup form
const schema = yup.object().shape({
  fname: yup.string().required("First name is required"),
  lname: yup.string().required("Last name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  tel: yup.string().required("Phone number is required"),
  confirmPassword: yup.string().oneOf([yup.ref("password")], "Passwords must match").required("Confirm password is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  terms: yup.bool().oneOf([true], "You must accept the Terms and Conditions"),
});

interface SignupDialogProps {
  role: "provider" | "caregiver";
  additionalData?: Record<string, any>;
  onSuccess?: (userData: any) => void;
  signupRoute?: string;
  trigger: React.ReactNode;
  jumpstart: boolean;
}

const SignupDialog: React.FC<SignupDialogProps> = ({
  role,
  additionalData = {},
  onSuccess,
  signupRoute = "",
  jumpstart,
  trigger,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const mongo: any = useContext(MongoContext);
  const { app, client, setAuthenticated, setUser, setUserData } = mongo;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const handleError = (error: any) => {
    console.error("An error occurred:", error);
    toast({
      variant: "destructive",
      className: cn(
        "top-0 right-0 flex fixed md:max-w-[640px] md:top-4 md:right-4"
      ),
      description: error?.message || "An error occurred. Please try again.",
      action: <ToastAction altText="Try again">Try again</ToastAction>,
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
          route: "Regular",
          userIp: ip,
          zipcode: zip,
          address: `${city}, ${region_name}, ${country_code}`,
          geocode_address: { lng: longitude, lat: latitude },
          city,
          returning: false,
          role,
          signup_route: signupRoute,
          ...additionalData,
        });

        await axios.post(
          "https://api.kinscare.org/api/v1/auth/create_user",
          payload
        );
        const tagManagerArgs =
          payload.auth_mode === "local-userpass"
            ? {
                dataLayer: {
                  event: `${role}_sign_up`,
                  userIp: ip,
                  added: new Date(),
                  signup_route: signupRoute,
                  authEmail: payload.email,
                  authMode: payload.auth_mode,
                  authTel: payload.tel.trim(),
                  role,
                  type: "Web",
                  userId: payload.userID,
                },
              }
            : {
                dataLayer: {
                  event: `${role}_sign_up`,
                  added: new Date(),
                  userIp: ip,
                  authEmail: payload.email,
                  signup_route: signupRoute,
                  authMode: payload.auth_mode,
                  socialFname: payload.fname,
                  socialLname: payload.lname,
                  type: "Web",
                  userId: payload.userID,
                },
              };

        TagManager.dataLayer(tagManagerArgs);
        setAuthenticated(true);
        const fullName = `${payload.fname || ""} ${payload.lname || ""}`.trim();
        const emailParams: CustomerSignupParams = {
          email: payload.email,
          name: fullName,
          role,
        };
        await sendCustomerSignupEmail(emailParams);
      }
    } catch (error) {
      handleError(error);
      throw error;
    }
  };

  const handleGoogleSuccess = async (response: any) => {
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

        const payload = {
          email: userObj.profile.email,
          userID: userObj.id,
          profileImage: decodedToken.picture,
          fname: decodedToken.given_name,
          lname: decodedToken.family_name,
          verified: decodedToken.email_verified,
          auth_mode: "oauth2-google",
          googleId: userObj.id,
          route: "Regular",
          created: new Date(),
        };

        if (!existingUser) {
          await createUserDuringRegistration(payload);
          const fetchedData: any = await fetchUserData(
            userObj.id,
            userObj.profile.email
          );
          trackEvent(app.currentUser.customData.hash, "Sign Up", payload);
          setUserData(fetchedData.result);
          setUser(userObj);
          setAuthenticated(true);
          userObj.refreshCustomData();
          if (onSuccess) onSuccess(fetchedData.result);
        } else {
          const fetchedData: any = await fetchUserData(
            userObj.id,
            userObj.profile.email
          );
          const mixpanelPayload = {
            auth_mode: "oauth2-google",
            date_time: new Date().toISOString(),
            route: "Regular",
            created: new Date(),
          };
          trackEvent(userObj.customData.hash, "Sign In", mixpanelPayload);
          const tagManagerArgs = {
            dataLayer: {
              event: `sign_in`,
              added: new Date(),
              auth_mode: "oauth2-google",
              hash: userObj.customData.hash,
              role: userObj.customData.role,
              type: "Web",
              userId: userObj.id,
            },
          };
          TagManager.dataLayer(tagManagerArgs);
          setUserData(fetchedData.result);
          setUser(userObj);
          setAuthenticated(true);
          userObj.refreshCustomData();
          if (onSuccess) onSuccess(fetchedData.result);
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
      description: "Google Login Failed. Please try again.",
    });
  };

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
        };
        await createUserDuringRegistration(payload);
        const fetchedData: any = await fetchUserData(userObj.id, email);
        if (fetchedData) {
          setUserData(fetchedData.result);
          trackEvent(userObj.customData.hash, "Sign Up", payload);
          userObj.refreshCustomData();
          if (onSuccess) onSuccess(fetchedData.result);
        }
      }
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GoogleOAuthProvider clientId={`${process.env.GOOGLE_APP_ID}`}>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogContent className="rounded-lg shadow-xl p-6 bg-white max-w-lg">
          {jumpstart ? (
            <>
              {" "}
              <div>
                <DialogTitle className="text-3xl font-bold tracking-tight text-center">
                  Welcome to Kinscare
                </DialogTitle>
                <DialogDescription className="text-gray-600 text-sm text-center mb-2">
                  Let us start matching you with caregivers—and enjoy 2 weeks of
                  full access to browse and hire on your own.
                </DialogDescription>
              </div>
            </>
          ) : (
            <div>
              <DialogTitle className="text-3xl font-bold tracking-tight text-center">
                Welcome to Kinscare
              </DialogTitle>
              <DialogDescription className="text-gray-600 text-sm text-center mb-2">
                {role === "caregiver"
                  ? "Sign up to connect with caregivers."
                  : "Join the Kinscare community effortlessly."}
              </DialogDescription>
            </div>
          )}

          {!loading ? (
            <div className="flex justify-center items-center flex-col gap-4">
              <GoogleLogin
                size="large"
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="filled_black"
                text="continue_with"
              />
              <OrSeparator />

              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-2 w-full"
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
                <div className="flex-1">
                    <label htmlFor="confirm-password" className="block mb-1 text-sm font-medium text-gray-800 dark:text-white">
                      Confirm password
                    </label>
                    <Controller
                      name="confirmPassword"
                      control={control}
                      render={({ field }) => (
                        <Input
                          type="password"
                          {...field}
                          id="confirm-password"
                          placeholder="••••••••"
                          className={errors.confirmPassword ? "border-red-500" : "border-gray-300"}
                        />
                      )}
                    />
                    {errors.confirmPassword && (
                      <p className="text-red-500 text-xs">{errors.confirmPassword.message}</p>
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
                          value=""
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
          ) : (
            <div className="flex justify-center w-full items-center">
              <Loader2 size={30} className="animate-spin" />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </GoogleOAuthProvider>
  );
};

export default SignupDialog;
