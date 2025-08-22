"use client";

import React, {
  useContext,
  useMemo,
  useRef,
  useState,
  Children,
  isValidElement,
} from "react";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import * as Realm from "realm-web";
import { useRouter, useSearchParams } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import MongoContext from "@/app/MongoContext";
import axios from "axios";
import { Loader2, Loader2Icon, TriangleAlert } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/mixpanelUtils";
import TagManager from "react-gtm-module";
import ProviderDialog from "@/Providers/Candidates/ProviderDialog";
import { CustomerSignupParams, sendCustomerSignupEmail } from "@/lib/Email";
import { OrSeparator } from "@/components/OrSeperator";
import { toast } from "sonner";
import { fetchUserData } from "@/lib/utils";
import { sendSignupDripSMS } from "@/Utils/sendSmsSignup";

// ---------- ENV + CONSTANTS ----------
const GOOGLE_CLIENT_ID = process.env.GOOGLE_APP_ID; // keep as you set it
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://jrp7pe2xhj.us-east-1.awsapprunner.com";
const TRACK_BASE = "https://jrp7pe2xhj.us-east-1.awsapprunner.com"; // your local tracking base

// ---------- TYPES ----------
interface OAuthDialogProps {
  message: string; // "caregiver" etc
  userID?: string; // candidate id
  caregiver: any;
  children: React.ReactNode; // trigger
}

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

type Attribution = {
  cio_id?: string | null;
  email?: string | null;
  name?: string | null;
};

const LS_KEY_PREFS = "kc_search_prefs";

// ---------- HELPERS ----------
const safeLocalGet = <T,>(key: string): T | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
};

const clearSignupLocalStorage = () => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(LS_KEY_PREFS);
  } catch {
    // ignore
  }
};

const parseFirstLast = (name?: string | null) => {
  if (!name) return { first: undefined, last: undefined };
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return { first: parts[0], last: "" };
  return { first: parts[0], last: parts.slice(1).join(" ") };
};

// A safe trigger: always render something clickable even if children are missing/weird
function SafeTrigger({
  children,
  fallbackText = "Continue",
}: {
  children: React.ReactNode;
  fallbackText?: string;
}) {
  let triggerChild: React.ReactElement;

  if (Children.count(children) === 1 && isValidElement(children)) {
    triggerChild = children as React.ReactElement;
  } else if (typeof children === "string") {
    triggerChild = <Button>{children}</Button>;
  } else {
    triggerChild = (
      <Button className="px-6 py-3 text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md">
        {children}
      </Button>
    );
  }

  return <DialogTrigger asChild>{triggerChild}</DialogTrigger>;
}

