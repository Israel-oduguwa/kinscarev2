"use client";

import { useState, useEffect, useContext } from "react";
import MongoContext from "@/app/MongoContext";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/components/ui/use-toast";
import { cn, fetchUserData, isAnon } from "@/lib/utils";
import { yupResolver } from "@hookform/resolvers/yup";
import { ToastAction } from "@radix-ui/react-toast";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { Loader2 } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import * as Realm from "realm-web";
import * as yup from "yup";
import SelectRole from "./SelectRole";
import { GoogleLogin } from "@react-oauth/google";
import { trackEvent } from "@/lib/mixpanelUtils";
import TagManager from "react-gtm-module";
import Image from "next/image";
import { CustomerSignupParams, sendCustomerSignupEmail } from "@/lib/Email";

const OrSeparator: React.FC = () => (
  <div className="w-full flex items-center gap-2 my-4">
    <div className="flex-grow border-t border-gray-300" />
    <p className="text-gray-900 font-normal antialiased text-md">or</p>
    <div className="flex-grow border-t border-gray-300" />
  </div>
);

// Validation schema
const schema = yup
  .object({
    email: yup
      .string()
      .email("Invalid email address")
      .required("Email is required"),
    password: yup
      .string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref("password")], "Passwords must match")
      .required("Confirm password is required"),
    tel: yup.string().required("Phone number is required"),
    role: yup.string().required("Role is required"),
  })
  .required();

interface IFormInputs {
  email: string;
  password: string;
  confirmPassword: string;
  tel: string;
  role: string;
}

