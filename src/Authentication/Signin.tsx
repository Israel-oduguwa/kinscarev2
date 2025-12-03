/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect, useContext } from "react";
import { useAuthContext } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchUserData, isAnon } from "@/lib/utils";
import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import * as Realm from "realm-web";
import * as yup from "yup";
import TagManager from "react-gtm-module";
import SelectRole from "./SelectRole";

import { trackEvent } from "@/lib/mixpanelUtils";
import { toast } from "sonner";
import CustomLoginButton from "./CustomLoginButton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

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
  })
  .required();

interface IFormInputs {
  email: string;
  password: string;
}

// ----- Toast helpers (Sonner only) -----
const getErrMsg = (e: any, fallback = "Something went wrong.") => {
  if (!e) return fallback;
  if (typeof e === "string") return e;
  return e?.response?.data?.message || e?.message || fallback;
};

const notifyError = (e: any, ctx?: string) => {
  const base = getErrMsg(e);
  toast.error(ctx ? `${ctx}: ${base}` : base);
};
const notifySuccess = (msg: string) => toast.success(msg);
const notifyWarning = (msg: string) => toast.warning(msg);

// Heuristic to decide when to suggest/reset after a signin failure
const shouldSuggestReset = (e: any) => {
  const msg = getErrMsg(e, "").toLowerCase();
  return (
    /(invalid|incorrect|wrong).*(password|credential)/i.test(msg) ||
    /user.*not.*found|no.*user.*found|account.*does.*not/i.test(msg) ||
    /authentication.*failed|failed.*to.*authenticate/i.test(msg)
  );
};

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

  const { push, refresh } = useRouter();

  // React Hook Form setup
  const {
    control,
    watch,
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

  // Forgot password dialog state
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [sendingReset, setSendingReset] = useState(false);

  // Generic error handler -> Sonner
  const handleError = (
    error: any,
    fallbackMessage = "An error occurred. Please try again."
  ) => {
    console.error("An error occurred:", error);
    toast.error(error?.message || fallbackMessage, {
      action: {
        label: "Close",
        onClick: () => {},
      },
    });
    setLoading(false);
    setGoogleLoading(false);
  };

  const formEmail = String(watch("email") || "").trim();

  // Google login success handler
  const handleGoogleSuccess = async (response: any) => {
    const token = response?.credential;
    if (!token) {
      notifyError(
        new Error("No credential received from Google."),
        "Google authentication failed"
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
          googleId: userObj.identities?.[0]?.id || userObj.id,
          route: "Regular",
          created: new Date(),
        };

        await createUserDuringRegistration(payload);

        await userObj.refreshCustomData();
        setUser(userObj);
        setSelectRoleModal(true);
        refresh();

        trackEvent(app.currentUser.customData.hash, "Sign Up", payload);
        notifySuccess("Signed in with Google.");
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

        notifySuccess("Signed in with Google.");
        if (existingUser.role) {
          if (fetchedData.result.role === "provider") {
            push("/provider/candidates/all");
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

  // Google login error handler -> Sonner
  const handleGoogleError = () => {
    toast.error("Google Login Failed. Please try again.");
  };

  // Role-based redirect
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
        "https://jrp7pe2xhj.us-east-1.awsapprunner.com/api/v1/auth/create_user",
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
      notifySuccess("Account created successfully.");
    } catch (error: any) {
      handleError(
        error,
        "Could not complete user registration. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Redirect logic once user/auth is known
  const RedirectUser = async (realmUser: Realm.User | null) => {
    if (realmUser && authenticated) {
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
            case undefined:
            default:
              setSelectRoleModal(true);
          }
        } else {
          push("/signin");
        }
      } catch {
        push("/signin");
      }
    } else {
      push("/signin");
    }
  };

  useEffect(() => {
    if (!loadingAuth) {
      RedirectUser(user);
    }
  }, [user, authenticated, loadingAuth]);

  // Local email/password sign-in
  const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
    setLoading(true);
    try {
      const email = data.email.toLowerCase();
      const password = data.password;
      const credentials = Realm.Credentials.emailPassword(email, password);
      const credentialUser = await app.logIn(credentials);

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

          toast.success("Signed in successfully.");
          routeUser(fetched.result.role);
        } else {
          throw new Error(
            "Unable to retrieve your user data. Please try again."
          );
        }
      } else {
        throw new Error("Invalid email or password.");
      }
    } catch (error: any) {
      // Show error and auto-open forgot-password dialog on relevant failures
      handleError(
        error,
        "Sign-in failed. Please check your details and try again."
      );
      if (shouldSuggestReset(error)) {
        setResetEmail(formEmail);
        setIsForgotOpen(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const closeSelectModal = () => setSelectRoleModal(false);

  // ----- Forgot Password: send reset -----
  const isValidResetEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resetEmail || "");
  const sendReset = async () => {
    try {
      setSendingReset(true);
      const email = String(resetEmail || "").trim().toLowerCase();
      if (!email || !isValidResetEmail) {
        toast.error("Enter a valid email address.");
        return;
      }
      try {
        // Signature A
        
        await app.emailPasswordAuth.sendResetPasswordEmail(email);
      } catch {
        // Signature B
        
        await app.emailPasswordAuth.sendResetPasswordEmail({ email });
      }
      toast.success(`If ${email} is registered, a reset link has been sent.`);
      setIsForgotOpen(false);
    } catch (e) {
      notifyError(e, "Couldn't send reset link");
    } finally {
      setSendingReset(false);
    }
  };

  return (
    <GoogleOAuthProvider clientId={`${process.env.GOOGLE_APP_ID}`}>
      <div className="relative w-full min-h-[100vh] bg-gray-100 dark:bg-inherit">
        <SelectRole
          selectRoleModal={selectRoleModal}
          closeSelectModal={closeSelectModal}
        />

        <header className="mx-auto py-6 px-6 z-10 sm:py-4">
          <div className="flex justify-between items-center">
            <div>
              <Link
                href="/"
                className="flex items-center text-lg font-semibold text-gray-900 dark:text-white"
              >
                <Image
                  width={48}
                  height={48}
                  src="https://firebasestorage.googleapis.com/v0/b/exhct2004.appspot.com/o/Kinscare%20Logo.svg?alt=media&token=e0ffb5fe-d0f9-4992-b505-a4180dffe444"
                  alt="logo"
                  className="w-12 mr-1"
                />
                <p className="font-bold text-sm text-slate-900 tracking-tight">
                  Kinscare
                </p>
              </Link>
            </div>
            <div>
              <div className="flex justify-between gap-6 items-center">
                <p className="text-md text-gray-800 dark:text-gray-50 antialiased hidden md:block">
                  Don&apos;t have an account?
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

                  <div className="flex mt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setResetEmail(formEmail);
                        setIsForgotOpen(true);
                      }}
                      className="text-xs text-blue-600 underline hover:opacity-80"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <Button
                    disabled={loading || googleLoading || !isValid}
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

                <div className="w-full">
                  <CustomLoginButton />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Forgot Password dialog */}
        <Dialog open={isForgotOpen} onOpenChange={setIsForgotOpen}>
          <DialogContent className="rounded-lg shadow-xl p-6 bg-white max-w-md">
            <DialogTitle className="text-xl font-semibold">
              Reset your password
            </DialogTitle>
            <DialogDescription className="text-gray-600 text-sm">
              Enter the email tied to your account. We’ll send you a secure
              reset link.
            </DialogDescription>

            <div className="mt-3 space-y-3">
              <div>
                <label htmlFor="reset-email" className="block mb-1 text-sm">
                  Email address
                </label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="you@example.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                />
                {!isValidResetEmail && resetEmail?.length > 0 && (
                  <p className="text-xs text-red-500 mt-1">
                    Enter a valid email address.
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsForgotOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={sendReset}
                  disabled={sendingReset || !isValidResetEmail}
                >
                  {sendingReset ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Send reset link"
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <div className="absolute bottom-0 -z-0 left-0 w-full">
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