// ---------- COMPONENT ----------
const OAuthDialog: React.FC<OAuthDialogProps> = ({
  message,
  caregiver,
  userID,
  children,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const mountedRef = useRef(true);

  const searchParams = useSearchParams();
  const router = useRouter();

  const mongo: any = useContext(MongoContext);
  const { app, client, setAuthenticated, setUser, setUserData, userData } =
    mongo || {};

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  // Attribution from URL or localStorage fallback
  const attribution: Attribution = useMemo(() => {
    const urlCio = searchParams.get("cio_id");
    const urlEmail = searchParams.get("email");
    const urlName =
      searchParams.get("name") ??
      searchParams.get("contact_name") ??
      searchParams.get("Contact%20Name");

    const ls = safeLocalGet<any>(LS_KEY_PREFS);
    return {
      cio_id: urlCio ?? ls?.cio_id ?? null,
      email: urlEmail ?? ls?.email ?? null,
      name: urlName ?? ls?.name ?? null,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  React.useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const setLoadingSafe = (v: boolean) => {
    if (mountedRef.current) setLoading(v);
  };

  const handleError = (error: any, label = "Error") => {
    console.error(label, error);
    const msg =
      error?.response?.data?.error ||
      error?.response?.data?.message ||
      error?.message ||
      "Something went wrong. Please try again.";
    toast.error(msg);
    setLoadingSafe(false);
  };

  // --- NEW: Identify user in Customer.io when they did NOT come from email ---
  const identifyUserCustomerIO = async (args: {
    userID: string;
    email: string;
    first?: string | null;
    last?: string | null;
    role?: string; // default "provider"
  }) => {
    const { userID, email, first, last, role = "provider" } = args;
    try {
      await axios.post(`${TRACK_BASE}/api/v1/auth/identify_user_customerio`, {
        userID,
        email,
        first: first ?? "",
        last: last ?? "",
        role,
      });
    } catch (e) {
      // Non-blocking — just log
      console.warn("Customer.io identify failed", e);
    }
  };

  const trackProviderSignup = async (args: {
    cio_id?: string | null;
    email?: string | null;
    userID: string;
    first?: string | null;
    last?: string | null;
  }) => {
    const { cio_id, email, userID, first, last } = args;
    if (!cio_id) return; // only if coming from campaign link
    try {
      await axios.post(`${TRACK_BASE}/api/v1/auth/track-provider-signup`, {
        cio_id,
        email,
        userID,
        first,
        last,
      });
    } catch (e) {
      console.warn("Customer.io tracking failed", e);
    }
  };

  const createUserDuringRegistration = async (payload: any) => {
    const res = await axios.get("/api/ip"); // your edge/ip API
    const ipData = res?.data || {};
    const { ip, city, latitude, longitude, country_code, region_name, zip } =
      ipData;

    Object.assign(payload, {
      route: "Regular",
      userIp: ip,
      zipcode: zip,
      address: `${city || ""}${city ? ", " : ""}${region_name || ""}${
        region_name ? ", " : ""
      }${country_code || ""}`,
      geocode_address: { lng: longitude, lat: latitude },
      city,
      returning: false,
      role: "provider",
      signup_route: message === "caregiver" ? "caregiver" : "find_caregiver",
      caregiver_id: userID,
      created: new Date(),
    });

    await axios.post(`${API_BASE}/api/v1/auth/create_user`, payload);

    // GTM
    const baseDL = {
      event: `${payload.role}_sign_up`,
      userIp: ip,
      added: new Date(),
      signup_route: payload.signup_route,
      type: "Web",
      userId: `${payload.userID}`,
    };
    if (payload.auth_mode === "local-userpass") {
      TagManager.dataLayer({
        dataLayer: {
          ...baseDL,
          authEmail: payload.email,
          authMode: payload.auth_mode,
          authTel: (payload.tel || "").toString().trim(),
          role: `${payload.role}`,
        },
      });
    } else {
      TagManager.dataLayer({
        dataLayer: {
          ...baseDL,
          authEmail: payload.email,
          authMode: payload.auth_mode,
          socialFname: payload.fname,
          socialLname: payload.lname,
        },
      });
    }

    setAuthenticated?.(true);

    // welcome email
    const fullName = `${payload.fname || ""} ${payload.lname || ""}`.trim();
    const emailParams: CustomerSignupParams = {
      email: payload.email,
      name: fullName,
      role: payload.role,
    };
    await sendCustomerSignupEmail(emailParams);
  };

  // -------- Google OAuth Success --------
  const handleGoogleSuccess = async (response: any) => {
    const token = response?.credential;
    if (!token) {
      toast.error("Missing token from Google. Please try again.");
      return;
    }

    try {
      setLoadingSafe(true);
      const decodedToken: any = jwtDecode(token);

      // Login to Realm using the JWT
      const credentials = Realm.Credentials.jwt(token);
      const userObj = await app.logIn(credentials);
      await userObj.refreshCustomData(); // ensure hash/role present

      // Check if user exists in your contacts collection
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
        profileImage: decodedToken?.picture,
        fname: decodedToken?.given_name,
        lname: decodedToken?.family_name,
        verified: decodedToken?.email_verified,
        auth_mode: "oauth2-google",
        googleId: userObj?.identities?.[0]?.id,
      };

      const nameFallback = parseFirstLast(attribution.name);

      if (!existingUser) {
        await createUserDuringRegistration(payload);

        // If NOT from email (no cio_id), identify the user in Customer.io
        if (!attribution.cio_id) {
          await identifyUserCustomerIO({
            userID: payload.userID,
            email: payload.email,
            first: payload.fname ?? nameFallback.first,
            last: payload.lname ?? nameFallback.last,
            role: "provider",
          });
        } else {
          // Campaign tracking path
          await trackProviderSignup({
            cio_id: attribution.cio_id,
            email: payload.email ?? attribution.email ?? undefined,
            userID: payload.userID,
            first: payload.fname ?? nameFallback.first ?? null,
            last: payload.lname ?? nameFallback.last ?? null,
          });
        }

        const fetchedData: any = await fetchUserData(
          userObj.id,
          userObj.profile.email
        ).catch(() => null);

        // Mixpanel
        trackEvent(userObj.customData?.hash, "Sign Up", payload);

        setUserData?.(fetchedData?.result);
        setUser?.(userObj);
        setAuthenticated?.(true);

        toast.success("Account created! Redirecting…");
        clearSignupLocalStorage();

        setIsDialogOpen(false);
        router.push(`/provider/candidates/${userID}`);
      } else {
        // Existing user: treat as sign-in
        const fetchedData: any = await fetchUserData(
          userObj.id,
          userObj.profile.email
        ).catch(() => null);

        // If NOT from email, identify in Customer.io as well (idempotent recommended)
        if (!attribution.cio_id) {
          await identifyUserCustomerIO({
            userID: payload.userID,
            email: payload.email,
            first: payload.fname,
            last: payload.lname,
            role: "provider",
          });
        } else {
          await trackProviderSignup({
            cio_id: attribution.cio_id,
            email: payload.email ?? attribution.email ?? undefined,
            userID: payload.userID,
            first: payload.fname ?? nameFallback.first ?? null,
            last: payload.lname ?? nameFallback.last ?? null,
          });
        }

        trackEvent(userObj.customData?.hash, "Sign In", {
          auth_mode: "oauth2-google",
          date_time: new Date().toISOString(),
          route: "Regular",
          created: new Date(),
        });

        TagManager.dataLayer({
          dataLayer: {
            event: `sign_in`,
            added: new Date(),
            auth_mode: "oauth2-google",
            hash: userObj.customData?.hash,
            role: userObj.customData?.role,
            type: "Web",
            userId: `${userObj.id}`,
          },
        });

        setUserData?.(fetchedData?.result);
        setUser?.(userObj);
        setAuthenticated?.(true);

        toast.success("Welcome back! Redirecting…");
        clearSignupLocalStorage();

        setIsDialogOpen(false);
        router.push(`/provider/candidates/${userID}`);
      }
    } catch (error) {
      handleError(error, "Google Login");
    } finally {
      setLoadingSafe(false);
    }
  };

  const handleGoogleError = () => {
    toast.error("Google Login failed. Please try again.");
  };

  // -------- Email/Password Signup --------
  const onSubmit = async (data: any) => {
    try {
      setLoadingSafe(true);
      const email = String(data.email).toLowerCase();
      const password = data.password;

      await app.emailPasswordAuth.registerUser({ email, password });
      const credentials = Realm.Credentials.emailPassword(email, password);
      const userObj = await app.logIn(credentials);
      await userObj.refreshCustomData();

      setUser?.(userObj);

      const payload = {
        tel: data.tel,
        role: "provider",
        fname: data.fname,
        lname: data.lname,
        userID: userObj.id,
        email,
        auth_mode: "local-userpass",
      };

      await createUserDuringRegistration(payload);

      const nameFallback = parseFirstLast(attribution.name);

      // If NOT from email, identify in Customer.io
      if (!attribution.cio_id) {
        await identifyUserCustomerIO({
          userID: payload.userID,
          email: payload.email,
          first: payload.fname,
          last: payload.lname,
          role: "provider",
        });
      } else {
        // From email campaign: track conversion
        await trackProviderSignup({
          cio_id: attribution.cio_id,
          email: payload.email ?? attribution.email ?? undefined,
          userID: payload.userID,
          first: payload.fname ?? nameFallback.first ?? null,
          last: payload.lname ?? nameFallback.last ?? null,
        });
      }

      trackEvent(userObj.customData?.hash, "Sign Up", payload);
      // send Sms
      await sendSignupDripSMS({
        providerPhone: data.tel,
        country: "NG",
        role: "provider",
        actionUrl: "https://www.kinscare.org/provider/account/settings/profile",
        jumpstartUrl: "https://www.kinscare.org/jumpstart-hiring",
      });
      const providerUserID = userObj.id;
      const emails = email;
      const user_data: any = await fetchUserData(providerUserID, emails).catch(
        () => null
      );

      if (user_data?.result) {
        setUserData?.(user_data.result);
        await userObj.refreshCustomData();
        setAuthenticated?.(true);

        toast.success("Account created! Redirecting…");
        clearSignupLocalStorage();

        setIsDialogOpen(false);
        router.push(`/provider/candidates/${userID}`);
      } else {
        toast.warning(
          "Account created, but we couldn’t load your profile yet. You can continue."
        );
        setIsDialogOpen(false);
        router.push(`/provider/candidates/${userID}`);
      }
    } catch (error) {
      handleError(error, "Email Signup");
    } finally {
      setLoadingSafe(false);
    }
  };

  // ---------- RENDER ----------
  if (userData && userData.role === "provider") {
    return (
      <ProviderDialog candidate={caregiver}>
        {Children.count(children) ? (
          children
        ) : (
          <Button className="px-6 py-3 text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md">
            Message Caregiver
          </Button>
        )}
      </ProviderDialog>
    );
  }

  if (!GOOGLE_CLIENT_ID) {
    console.warn("Missing GOOGLE_APP_ID.");
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID || "missing-client-id"}>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <SafeTrigger>{children}</SafeTrigger>

        <DialogContent className="rounded-lg shadow-xl p-6 bg-white max-w-md">
          <div className="mb-1">
            <DialogTitle className="text-3xl font-bold tracking-tight text-center">
              Welcome to Kinscare
            </DialogTitle>
            <DialogDescription className="text-gray-600 text-sm text-center">
              {message === "caregiver"
                ? "Sign in to Kinscare to connect with this caregiver."
                : "Continue with Google or sign up with email to join the Kinscare community."}
            </DialogDescription>
          </div>

          {!loading ? (
            <div className=" gap-4">
              <div className="w-full flex justify-center">
                {GOOGLE_CLIENT_ID ? (
                  <GoogleLogin
                    size="large"
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    theme="filled_blue"
                    text="continue_with"
                    width="100%"
                    shape="pill"
                  />
                ) : (
                  <Button
                    className="w-full"
                    variant="secondary"
                    onClick={() =>
                      toast.error(
                        "Google sign-in is temporarily unavailable. Please use email signup."
                      )
                    }
                  >
                    <TriangleAlert className="mr-2 h-4 w-4" />
                    Google sign-in unavailable
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex justify-center w-full items-center">
              <Loader2Icon size={30} className="animate-spin" />
            </div>
          )}

          <OrSeparator />

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
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
                    {String(errors.fname.message)}
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
                    {String(errors.lname.message)}
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
                  {String(errors.email.message)}
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
                  {String(errors.tel.message)}
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
                  {String(errors.password.message)}
                </p>
              )}
            </div>

            <div>
              <label className="inline-flex items-center py-2 space-x-2">
                <Controller
                  name="terms"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="checkbox"
                      checked={!!field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
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
                  {String(errors.terms.message)}
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
        </DialogContent>
      </Dialog>

      {/* Optional: dedicated email dialog */}
      <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
        <DialogContent className="rounded-lg shadow-xl max-h-full md:h-auto overflow-y-auto p-6 bg-white max-w-lg">
          <div>
            <DialogTitle className="text-3xl justify-center font-bold tracking-tight mb-2 text-center">
              Signup with Email
            </DialogTitle>
          </div>
        </DialogContent>
      </Dialog>
    </GoogleOAuthProvider>
  );
};

export default OAuthDialog;
