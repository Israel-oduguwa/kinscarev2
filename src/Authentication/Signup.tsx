/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useContext, useEffect, useState } from "react";
import MongoContext from "@/app/MongoContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CustomerSignupParams, sendCustomerSignupEmail } from "@/lib/Email";
import { trackEvent } from "@/lib/mixpanelUtils";
import { cn, fetchUserData, isAnon } from "@/lib/utils";
import { yupResolver } from "@hookform/resolvers/yup";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { Loader2 } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import TagManager from "react-gtm-module";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import * as Realm from "realm-web";
import { toast } from "sonner";
import * as yup from "yup";
import SelectRole from "./SelectRole";
import { sendSignupDripSMS } from "@/Utils/sendSmsSignup";

// Or separator for UI
const OrSeparator: React.FC = () => (
  <div className="w-full flex items-center gap-2 my-4">
    <div className="flex-grow border-t border-gray-300" />
    <p className="text-gray-900 font-normal antialiased text-md">or</p>
    <div className="flex-grow border-t border-gray-300" />
  </div>
);

// Validation schema using Yup
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

// Form input types
interface IFormInputs {
  email: string;
  password: string;
  confirmPassword: string;
  tel: string;
  role: string;
}

// Signup component
const Signup: React.FC = () => {
  // Contexts and hooks
  const mongoContext = useContext(MongoContext) as any;
  const {
    app,
    client,
    user,
    setUser,
    setUserData,
    setAuthenticated,
    loadingAuth,
    authenticated,
  } = mongoContext;
  const { setTheme } = useTheme();
  const { push, refresh } = useRouter();

  // React Hook Form setup
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isValid },
  } = useForm<IFormInputs>({
    mode: "onChange",
    shouldFocusError: true,
    resolver: yupResolver(schema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      tel: "",
      role: "",
    },
  });

  // Local state
  const [googleLoading, setGoogleLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [signupPageLoading, setSignupPageLoading] = useState(true);
  const [selectRoleModal, setSelectRoleModal] = useState(false);

  // --- UTILITY FUNCTIONS ---

  // Error handling utility
  const handleError = (
    error: any,
    fallbackMessage = "An error occurred. Please try again."
  ) => {
    console.error("An error occurred:", error);
    toast.error(error?.message || fallbackMessage, {
      description: "Please try again.",
      duration: 4000,
      position: "top-right",
    });
    setLoading(false);
    setGoogleLoading(false);
  };

  // Redirect based on user role
  const routeUser = (role: string) => {
    switch (role) {
      case "caregiver":
        push("/vitae/jobs/all");
        break;
      case "provider":
        push("/provider/candidates/all");
        break;
      case "admin":
        push("/admin-overview");
        break;
      default:
        push("/");
    }
  };

  // Create user during registration (used for both Google & local signup)
  const createUserDuringRegistration = async (payload: any) => {
    setLoading(true);
    try {
      // Get IP/geolocation info
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

      // Backend call to create user
      await axios.post(
        "https://jrp7pe2xhj.us-east-1.awsapprunner.com/api/v1/auth/create_user",
        payload
      );

      // Tag Manager analytics
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

  // Google OAuth handler
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
      // Decode JWT
      let decodedToken: any;
      try {
        decodedToken = jwtDecode(token);
      } catch (e) {
        throw new Error("Invalid Google token format.");
      }

      // Log in to Realm with JWT
      const credentials = Realm.Credentials.jwt(token);
      const userObj = await app.logIn(credentials);

      if (!client)
        throw new Error(
          "Database client not initialized. Please refresh and try again."
        );

      // Check if user already exists
      const existingUser = await client
        .db("kinshealth")
        .collection("contacts")
        .findOne({
          userID: userObj.id,
          email: userObj.profile.email,
        });

      if (!existingUser) {
        // Build payload for backend
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

        await createUserDuringRegistration(payload);

        await userObj.refreshCustomData();
        setUser(userObj);
        setSelectRoleModal(true);
        refresh();
      } else {
        // User exists: set context, fetch data, and route
        setUser(userObj);
        const fetchedData: any = await fetchUserData(
          userObj.id,
          userObj.profile.email
        );
        if (fetchedData?.result) await setUserData(fetchedData.result);
        setAuthenticated(true);

        if (existingUser.role) {
          if (existingUser.role === "provider") {
            push("/provider/candidates/all");
          } else if (existingUser.role === "caregiver") {
            push("/vitae/jobs/all");
          } else {
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

  // Google Login error handler
  const handleGoogleError = () => {
    toast.error("Google Login Failed. Please try again.");
  };

  // Redirect user based on authentication
  const RedirectUser = async (realmUser: Realm.User | null) => {
    if (!realmUser) {
      push("/signup");
      return;
    }
    try {
      await realmUser.refreshCustomData();
      const cd = realmUser.customData || {};
      if (!isAnon(realmUser) && Object.keys(cd).length > 0) {
        switch (cd.role) {
          case "caregiver":
            push("/vitae/jobs/all");
            break;
          case "provider":
            push("/provider/candidates/all");
            break;
          default:
            setSignupPageLoading(false);
        }
      } else {
        push("/signup");
      }
    } catch (err: any) {
      console.error("RedirectUser error:", err);
      push("/signup");
    } finally {
      setSignupPageLoading(false);
    }
  };

  // Redirect on load/auth state change
  useEffect(() => {
    if (!loadingAuth) {
      RedirectUser(user);
    }
    // eslint-disable-next-line
  }, [user, loadingAuth, authenticated]);

  // Local email/password signup handler
  const onSubmit: SubmitHandler<IFormInputs> = async (data: any) => {
    setLoading(true);
    try {
      const email = data.email.toLowerCase();
      const password = data.password;

      // Register and log in with Realm
      await app.emailPasswordAuth.registerUser({ email, password });
      const credentials = Realm.Credentials.emailPassword(email, password);
      const credentialUser = await app.logIn(credentials);
      if (!credentialUser)
        throw new Error(
          "Registration succeeded but login failed. Please try signing in."
        );

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

      await createUserDuringRegistration(payload);

      // Send welcome/signup email
      const emailParams: CustomerSignupParams = {
        email: payload.email,
        name: "there", // Placeholder (no first/last name yet)
        role: payload.role,
      };
      await sendCustomerSignupEmail(emailParams);
      await sendSignupDripSMS({
        providerPhone: data.tel,
        country: "NG",
        role: data.role,
        actionUrl:
          data.role === "caregiver"
            ? "https://www.kinscare.org/vitae/update"
            : "https://www.kinscare.org/provider/account/settings/profile",
        jumpstartUrl: "https://www.kinscare.org/jumpstart-hiring",
      });
      // Fetch user data and track signup
      const fetched: any = await fetchUserData(credentialUser.id, email);
      if (fetched?.result) {
        setUserData(fetched.result);
        await credentialUser.refreshCustomData();
        refresh();

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

        // Route user based on selected role
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

  // --- UI RENDER ---

  return (
    <div className="w-full min-h-[100vh] bg-gray-100 dark:bg-inherit">
      {/* Role selection modal (shown after Google signup if role missing) */}
      <SelectRole
        selectRoleModal={selectRoleModal}
        closeSelectModal={closeSelectModal}
      />

      {/* Header */}
      <header className="py-6 px-6 sm:py-4">
        <div className="flex justify-between items-center">
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
          <div className="flex justify-between gap-6 items-center">
            <p className="text-md text-gray-800 antialiased hidden md:block">
              Already have an account?
            </p>
            <Link href="/signin">
              <Button className="shadow-2xl">Signin</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Signup form */}
      <section className="py-2 max-w-lg absolute inset-x-0 z-10 mx-auto">
        <div className="mx-4">
          <div className="bg-white rounded-2xl shadow-xl dark:border md:mt-0 xl:p-0 dark:bg-gray-800 dark:border-gray-700">
            <div className="p-6 space-y-3 md:space-y-4 sm:p-8">
              <h1 className="text-lg text-center font-bold leading-tight tracking-tight antialiased text-gray-900 md:text-xl dark:text-white">
                Create Your Account to join Kinscare
              </h1>

              {/* Google Sign-In */}
              <div className="flex justify-center gap-4 w-full">
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

              {/* Main signup form */}
              <form
                className="space-y-3 md:space-y-3"
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

                {/* Terms & Privacy */}
                <div>
                  <p className="text-gray-500 text-xs">
                    By clicking &quot;Create an account&quot;, you agree to our{" "}
                    <Link className="text-blue-600" href="/terms">
                      Terms of Use
                    </Link>{" "}
                    and{" "}
                    <Link className="text-blue-600" href="/privacy">
                      Privacy Policy
                    </Link>
                  </p>
                </div>

                {/* Submit Button */}
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

                {/* Link to signin */}
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

      {/* Decorative SVG bottom wave */}
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
