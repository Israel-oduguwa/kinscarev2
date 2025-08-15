// This is incoming users from Voiceflow which the users would signup

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
import {
  ArrowBigLeft,
  Loader2,
  Loader2Icon,
  Loader2 as LoaderIcon,
} from "lucide-react";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ApplyNow from "@/Caregivers/Jobs/JobsUI/ApplyNow";
import TagManager from "react-gtm-module";
import { CustomerSignupParams, sendCustomerSignupEmail } from "@/lib/Email";
import { OrSeparator } from "@/components/OrSeperator";

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

interface SignupFormInputs {
  fname: string;
  lname: string;
  email: string;
  tel: string;
  password: string;
  terms: boolean;
}

const ExplorerSignup = ({ setDialog }: any) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
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

  const handleError = (error: any) => {
    console.error("An error occurred:", error);
    toast.error((error as any)?.message || "An unexpected error occurred.");
    setLoading(false);
  };

  //   const sendConfirmationEmail = async (params: CustomerSignupParams) => {
  //     try {
  //       await sendCustomerSignupEmail(params);
  //       toast.success("Confirmation email sent.");
  //     } catch (err) {
  //       console.error("Failed to send signup email:", err);
  //       toast.error("Signup succeeded, but email failed to send.");
  //     }
  //   };

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
        signup_route: "explorer",
      });

      await axios.post(
        "https://kinscare-backend.onrender.com/api/v1/auth/create_user",
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
                signup_route: "explorer",
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
                signup_route: "explorer",
                authMode: payload.auth_mode,
                socialFname: payload.fname,
                socialLname: payload.lname,
                type: "Web",
                userId: payload.userID,
              },
            };
      TagManager.dataLayer(tagManagerArgs);

      // Fire confirmation email
      //   const fullName = `${payload.fname || ""} ${payload.lname || ""}`.trim();
      //   const emailParams: CustomerSignupParams = {
      //     email: payload.email,
      //     name: fullName,
      //     role: payload.role,
      //   };
      //   await sendConfirmationEmail(emailParams);
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
        // save the recommended colleges to the database
        const aiRecommendation = JSON.parse(
          localStorage.getItem("ai_recommendation") || "null"
        );
        if (aiRecommendation) {
          const savePayload = {
            userID: userObj.id,
            recommendations: aiRecommendation,
          };

          fetch(
            "https://kinscare-backend.onrender.com/api/v1/caregivers/save-recommendation",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(savePayload),
            }
          );
        }
        // fetch the data
        const fetchedData: any = await fetchUserData(
          userObj.id,
          userObj.profile.email
        );
        setUserData(fetchedData.result);
        setUser(userObj);
        setAuthenticated(true);
        await userObj.refreshCustomData();
        router.push(`/vitae/explore/program-recommendations`);
        setDialog(false);
      } else {
        // save the recommended colleges to the database
        const aiRecommendation = JSON.parse(
          localStorage.getItem("ai_recommendation") || "null"
        );
        if (aiRecommendation) {
          const savePayload = {
            userID: userObj.id,
            recommendations: aiRecommendation,
          };

          fetch(
            "https://kinscare-backend.onrender.com/api/v1/caregivers/save-recommendation",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(savePayload),
            }
          );
        }
        // fetch the data
        const fetchedData: any = await fetchUserData(
          userObj.id,
          userObj.profile.email
        );
        setUserData(fetchedData.result);
        setUser(userObj);
        setAuthenticated(true);
        await userObj.refreshCustomData();
        router.push(`/vitae/explore/program-recommendations`);
        setDialog(false);
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

        // save the recommended colleges to the database
        const aiRecommendation = JSON.parse(
          localStorage.getItem("ai_recommendation") || "null"
        );
        if (aiRecommendation) {
          const savePayload = {
            userID: userObj.id,
            recommendations: aiRecommendation,
          };

          fetch(
            "https://kinscare-backend.onrender.com/api/v1/caregivers/save-recommendation",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(savePayload),
            }
          );
        }
        // fetch the data
        const fetchedData: any = await fetchUserData(userObj.id, email);
        setUserData(fetchedData.result);
        await userObj.refreshCustomData();
        router.push(`/vitae/explore/program-recommendations`);
        setDialog(false);
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

  return (
    <>
      <GoogleOAuthProvider clientId={`${process.env.GOOGLE_APP_ID}`}>
        {/* Social Login Dialog */}
        <h3 className=" text-center font-bold text-gray-800 drop-shadow-sm">
          Complete Your Profile to Unlock Your Best-Fit Program
        </h3>
        <p className="text-sm text-center text-gray-600 mb-4">
          We’ve matched you to a top program—finish signing up to view full
          details, save your recommendation
        </p>
        {!loading ? (
          <div className="flex justify-center mb-4 gap-4">
            <GoogleLogin
              size="large"
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme="filled_black"
              text="continue_with"
            />
          </div>
        ) : (
          <>
            <div className="flex justify-center w-full items-center">
              <Loader2Icon size={30} className="animate-spin" />
            </div>
          </>
        )}
        <OrSeparator />
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

          {/* Additional Form Fields */}
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
              <p className="text-red-500 text-xs mt-1">{errors.tel.message}</p>
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
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Signup"}
          </Button>
          {/* <Button onClick={goBack} variant="outline">
                      <ArrowBigLeft /> Back to social signup
                    </Button> */}
        </form>
      </GoogleOAuthProvider>
    </>
  );
};

export default ExplorerSignup;
