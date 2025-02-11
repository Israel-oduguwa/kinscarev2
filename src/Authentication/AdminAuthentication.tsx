"use client";
import MongoContext from "@/app/MongoContext";
import { useToast } from "@/components/ui/use-toast";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import React, { useContext, useState } from "react";
import { jwtDecode } from "jwt-decode";
import * as yup from "yup";
import { Controller, useForm } from "react-hook-form";
import { ToastAction } from "@/components/ui/toast";
import { cn, fetchUserData } from "@/lib/utils";
import * as Realm from "realm-web";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { ArrowBigLeft, Loader2, Loader2Icon } from "lucide-react";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { Input } from "@/components/ui/input";

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

function AdminAuthentication() {
  const {
    app,
    client,
    user,
    setAuthenticated,
    setUser,
    setUserData,
    userData,
  }: any = useContext(MongoContext);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

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
          role: "admin",
          signup_route: "start",
        });

        await axios.post(
          "https://api.kinscare.org/api/v1/auth/create_user",
          payload
        );
        setAuthenticated(true);
      }
    } catch (error) {
      handleError(error);
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
          const fetchedData: any = await fetchUserData(
            userObj.id,
            userObj.profile.email
          );
          setUser(userObj);
          setUserData(fetchedData.result);
          // console.log("sjksjkj")
          router.push(`/admin/blog/all`);
        } else {
          // console.log("sjksjkj")
          const fetchedData: any = await fetchUserData(
            userObj.id,
            userObj.profile.email
          );
          setUserData(fetchedData.result);
          setUser(userObj);
          setAuthenticated(true);
          user.refreshCustomData();
          router.refresh();
         if(fetchedData.result.role === "admin"){
          router.push(`/admin/blog/all`);
         }else{
          router.push(`/`);
         }
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

  const handleFacebookCallback = (response: any) => {
    if (response?.status === "unknown") {
      toast({
        variant: "destructive",
        description: "Facebook Login Failed. Please try again.",
      });
      return;
    }
    console.log(response);
  };

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      const email = data.email.toLowerCase();
      const password = data.password;
      await app.emailPasswordAuth.registerUser({ email, password });
      const credentials = Realm.Credentials.emailPassword(email, password);
      await app.logIn(credentials);
      if (app.currentUser) {
        setUser(app.currentUser);
        await app.currentUser.refreshCustomData();
        const payload = {
          tel: data.tel,
          role: data.role,
          fname: data.fname,
          lname: data.lname,
          userID: app.currentUser.id,
          email,
          auth_mode: "local-userpass",
        };
        await createUserDuringRegistration(payload);
        const providerUserID = app.currentUser.id;
        const emails = app.currentUser.email;
        const user_data = await fetchUserData(providerUserID, emails);
        console.log("sjksjkj")
        if (user_data) {
          setUserData(user_data.result);
          app.currentUser.refreshCustomData();
          user.refreshCustomData();
          router.refresh();
          router.push(`/admin/blog/all`);
        }
      }
      setLoading(false);
    } catch (error) {
      handleError(error);
      setLoading(false);
    }
  };
  return (
    <>
    <GoogleOAuthProvider clientId={`${process.env.GOOGLE_APP_ID}`}>
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 p-6">
        
        {/* Social Login Dialog */}
        <div className="rounded-lg shadow-xl p-8 bg-white w-full max-w-md text-center">
          <h3 className="text-3xl font-bold tracking-tight text-gray-900">
            Kinscare Admin
          </h3>
          <p className="text-gray-600 text-sm mt-2">Sign in as admin</p>

          {/* Google Login Button */}
          {!loading ? (
            <div className="flex justify-center mt-6">
              <GoogleLogin
                size="large"
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="filled_black"
                text="continue_with"
              />
            </div>
          ) : (
            <div className="flex justify-center mt-6">
              <Loader2 size={30} className="animate-spin" />
            </div>
          )}
        </div>

        {/* OR Separator */}
        <div className="text-center my-6 text-gray-500 text-sm">OR</div>

        {/* Email Signup Dialog */}
        <div className="rounded-lg shadow-xl bg-white w-full max-w-md p-8">
          <h3 className="text-xl font-bold text-center mb-4">
            Signup with Email
          </h3>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex gap-4">
              {/* First Name */}
              <div className="w-1/2">
                <label htmlFor="fname" className="block text-sm font-medium">
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
                      className={`mt-1 ${errors.fname ? "border-red-500" : ""}`}
                    />
                  )}
                />
                {errors.fname && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.fname.message}
                  </p>
                )}
              </div>

              {/* Last Name */}
              <div className="w-1/2">
                <label htmlFor="lname" className="block text-sm font-medium">
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
                      className={`mt-1 ${errors.lname ? "border-red-500" : ""}`}
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

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium">
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
                    className={`mt-1 ${errors.email ? "border-red-500" : ""}`}
                  />
                )}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="tel" className="block text-sm font-medium">
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
                    className={`mt-1 ${errors.tel ? "border-red-500" : ""}`}
                  />
                )}
              />
              {errors.tel && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.tel.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium">
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
                    className={`mt-1 ${errors.password ? "border-red-500" : ""}`}
                  />
                )}
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Terms Agreement */}
            <div className="flex items-center gap-2">
              <Controller
                name="terms"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="checkbox"
                    className="h-5 w-5 text-blue-600"
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
            </div>

            {/* Signup Button */}
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow-md transition"
              disabled={loading}
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Signup"}
            </Button>
          </form>
        </div>
      </div>
    </GoogleOAuthProvider>
    </>
  );
}

export default AdminAuthentication;