const Signup: React.FC = () => {
  // Context
  const mongoContext: any = useContext(MongoContext);
  const {
    app,
    client,
    user,
    userData,
    setUser,
    setUserData,
    setAuthenticated,
    loadingAuth,
    authenticated,
  } = mongoContext;

  // Theme & Toast
  const { setTheme } = useTheme();
  const { toast } = useToast();

  // React Hook Form
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<IFormInputs>({
    mode: "onChange",
    shouldFocusError: true,
    resolver: yupResolver(schema),
  });

  // Local state
  const [googleLoading, setGoogleLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [signupPageLoading, setSignupPageLoading] = useState(true);
  const [selectRoleModal, setSelectRoleModal] = useState(false);

  // Router
  const { push, refresh } = useRouter();

  // Generic error handler
  const handleError = (
    error: any,
    fallbackMessage = "An error occurred. Please try again."
  ) => {
    console.error("An error occurred:", error);
    toast({
      variant: "destructive",
      className: cn(
        "top-0 right-0 flex fixed md:max-w-[640px] md:top-4 md:right-4"
      ),
      description: error?.message || fallbackMessage,
      action: <ToastAction altText="Try again">Try again</ToastAction>,
    });
    setLoading(false);
    setGoogleLoading(false);
  };

  // Handle Google Login success
  const handleGoogleSuccess = async (response: any) => {
    const token = response?.credential;
    if (!token) {
      handleError(
        new Error("No credential received from Google."),
        "Google authentication failed."
      );
      return;
    }

    setGoogleLoading(true);
    try {
      // Decode JWT for user info
      let decodedToken: any;
      try {
        decodedToken = jwtDecode(token);
      } catch (e) {
        throw new Error("Invalid Google token format.");
      }

      // Log in to Realm with JWT
      const credentials = Realm.Credentials.jwt(token);
      const userObj = await app.logIn(credentials);

      // Ensure client is ready
      if (!client) {
        throw new Error(
          "Database client not initialized. Please refresh and try again."
        );
      }

      // Check if a user already exists in “contacts” collection
      const existingUser = await client
        .db("kinshealth")
        .collection("contacts")
        .findOne({
          userID: userObj.id,
          email: userObj.profile.email,
        });

      if (!existingUser) {
        // Build payload
        const payload: any = {
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

        // Create user in your backend
        await createUserDuringRegistration(payload);

        // Refresh customData in Realm user
        await userObj.refreshCustomData();

        // Update local context and prompt role selection
        setUser(userObj);
        setSelectRoleModal(true);

        // Refresh Next.js data cache
        refresh();
      } else {
        // Existing user: set context and redirect if role exists
        setUser(userObj);

        const fetchedData: any = await fetchUserData(
          userObj.id,
          userObj.profile.email
        );
        if (fetchedData?.result) {
          await setUserData(fetchedData.result);
        }

        setAuthenticated(true);

        if (existingUser.role) {
          // Redirect based on role immediately
          if (existingUser.role === "provider") {
            push("/provider/candidates/all");
          } else if (existingUser.role === "caregiver") {
            push("/vitae/jobs/all");
          } else {
            // If role is present but unrecognized, allow role modal
            setSelectRoleModal(true);
          }
        } else {
          setSelectRoleModal(true);
        }
      }
    } catch (error: any) {
      handleError(error, "Google login failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  // Create user during registration (local + Google)
  const createUserDuringRegistration = async (payload: any) => {
    setLoading(true);
    try {
      // Fetch IP/geo info
      const ipResponse = await axios.get("/api/ip");
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
          zipcode: zip,
          address: `${city}, ${region_name}, ${country_code}`,
          geocode_address: { lng: longitude, lat: latitude },
          city,
          returning: false,
        });
      }

      // Call your backend API to create user
      await axios.post(
        "https://api.kinscare.org/api/v1/auth/create_user",
        payload
      );

      // Tag Manager tracking
      const tagManagerArgs =
        payload.auth_mode === "local-userpass"
          ? {
              dataLayer: {
                event: `${payload.role}_sign_up`,
                userIp: payload.userIp,
                added: new Date(),
                authEmail: payload.email,
                authMode: payload.auth_mode,
                authTel: payload.tel?.trim(),
                role: `${payload.role}`,
                type: "Web",
                userId: `${payload.userID}`,
              },
            }
          : {
              dataLayer: {
                event: `social_sign_up`,
                added: new Date(),
                userIp: payload.userIp,
                authEmail: payload.email,
                authMode: payload.auth_mode,
                socialFname: payload.fname,
                socialLname: payload.lname,
                type: "Web",
                userId: `${payload.userID}`,
              },
            };

      try {
        TagManager.dataLayer(tagManagerArgs);
      } catch (gtmError) {
        console.warn("Tag Manager error:", gtmError);
      }

      setAuthenticated(true);
    } catch (error: any) {
      handleError(
        error,
        "Could not complete user registration. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Redirect user based on role / auth status
  const RedirectUser = async (realmUser: Realm.User | null) => {
    if (!realmUser) {
      push("/signup");
      return;
    }

    try {
      await realmUser.refreshCustomData();

      const cd = realmUser.customData || {};
      if (!isAnon(realmUser) && Object.keys(cd).length > 0) {
        // If role is defined in customData, redirect immediately
        switch (cd.role) {
          case "caregiver":
            push("/vitae/jobs/all");
            break;
          case "provider":
            push("/provider/candidates/all");
            break;
          case undefined:
          default:
          // Role not set → show SelectRole modal
          // setSelectRoleModal(true);
        }
      } else {
        // No valid customData or still anonymous → stay on signup
        push("/signup");
      }
    } catch (err: any) {
      console.error("RedirectUser error:", err);
      push("/signup");
    } finally {
      setSignupPageLoading(false);
    }
  };

  // Run redirect logic once user & auth flag are stable
  useEffect(() => {
    if (!loadingAuth) {
      RedirectUser(user);
    }
  }, [user, loadingAuth, authenticated]);

  // Route user after local-email signup
  const routeUser = (role: string) => {
    switch (role) {
      case "caregiver":
        push("/vitae/jobs/all");
        break;
      case "provider":
        push("/provider/candidates/all");
        break;
      case "admin":
        push("/admin/overview");
        break;
      default:
        push("/");
    }
  };

  const handleGoogleError = () => {
    toast({
      variant: "destructive",
      description: "Google Login Failed. Please try again.",
      action: <ToastAction altText="Okay">Okay</ToastAction>,
    });
  };

  // Local email/password signup
  const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
    setLoading(true);
    try {
      const email = data.email.toLowerCase();
      const password = data.password;

      // Register with Realm
      await app.emailPasswordAuth.registerUser({ email, password });

      // Log in immediately after registration
      const credentials = Realm.Credentials.emailPassword(email, password);
      const credentialUser = await app.logIn(credentials);
      if (!credentialUser) {
        throw new Error(
          "Registration succeeded but login failed. Please try signing in."
        );
      }

      // Refresh customData
      await credentialUser.refreshCustomData();
      setUser(credentialUser);

      // Build payload for backend
      const payload: any = {
        tel: data.tel,
        role: data.role,
        userID: credentialUser.id,
        email,
        auth_mode: "local-userpass",
      };

      // Create user record in backend
      await createUserDuringRegistration(payload);
      // there is no first name and last name yet
      const emailParams: CustomerSignupParams = {
        email: payload.email,
        name: "there",
        role: payload.role,
      };
      // Fire & forget:
      await sendCustomerSignupEmail(emailParams);
      // Fetch userData from your “users” collection
      const fetched: any = await fetchUserData(credentialUser.id, email);
      if (fetched?.result) {
        setUserData(fetched.result);
        await credentialUser.refreshCustomData();
        refresh();

        // Mixpanel tracking
        const mixpanelPayload = {
          phone: data.tel,
          role: data.role,
          userID: credentialUser.id,
          email,
          id: credentialUser.id,
          created: new Date(),
          auth_mode: "local-userpass",
        };
        try {
          trackEvent(
            credentialUser.customData.hash,
            "Sign Up",
            mixpanelPayload
          );
        } catch (mpError) {
          console.warn("Mixpanel tracking error:", mpError);
        }

        // Route based on role from fetched data
        routeUser(fetched.result.role);
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

  const closeSelectModal = () => setSelectRoleModal(false);

  // If authentication is still in progress, show a loader
  // if (loadingAuth || signupPageLoading) {
  //   return (
  //     <div className="animate-pulse bg-gray-100 dark:bg-inherit min-h-screen flex flex-col">
  //       {/* Header Skeleton */}
  //       <div className="py-6 px-6 sm:py-4 flex justify-between items-center">
  //         <div className="flex items-center space-x-2">
  //           <Link
  //             href="/"
  //             className="flex items-center text-lg font-semibold text-gray-900 dark:text-white"
  //           >
  //             <Image
  //               width={12}
  //               height={12}
  //               className="w-12 mr-2"
  //               src="https://firebasestorage.googleapis.com/v0/b/exhct2004.appspot.com/o/Kinscare%20Logo.svg?alt=media&token=e0ffb5fe-d0f9-4992-b505-a4180dffe444"
  //               alt="logo"
  //             />
  //             <p className="font-bold text-sm text-slate-900 tracking-tight">
  //               Kinscare
  //             </p>
  //           </Link>
  //         </div>
  //         <div className="flex items-center space-x-4">
  //           <div className="w-24 h-6 bg-gray-300 rounded-md hidden md:block" />
  //           <div className="w-20 h-8 bg-gray-300 rounded-lg" />
  //         </div>
  //       </div>

  //       {/* Form Section Skeleton */}
  //       <section className="py-6 max-w-xl mx-auto w-full space-y-6">
  //         <div className="bg-white rounded-2xl shadow-xl dark:border dark:bg-gray-800 dark:border-gray-700 p-6 space-y-6">
  //           {/* Title Skeleton */}
  //           <div className="h-8 w-2/3 bg-gray-300 rounded-md mx-auto" />

  //           {/* Google Button Skeleton */}
  //           <div className="flex justify-center">
  //             <div className="h-10 w-48 bg-gray-300 rounded-full" />
  //           </div>

  //           {/* Separator Skeleton */}
  //           <div className="w-full flex items-center gap-2 my-4">
  //             <div className="flex-grow h-0.5 bg-gray-300" />
  //             <div className="h-4 w-8 bg-gray-300 rounded-md" />
  //             <div className="flex-grow h-0.5 bg-gray-300" />
  //           </div>

  //           {/* Form Field Skeletons */}
  //           <div className="space-y-4">
  //             {/* Role Radio Group Skeleton */}
  //             <div className="space-y-2">
  //               <div className="h-4 w-32 bg-gray-300 rounded-md" />
  //               <div className="flex items-center space-x-2">
  //                 <div className="h-5 w-5 bg-gray-300 rounded-full" />
  //                 <div className="h-4 w-48 bg-gray-300 rounded-md" />
  //               </div>
  //               <div className="flex items-center space-x-2">
  //                 <div className="h-5 w-5 bg-gray-300 rounded-full" />
  //                 <div className="h-4 w-56 bg-gray-300 rounded-md" />
  //               </div>
  //             </div>

  //             {/* Phone Number Skeleton */}
  //             <div className="space-y-2">
  //               <div className="h-4 w-24 bg-gray-300 rounded-md" />
  //               <div className="h-10 w-full bg-gray-300 rounded-md" />
  //             </div>

  //             {/* Email Skeleton */}
  //             <div className="space-y-2">
  //               <div className="h-4 w-16 bg-gray-300 rounded-md" />
  //               <div className="h-10 w-full bg-gray-300 rounded-md" />
  //             </div>

  //             {/* Password & Confirm Skeleton */}
  //             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
  //               <div className="space-y-2">
  //                 <div className="h-4 w-20 bg-gray-300 rounded-md" />
  //                 <div className="h-10 w-full bg-gray-300 rounded-md" />
  //               </div>
  //               <div className="space-y-2">
  //                 <div className="h-4 w-24 bg-gray-300 rounded-md" />
  //                 <div className="h-10 w-full bg-gray-300 rounded-md" />
  //               </div>
  //             </div>

  //             {/* Terms & Conditions Skeleton */}
  //             <div className="flex items-center space-x-2">
  //               <div className="h-5 w-5 bg-gray-300 rounded-md" />
  //               <div className="h-4 w-80 bg-gray-300 rounded-md" />
  //             </div>

  //             {/* Submit Button Skeleton */}
  //             <div className="h-10 w-full bg-gray-300 rounded-lg" />
  //           </div>

  //           {/* Login Link Skeleton */}
  //           <div className="h-4 w-48 bg-gray-300 rounded-md mx-auto" />
  //         </div>
  //       </section>
  //     </div>
  //   );
  // }

  return (
    <div className="w-full min-h-[100vh] bg-gray-100 dark:bg-inherit">
      <SelectRole
        selectRoleModal={selectRoleModal}
        closeSelectModal={closeSelectModal}
      />

      <header className="py-6 px-6 sm:py-4">
        <div className="flex justify-between items-center">
          <div>
            <Link
              href="/"
              className="flex items-center text-lg font-semibold text-gray-900 dark:text-white"
            >
              <Image
                width={12}
                height={12}
                className="w-12 mr-2"
                src="https://firebasestorage.googleapis.com/v0/b/exhct2004.appspot.com/o/Kinscare%20Logo.svg?alt=media&token=e0ffb5fe-d0f9-4992-b505-a4180dffe444"
                alt="logo"
              />
              <p className="font-bold text-sm text-slate-900 tracking-tight">
                Kinscare
              </p>
            </Link>
          </div>
          <div>
            <div className="flex justify-between gap-6 items-center">
              <p className="text-md text-gray-800 antialiased hidden md:block">
                Already have an account?
              </p>
              <Link href="/signin">
                <Button className="shadow-2xl">Signin</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <section className="py-6 max-w-xl absolute inset-x-0 z-10 mx-auto">
        <div className="mx-4">
          <div className="bg-white rounded-2xl shadow-xl dark:border md:mt-0 xl:p-0 dark:bg-gray-800 dark:border-gray-700">
            <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
              <h1 className="text-xl text-center font-bold leading-tight tracking-tight antialiased text-gray-900 md:text-2xl dark:text-white">
                Create Your Account to join Kinscare
              </h1>

              {/* Google Sign-In */}
              <div className="flex justify-center">
                <GoogleLogin
                  size="large"
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  theme="outline"
                  text="continue_with"
                />
              </div>

              <OrSeparator />

              <form
                className="space-y-4 md:space-y-4"
                onSubmit={handleSubmit(onSubmit)}
              >
                {/* Role Selection */}
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 font-medium mb-2">
                    Select your role:
                  </p>
                  <Controller
                    name="role"
                    control={control}
                    render={({ field }) => (
                      <RadioGroup
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                      >
                        <div className="flex items-center mb-2 space-x-2">
                          <RadioGroupItem value="caregiver" id="r1" />
                          <Label
                            className="text-sm font-normal text-gray-700 dark:text-white"
                            htmlFor="r1"
                          >
                            I AM A CAREGIVER LOOKING FOR A JOB
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="provider" id="r2" />
                          <Label
                            className="text-sm font-normal text-gray-700 dark:text-white"
                            htmlFor="r2"
                          >
                            I AM A PROVIDER SEARCHING FOR CAREGIVER(S)/NACs
                          </Label>
                        </div>
                      </RadioGroup>
                    )}
                  />
                  {errors.role && (
                    <p className="text-red-500 mt-1 text-sm">
                      {errors.role.message}
                    </p>
                  )}
                </div>

                {/* Phone Number */}
                <div>
                  <label
                    htmlFor="tel"
                    className="block mb-1 text-sm font-medium text-gray-800 dark:text-white"
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
                        placeholder="123-456-7890"
                        className={
                          errors.tel ? "border-red-500" : "border-gray-300"
                        }
                      />
                    )}
                  />
                  {errors.tel && (
                    <p className="text-red-500 mt-1 text-sm">
                      {errors.tel.message}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block mb-1 text-sm font-medium text-gray-800 dark:text-white"
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
                        placeholder="name@company.com"
                        className={
                          errors.email ? "border-red-500" : "border-gray-300"
                        }
                      />
                    )}
                  />
                  {errors.email && (
                    <p className="text-red-500 mt-1 text-sm">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Password & Confirm Password */}
                <div className="flex flex-col space-y-4 sm:space-y-0 sm:space-x-4 sm:flex-row">
                  <div className="flex-1">
                    <label
                      htmlFor="password"
                      className="block mb-1 text-sm font-medium text-gray-800 dark:text-white"
                    >
                      Password
                    </label>
                    <Controller
                      name="password"
                      control={control}
                      render={({ field }) => (
                        <Input
                          type="password"
                          {...field}
                          id="password"
                          placeholder="••••••••"
                          className={
                            errors.password
                              ? "border-red-500"
                              : "border-gray-300"
                          }
                        />
                      )}
                    />
                    {errors.password && (
                      <p className="text-red-500 text-sm">
                        {errors.password.message}
                      </p>
                    )}
                  </div>
                  <div className="flex-1">
                    <label
                      htmlFor="confirm-password"
                      className="block mb-1 text-sm font-medium text-gray-800 dark:text-white"
                    >
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
                          className={
                            errors.confirmPassword
                              ? "border-red-500"
                              : "border-gray-300"
                          }
                        />
                      )}
                    />
                    {errors.confirmPassword && (
                      <p className="text-red-500 text-sm">
                        {errors.confirmPassword.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Terms & Conditions */}
                <div className="flex items-start">
                  <Checkbox id="terms" required />
                  <p className="ml-3 text-sm font-light text-gray-500 dark:text-gray-300">
                    I accept the{" "}
                    <a
                      href="#"
                      className="font-medium text-primary hover:underline dark:text-primary-500"
                    >
                      Terms and Conditions
                    </a>
                  </p>
                </div>

                <Button
                  disabled={loading || !isValid}
                  type="submit"
                  className="w-full hover:bg-primary-600 text-white py-2 px-4 rounded-lg transition"
                >
                  {(loading || googleLoading) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Create an account
                </Button>

                <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                  Already have an account?{" "}
                  <Link
                    href="/signin"
                    className="font-medium text-primary hover:underline dark:text-primary-500"
                  >
                    Login here
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      <div className="absolute bottom-0 -z-0 left-0 w-full">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="gradient2" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#6a11cb" />
              <stop offset="100%" stopColor="#2575fc" />
            </linearGradient>
          </defs>
          <path
            fill="url(#gradient2)"
            fillOpacity="1"
            d="M0,320L48,304C96,288,192,256,288,245.3C384,235,480,245,576,224C672,203,768,149,864,133.3C960,117,1056,139,1152,128C1248,117,1344,75,1392,53.3L1440,32L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
        </svg>
      </div>
    </div>
  );
};

export default Signup;
