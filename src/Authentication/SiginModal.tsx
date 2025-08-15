/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import MongoContext from "@/app/MongoContext";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";
import { cn, fetchUserData } from "@/lib/utils";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useContext, useState } from "react";
import * as Realm from "realm-web";
// import FacebookLogin from "react-facebook-login";
import { OrSeparator } from "@/components/OrSeperator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trackEvent } from "@/lib/mixpanelUtils";
import { yupResolver } from "@hookform/resolvers/yup";
import Link from "next/link";
import TagManager from "react-gtm-module";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import * as yup from "yup";
import SelectRole from "./SelectRole";

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

const SigninModal = ({ children, role }: any) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false); // Social login modal
  const router = useRouter();
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false); // Email signup modal
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

  // React Hook Form setup
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<IFormInputs>({
    mode: "onChange",
    shouldFocusError: true,
    resolver: yupResolver(schema),
  });

  // Local loading states
  const [googleLoading, setGoogleLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectRoleModal, setSelectRoleModal] = useState(false);

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

  // Google login success handler
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
      let decodedToken: any;
      try {
        decodedToken = jwtDecode(token);
      } catch {
        throw new Error("Invalid Google token format.");
      }

      const credentials = Realm.Credentials.jwt(token);
      const userObj = await app.logIn(credentials);

      if (!client) {
        throw new Error(
          "Database client not initialized. Please refresh and try again."
        );
      }

      const existingUser = await client
        .db("kinshealth")
        .collection("contacts")
        .findOne({
          userID: userObj.id,
          email: userObj.profile.email,
        });

      if (!existingUser) {
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

        trackEvent(app.currentUser.customData.hash, "Sign Up", payload);
      } else {
        setUser(userObj);
        setAuthenticated(true);

        const fetchedData: any = await fetchUserData(
          userObj.id,
          userObj.profile.email
        );
        if (fetchedData?.result) {
          await setUserData(fetchedData.result);
        }

        const mixpanelPayload = {
          auth_mode: "oauth2-google",
          date_time: new Date().toISOString(),
          route: "Regular",
          created: new Date().toISOString(),
        };
        trackEvent(app.currentUser.customData.hash, "Sign In", mixpanelPayload);

        TagManager.dataLayer({
          dataLayer: {
            event: `sign_in`,
            added: new Date(),
            auth_mode: "oauth2-google",
            hash: app.currentUser.customData.hash,
            role: app.currentUser.customData.role,
            type: "Web",
            userId: `${app?.currentUser?.id}`,
          },
        });

        if (existingUser.role) {
          router.push(
            `${
              role === "caregiver"
                ? "/vitae/jobs/all"
                : "/provider/candidates/all"
            }`
          );
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

  // Google login error handler
  const handleGoogleError = () => {
    toast({
      variant: "destructive",
      description: "Google Login Failed. Please try again.",
      action: <ToastAction altText="Okay">Okay</ToastAction>,
    });
  };

  // Create user record for social sign-up
  const createUserDuringRegistration = async (payload: any) => {
    setLoading(true);
    try {
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
          route: "Regular",
          userIp: ip,
          address: `${city}, ${region_name}, ${country_code}`,
          geocode_address: { lng: longitude, lat: latitude },
          zipcode: zip,
          city,
          returning: false,
        });
      }

      await axios.post(
        "https://kinscare-backend.onrender.com/api/v1/auth/create_user",
        payload
      );

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

  // Local email/password sign-in
  const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
    setLoading(true);
    try {
      const email = data.email.toLowerCase();
      const password = data.password;
      const credentials = Realm.Credentials.emailPassword(email, password);
      const credentialUser = await app.logIn(credentials);
      // console.log(credentialUser);

      if (credentialUser) {
        setUser(credentialUser);
        await credentialUser.refreshCustomData();

        const userID = credentialUser.id;
        const fetched: any = await fetchUserData(userID, email);
        if (fetched?.result) {
          setUserData(fetched.result);
          setAuthenticated(true);
          refresh();

          const mixpanelPayload = {
            auth_mode: "local-userpass",
            date_time: new Date().toISOString(),
            email,
            route: "Regular",
            role: credentialUser.customData.role,
          };
          trackEvent(
            credentialUser.customData.hash,
            "Sign In",
            mixpanelPayload
          );
          router.push(
            `${
              role === "caregiver"
                ? "/vitae/jobs/all"
                : "/provider/candidates/all"
            }`
          );
        } else {
          throw new Error(
            "Unable to retrieve your user data. Please try again."
          );
        }
      } else {
        throw new Error("Invalid email or password.");
      }
    } catch (error: any) {
      handleError(
        error,
        "Sign-in failed. Please check your details and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const closeSelectModal = () => setSelectRoleModal(false);
  return (
    <GoogleOAuthProvider clientId={`${process.env.GOOGLE_APP_ID}`}>
      {/* Social Login Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>

        <DialogContent className="rounded-lg shadow-xl bg-white ">
          <SelectRole
            selectRoleModal={selectRoleModal}
            closeSelectModal={closeSelectModal}
          />

          <section>
            <div>
              <div className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden">
                <div className=" space-y-6 md:space-y-6 sm:p-1">
                  <h1 className="text-xl text-center font-bold leading-tight tracking-tight antialiased text-gray-900 md:text-2xl dark:text-white">
                    Sign in to Kinscare
                  </h1>

                  <div className="flex w-full gap-4 justify-center">
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

                  <form
                    className="space-y-4 md:space-y-4"
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
                      disabled={loading || !isValid}
                      type="submit"
                      className="text-center w-full"
                    >
                      {(loading || googleLoading) && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Sign in
                    </Button>

                    <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                      Don&apos;t have an account?{" "}
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
        </DialogContent>
      </Dialog>
    </GoogleOAuthProvider>
  );
};

export default SigninModal;
