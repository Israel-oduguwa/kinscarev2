"use client";
import MongoContext from "@/app/MongoContext";
import { ModeToggle } from "@/components/ModeToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { cn, fetchUserData, isAnon } from "@/lib/utils";
import { yupResolver } from "@hookform/resolvers/yup";
import { ToastAction } from "@radix-ui/react-toast";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import * as Realm from "realm-web";
import * as yup from "yup";
import SelectRole from "./SelectRole";

const OrSeparator: React.FC = () => {
  return (
    <div className="w-full flex items-center gap-2 my-4">
      <div className="flex-grow border-t border-gray-300"></div>
      <p className="text-gray-900 font-normal antialiased text-md">or</p>
      <div className="flex-grow border-t border-gray-300"></div>
    </div>
  );
};

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
  })
  .required();

interface IFormInputs {
  email: string;
  password: string;
}

const Signin: React.FC = () => {
  const mongoContext: any = useContext(MongoContext);
  const {
    app,
    client,
    user,
    setUserData,
    setUser,
    authenticated,
    setAuthenticated,
    loadingAuth,
  } = mongoContext;
  const { toast } = useToast();
  const { push, refresh } = useRouter();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormInputs>({
    mode: "onChange",
    shouldFocusError: true,
    resolver: yupResolver(schema),
  });
  const [googleLoading, setGoogleLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectRoleModal, setSelectRoleModal] = useState(false);
  // Error handler
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

  // Handle Google Credential Response

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
          createUserDuringRegistration(payload);
          user.refreshCustomData();
          refresh();
          setUser(userObj);
          setSelectRoleModal(true);
        } else {
          // console.log("hi");
          // console.log(existingUser);
          setUser(userObj);
          setAuthenticated(true);
          const fetchedData: any = await fetchUserData(
            userObj.id,
            userObj.profile.email
          );
          // console.log(fetchedData);
          await setUserData(fetchedData.result);
          if (existingUser.role) {
            if (fetchedData.result.role === "provider") {
              push("/provider/candidates/all");
            }
          } else {
            setSelectRoleModal(true);
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
    // console.log(response);
  };
  // Load Google Script
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
        break;
    }
  };
  // Register user during registration
  const createUserDuringRegistration = async (payload: object) => {
    try {
      setLoading(true);
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
          address: `${city}, ${region_name}, ${country_code}`,
          geocode_address: { lng: longitude, lat: latitude },
          zipcode: zip,
          city,
          returning: false,
        });
        const createUser = await axios.post(
          "https://api.kinscare.org/api/v1/auth/create_user",
          payload
        );
        // console.log(createUser);
        // await user.callFunction("web_add_social_user_custom_data", payload);
        setAuthenticated(true);
        setLoading(false);
      }
    } catch (error) {
      handleError(error);
    }
  };

  const RedirectUser = async (
    user: Realm.User<
      globalThis.Realm.DefaultFunctionsFactory &
        globalThis.Realm.BaseFunctionsFactory,
      { [x: string]: unknown },
      globalThis.Realm.DefaultUserProfileData
    >
  ) => {
    // this redirects users to their intended page;
    // console.log(authenticated);
    // console.log(loadingAuth);
    if (authenticated) {
      await user?.refreshCustomData();
      if (!isAnon(user) && Object.keys(user?.customData || {}).length > 0) {
        switch (user.customData.role) {
          case "caregiver":
            push("/vitae/jobs/all");
            break;
          case "provider":
            push("/provider/candidates/all");
            console.log("user is a provider");
            break;
          case undefined:
            console.log("show a modal user can use to check the role");
            // if (!user?.customData?.role) push("/select");
            setSelectRoleModal(true);
            break;
        }
        // setSignupPageLoading(false);
      } else {
        // setSignupPageLoading(false);
        push("/signin");
      }
    } else {
      push("/signin");
    }
  };

  useEffect(() => {
    RedirectUser(user);
  }, [user, authenticated]);

  // Form submit handler
  const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
    try {
      setLoading(true);
      const email = data.email.toLowerCase();
      const password = data.password;
      const credentials = Realm.Credentials.emailPassword(email, password);
      await app.logIn(credentials);

      if (app.currentUser) {
        setUser(app.currentUser);
        // console.log("User logged in, refreshing custom data");
        await app.currentUser.refreshCustomData(); // Try to refresh the data here
        // lets get the user from the database
        const userID = app.currentUser.id;
        const email = app.currentUser.email;
        const user_data: any = await fetchUserData(userID, email);
        // console.log(user_data.result);
        if (user_data) {
          setUserData(user_data.result); // set the user data
          user.refreshCustomData();
          // console.log(user_data.result.role);
          refresh();
          routeUser(user_data.result.role);
        }
      } else {
        console.error("User is not logged in");
      }
      setLoading(false);
    } catch (error) {
      handleError(error);
      setLoading(false);
    }
  };
  const closeSelectModal = () => setSelectRoleModal(false);

  return (
    <GoogleOAuthProvider clientId={`${process.env.GOOGLE_APP_ID}`}>
      <div className="relative w-full min-h-[100vh] bg-gray-100 dark:bg-inherit">
        {/* Wavy Background */}

        <SelectRole
          selectRoleModal={selectRoleModal}
          closeSelectModal={closeSelectModal}
        />
        <header className=" mx-auto py-6 px-8 z-10 sm:py-4">
          <div className="flex justify-between items-center">
            <div>
              <Link
                href="/"
                className="flex items-center text-lg font-semibold text-gray-900 dark:text-white"
              >
                <img
                  className="w-12 mr-1"
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
                {/* <ModeToggle /> */}
                <p className="text-md text-gray-800 dark:text-gray-50 antialiased hidden md:block">
                  Don't have an account?
                </p>
                <Link href="/signup">
                  <Button className="shadow-2xl">Signup</Button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        <section className="py-6 mt-0 md:mt-10 z-10 relative max-w-lg m-auto">
          <div className="mx-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden">
              <div className="p-6 space-y-6 md:space-y-6 sm:p-8">
                <h1 className="text-xl text-center font-bold leading-tight tracking-tight antialiased text-gray-900 md:text-2xl dark:text-white">
                  Sign in to Kinscare
                </h1>
                {/* Centered Google Sign-In */}
                <div className="flex w-full justify-center">
                  <GoogleLogin
                    size="large"
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    theme="outline"
                    text="continue_with"
                  />
                </div>
                <OrSeparator />
                {/* <div>
                <p className="text-sm text-center text-gray-800 dark:text-gray-50 antialiased">
                  Sign in with email and password
                </p>
              </div> */}
                <form
                  className="space-y-2 md:space-y-4"
                  onSubmit={handleSubmit(onSubmit)}
                >
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
                          className={errors.email ? "border-red-500" : ""}
                        />
                      )}
                    />
                    {errors.email && (
                      <p className="text-red-500 mt-1 text-sm">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                  <div>
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
                          className={errors.password ? "border-red-500" : ""}
                        />
                      )}
                    />
                    {errors.password && (
                      <p className="text-red-500 mt-1 text-sm">
                        {errors.password.message}
                      </p>
                    )}
                  </div>
                  <Button
                    disabled={loading}
                    type="submit"
                    className="text-center w-full"
                  >
                    {loading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Sign in
                  </Button>
                  <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                    Don't have an account?{" "}
                    <Link
                      href="/signup"
                      className="font-medium text-primary hover:underline dark:text-primary-500"
                    >
                      Signup here
                    </Link>
                  </p>
                </form>
              </div>
            </div>
          </div>
        </section>
        <div className="absolute bottom-0  -z-0 left-0 w-full">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1440 320"
            preserveAspectRatio="none"
            className="w-full h-full"
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
    </GoogleOAuthProvider>
  );
};

export default Signin;
