"use client";
import MongoContext from "@/app/MongoContext";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/components/ui/use-toast";
import { cn, isAnon } from "@/lib/utils";
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
      .oneOf([yup.ref("password"), null], "Passwords must match")
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
  const [googleLoading, setGoogleLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [signupPageLoading, setSignupPageLoading] = useState(true);
  const [selectRoleModal, setSelectRoleModal] = useState(false);
  const { push } = useRouter();
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
  globalThis.handleCredentialResponse = async (response: any) => {
    try {
      setLoading(true);
      const idToken = response.credential;
      const decodedToken: any = jwtDecode(idToken);
      const credentials = Realm.Credentials.jwt(idToken);
      const userObj = await app.logIn(credentials);

      // Check if user exists
      const user = await client
        ?.db("kinshealth")
        .collection("contacts")
        .findOne({
          userID: userObj.id,
          email: userObj.profile.email, // Assuming profile.email is the correct field for email
        });
      if (!user) {
        const payload = {
          email: userObj.profile.email,
          userID: userObj.id,
          fname: decodedToken.given_name,
          lname: decodedToken.family_name,
          auth_mode: "oauth2-google",
          googleId: userObj.identities[0].id,
          route: "Regular",
          created: new Date(),
        };
        console.log("the user does not exist");
        createUserDuringRegistration(payload);
      } else {
        // console.log("the user is in the database")
        if (user.returning) {
          await client
            .db("kinshealth")
            .collection("users")
            .updateOne(
              { userID: app.currentUser.id },
              { $set: { returning: true } },
              { upsert: true }
            );
          userObj.refreshCustomData();
        }
        setUser(userObj);
        setAuthenticated(true);
        setLoading(false);
      }
    } catch (error) {
      handleError(error);
    }
  };

  // Load Google Script
  const loadGoogleScript = () => {
    setGoogleLoading(true);
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.onload = () => {
      window.handleCredentialResponse = handleCredentialResponse;
    };
    document.body.appendChild(script);
    setGoogleLoading(false);
  };

  // Register user during registration
  const createUserDuringRegistration = async (payload: object) => {
    try {
      setLoading(true);
      const response = await axios.get("/api/ip");
      if (response.data) {
        const { ip, city, latitude, longitude, country_code, region_name } =
          response.data;
        Object.assign(payload, {
          route: "Regular",
          userIp: ip,
          address: `${city}, ${region_name}, ${country_code}`,
          geocode_address: { lng: longitude, lat: latitude },
          city,
          returning: false,
        });
        await user.callFunction("web_add_social_user_custom_data", payload);
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
    console.log(authenticated);
    console.log(loadingAuth);
    if (authenticated) {
      await user?.refreshCustomData();
      if (!isAnon(user) && Object.keys(user?.customData || {}).length > 0) {
        switch (user.customData.role) {
          case "caregiver":
            // push("/vitae/jobs/all");
            push("/community")
            break;
          case "provider":
            // push("/provider/candidates/all");
            // console.log("user is a provider");
            push("/community")
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

  useEffect(() => {
    RedirectUser(user);
    loadGoogleScript();
  }, [user, authenticated]);

  // Form submit handler
  const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
    try {
      setLoading(true);
      const email = data.email.toLowerCase();
      const password = data.password;
      await app.emailPasswordAuth.registerUser({ email, password });
      const credentials = Realm.Credentials.emailPassword(email, password);
      const userObj = await app.logIn(credentials);
      const payload = {
        tel: data.tel,
        role: data.role,
        userID: userObj.id,
        email,
        auth_mode: "local-userpass",
      };
      createUserDuringRegistration(payload);
      userObj.refreshCustomData();
      setAuthenticated(true);
    } catch (error: any) {
      handleError(error);
    }
  };
  const closeSelectModal = () => setSelectRoleModal(false);

  if (loadingAuth === "authenticating") {
    return <>loading....</>;
  }
  return (
    <div className="w-full min-h-[100vh] bg-gray-100 dark:bg-inherit">
      <SelectRole
        selectRoleModal={selectRoleModal}
        closeSelectModal={closeSelectModal}
      />
      <header className="py-8 px-8 sm:py-6">
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
              Kinscare
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
      <section className="py-8 max-w-[570px] m-auto">
        <div className="mx-4">
          <div className="bg-white rounded-2xl shadow-xl dark:border md:mt-0 xl:p-0 dark:bg-gray-800 dark:border-gray-700">
            <div className="p-6 space-y-4 md:space-y-8 sm:p-8">
              <h1 className="text-xl text-center font-bold leading-tight tracking-tight antialiased text-gray-900 md:text-2xl dark:text-white">
                Create Your Account to join Kinscare
              </h1>
              <form
                className="space-y-4 md:space-y-6"
                onSubmit={handleSubmit(onSubmit)}
              >
                <div>
                  <div
                    id="g_id_onload"
                    data-client_id={!loading && `${process.env.GOOGLE_APP_ID}`}
                    data-context="signin"
                    data-ux_mode="popup"
                    data-callback="handleCredentialResponse"
                    data-itp_support="true"
                  ></div>
                  <div
                    className="g_id_signin"
                    data-type="standard"
                    data-shape="rectangular"
                    data-theme="filled_black"
                    data-text="signin_with"
                    data-size="large"
                    data-logo_alignment="left"
                  ></div>
                </div>
                <OrSeparator />
                <div>
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
                            className="text-sm font-normal text-gray-900 dark:text-white"
                            htmlFor="r1"
                          >
                            I AM A CAREGIVER LOOKING FOR A JOB
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="provider" id="r2" />
                          <Label
                            className="text-sm font-normal text-gray-900 dark:text-white"
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
                <div className="flex space-x-4">
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
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <Checkbox required id="terms" />
                  </div>
                  <div className="ml-3 text-sm">
                    <label
                      htmlFor="terms"
                      className="font-light text-gray-500 dark:text-gray-300"
                    >
                      I accept the{" "}
                      <a
                        className="font-medium text-primary hover:underline dark:text-primary-500"
                        href="#"
                      >
                        Terms and Conditions
                      </a>
                    </label>
                  </div>
                </div>
                <Button
                  disabled={loading}
                  type="submit"
                  className="text-center w-full"
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
    </div>
  );
};

export default Signup;
