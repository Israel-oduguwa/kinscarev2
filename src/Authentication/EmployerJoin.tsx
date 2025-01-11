"use client";
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

const EmployerJoin: React.FC = () => {
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
  const { setTheme } = useTheme();
  const { toast } = useToast();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormInputs>({
    mode: "onChange",
    shouldFocusError: true,
    resolver: yupResolver(schema),
  });
  const [loading, setLoading] = useState(false);
  const [signupPageLoading, setSignupPageLoading] = useState(true);
  const [selectRoleModal, setSelectRoleModal] = useState(false);
  const { push, refresh } = useRouter();
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
          zipcode: zip,
          address: `${city}, ${region_name}, ${country_code}`,
          geocode_address: { lng: longitude, lat: latitude },
          city,
          returning: false,
        });
        const createUser = await axios.post(
          "https://api.kinscare.org/api/v1/auth/create_user",
          payload
        );
        console.log(createUser);
        // await user.callFunction("web_add_social_user_custom_data", payload);
        setAuthenticated(true);
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

    if (authenticated) {
      await user?.refreshCustomData();
      if (!isAnon(user) && Object.keys(user?.customData || {}).length > 0) {
        switch (user.customData.role) {
          case "caregiver":
            push("/vitae/jobs/all");
            break;
          case "provider":
            push("/provider/candidates/all");
            // console.log("user is a provider");
            // push("/community");
            break;
          case undefined:
            console.log("show a modal user can use to check the role");
            // if (!user?.customData?.role) push("/select");
            setSelectRoleModal(true);
            break;
        }
        setSignupPageLoading(false);
      } else {
        setSignupPageLoading(false);
        push("/signup");
      }
    } else {
      console.log(isAnon(user));
      push("/signup");
    }
  };

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
  
  // Form submit handler

  const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
    try {
      setLoading(true);
      const email = data.email.toLowerCase();
      const password = data.password;
      await app.emailPasswordAuth.registerUser({ email, password });
      const credentials = Realm.Credentials.emailPassword(email, password);
      await app.logIn(credentials);
      if (app.currentUser) {
        setUser(app.currentUser);
        // console.log("User logged in, refreshing custom data");
        await app.currentUser.refreshCustomData(); // Try to refresh the data here
        const payload = {
          tel: data.tel,
          role: data.role,
          userID: app.currentUser.id,
          email,
          auth_mode: "local-userpass",
        };
        // add the user to the database
        await createUserDuringRegistration(payload);
        // then we should fetch the user data to the client side
        const userID = app.currentUser.id;
        const emails = app.currentUser.email;
        const user_data: any = await fetchUserData(userID, emails);
        if (user_data) {
          setUserData(user_data.result); // set the user data
          user.refreshCustomData();
          app.currentUser.refreshCustomData();
          refresh();
          // route the user to the appropriate page based on role
          routeUser(user_data.result.role);
        }
      }

      setLoading(false);
    } catch (error: any) {
      handleError(error);
      setLoading(false);
    }
  };

  const closeSelectModal = () => setSelectRoleModal(false);
//  for one tap login 
  // googleLogout();

  if (loadingAuth === "authenticating") {
    return <>loading....</>;
  }

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
              <img
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
      <section className="py-6 max-w-xl absolute right-0 left-0 z-10 m-auto">
        <div className="mx-4">
          <div className="bg-white rounded-2xl shadow-xl dark:border md:mt-0 xl:p-0 dark:bg-gray-800 dark:border-gray-700">
            <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
              <h1 className="text-xl text-center font-bold leading-tight tracking-tight antialiased text-gray-900 md:text-2xl dark:text-white">
                Create Employer's Account
              </h1>
              {/* Centered Google Sign-In */}
          
              <form
                className="space-y-4 md:space-y-4"
                onSubmit={handleSubmit(onSubmit)}
              >

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
                {/* Password */}
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
                  disabled={loading}
                  type="submit"
                  className="w-full hover:bg-primary-600 text-white py-2 px-4 rounded-lg transition"
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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

export default EmployerJoin;
