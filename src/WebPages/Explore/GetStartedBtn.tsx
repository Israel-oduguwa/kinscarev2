"use client";
import MongoContext from "@/app/MongoContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import * as Realm from "realm-web";
import { Input } from "@/components/ui/input";
import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";
import { cn, fetchContactsData, fetchUserData } from "@/lib/utils";
import { yupResolver } from "@hookform/resolvers/yup";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { ArrowBigLeft, Loader2, Loader2Icon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import Link from "next/link";
import TagManager from "react-gtm-module";
import { useCioId, updateCustomerioUser } from "@/lib/customerio"; // ← NEW

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

// ----- Attribution helpers -----
type Attribution = {
  email?: string | null;
  fn?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
};

const LS_KEY_PREFS = "kc_search_prefs";

const safeLocalGet = <T,>(key: string): T | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
};

const safeLocalSet = (key: string, value: unknown) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore quota errors
  }
};

function GetStartedBtn({ children }: any) {
  const [isDialogOpen, setIsDialogOpen] = useState(false); // Social login modal
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false); // Email signup modal
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  const mongo: any = useContext(MongoContext);
  const {
    app,
    client,
    user,
    setAuthenticated,
    userData,
    setCustomData,
    setUser,
    setUserData,
  } = mongo;

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    getValues,
    setValue,
  } = useForm({
    resolver: yupResolver(schema),
  });

  // Pull Customer.io personId (cid from URL / LS / cookie)
  const personId = useCioId(); // ← NEW

  // Read URL params for /explore?email=...&fn=...&utm_*
  const attribution: Attribution = useMemo(() => {
    return {
      email: searchParams.get("email"),
      fn: searchParams.get("fn"),
      utm_source: searchParams.get("utm_source"),
      utm_medium: searchParams.get("utm_medium"),
      utm_campaign: searchParams.get("utm_campaign"),
    };
  }, [searchParams]);

  // Persist attribution to LS and prefill form if empty
  useEffect(() => {
    // Merge into kc_search_prefs for reuse elsewhere (OAuthDialog, etc.)
    const prev = safeLocalGet<any>(LS_KEY_PREFS) ?? {};

    const merged = {
      ...prev,
      email: attribution.email ?? prev.email ?? null,
      name: attribution.fn ?? prev.name ?? null,
      utm_source: attribution.utm_source ?? prev.utm_source ?? null,
      utm_medium: attribution.utm_medium ?? prev.utm_medium ?? null,
      utm_campaign: attribution.utm_campaign ?? prev.utm_campaign ?? null,
      path:
        typeof window !== "undefined" ? window.location.pathname : prev.path,
      href: typeof window !== "undefined" ? window.location.href : prev.href,
      updatedAt: new Date().toISOString(),
    };

    // Only write when something is present to avoid unnecessary writes
    if (
      attribution.email ||
      attribution.fn ||
      attribution.utm_source ||
      attribution.utm_medium ||
      attribution.utm_campaign
    ) {
      safeLocalSet(LS_KEY_PREFS, merged);
    }

    // Prefill First Name and Email if fields are blank
    const currentFname = getValues("fname");
    const currentEmail = getValues("email");
    if (!currentFname && attribution.fn) {
      setValue("fname", attribution.fn);
    }
    if (!currentEmail && attribution.email) {
      setValue("email", attribution.email.toLowerCase());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount

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

        // Attach attribution + context
        const ls = safeLocalGet<any>(LS_KEY_PREFS) ?? {};
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
          // marketing / attribution
          acquisition_channel: ls?.utm_source || "email",
          utm_source: ls?.utm_source || attribution.utm_source || null,
          utm_medium: ls?.utm_medium || attribution.utm_medium || null,
          utm_campaign: ls?.utm_campaign || attribution.utm_campaign || null,
          landing_path: ls?.path,
          landing_href: ls?.href,
        });

        await axios.post(
          "https://kinscare-backend.onrender.com/api/v1/auth/create_user",
          payload
        );
        setAuthenticated(true);

        // GTM (include UTM metadata)
        const tagManagerArgs =
          payload.auth_mode === "local-userpass"
            ? {
                dataLayer: {
                  event: `explorer_sign_up`,
                  userIp: response?.data?.userIp,
                  added: new Date(),
                  signup_route: "explorer",
                  authEmail: payload.email,
                  authMode: payload.auth_mode,
                  authTel: (payload.tel || "").toString().trim(),
                  role: `${payload.role}`,
                  type: "Web",
                  userId: `${payload.userID}`,
                  utm_source: payload.utm_source || null,
                  utm_medium: payload.utm_medium || null,
                  utm_campaign: payload.utm_campaign || null,
                },
              }
            : {
                dataLayer: {
                  event: `explorer_sign_up`,
                  added: new Date(),
                  signup_route: "explorer",
                  userIp: response?.data?.userIp,
                  authEmail: payload.email,
                  authMode: payload.auth_mode,
                  socialFname: payload.fname,
                  socialLname: payload.lname,
                  type: "Web",
                  userId: `${payload.userID}`,
                  utm_source: payload.utm_source || null,
                  utm_medium: payload.utm_medium || null,
                  utm_campaign: payload.utm_campaign || null,
                },
              };

        TagManager.dataLayer(tagManagerArgs);
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

          // ---- Customer.io update (non-blocking) ----
          await updateCustomerioUser(personId, payload.userID); // ← NEW

          await setUser(userObj);
          await user.refreshCustomData();

          const fetchedData: any = await fetchUserData(
            userObj.id,
            userObj.profile.email
          );
          const fetchedCustomData: any = await fetchContactsData(
            userObj.id,
            userObj.profile.email
          );

          if (fetchedData.result) {
            setAuthenticated(true);
            await user.refreshCustomData();
            setCustomData(fetchedCustomData.result);
            setUserData(fetchedData.result);
            router.push(`/vitae/career-plan`);
          }
        } else {
          await user.refreshCustomData();
          const fetchedData: any = await fetchUserData(
            userObj.id,
            userObj.profile.email
          );
          const fetchedCustomData: any = await fetchContactsData(
            userObj.id,
            userObj.profile.email
          );
          setUser(userObj);

          if (fetchedData.result) {
            setUserData(fetchedData.result);
            await user.refreshCustomData();
            setCustomData(fetchedCustomData.result);
            setAuthenticated(true);
            router.push(`/vitae/career-plan`);
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
          role: "caregiver",
          fname: data.fname,
          lname: data.lname,
          userID: app.currentUser.id,
          email,
          auth_mode: "local-userpass",
        };

        await createUserDuringRegistration(payload);

        // ---- Customer.io update (non-blocking) ----
        await updateCustomerioUser(personId, payload.userID); // ← NEW

        const caregiverUserID = app.currentUser.id;
        const emails = app.currentUser.email;
        const user_data: any = await fetchUserData(caregiverUserID, emails);
        if (user_data) {
          setUserData(user_data.result);
          app.currentUser.refreshCustomData();
          user.refreshCustomData();
          router.refresh();
          router.push(`/vitae/career-plan`);
          setLoading(false);
        }
      }

      setLoading(false);
    } catch (error: any) {
      handleError(error);
      setLoading(false);
    }
  };

  const goBack = () => {
    setIsEmailDialogOpen(false);
    setIsDialogOpen(true);
  };

  return (
    <>
      {userData && userData.role === "caregiver" ? (
        <Link href="/vitae/career-plan">{children}</Link>
      ) : (
        <GoogleOAuthProvider clientId={`${process.env.GOOGLE_APP_ID}`}>
          {/* Social Login Dialog */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>

            <DialogContent className="rounded-lg shadow-xl p-6 bg-white max-w-lg">
              <div>
                <DialogTitle className="text-2xl font-bold tracking-tight  text-center">
                  Join the KinsCare
                </DialogTitle>
                <DialogDescription className="text-gray-600 text-sm text-center mb-6">
                  Discover Fulfilling Careers in Nursing and Allied Healthcare
                </DialogDescription>
              </div>

              {!loading ? (
                <div className="flex justify-center gap-4">
                  <GoogleLogin
                    size="large"
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    theme="filled_black"
                    text="continue_with"
                  />
                </div>
              ) : (
                <div className="flex justify-center w-full items-center">
                  <Loader2Icon size={30} className="animate-spin" />
                </div>
              )}

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
                        {errors.fname.message as string}
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
                        {errors.lname.message as string}
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
                      {errors.email.message as string}
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
                      {errors.tel.message as string}
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
                      {errors.password.message as string}
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
                      {errors.terms.message as string}
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

          {/* Email Signup Dialog */}
          <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
            <DialogContent className="rounded-lg shadow-xl p-6 bg-white max-w-lg">
              <div className="flex w-full space-x-10">
                <Button onClick={goBack} size="icon" variant="outline">
                  <ArrowBigLeft />
                </Button>
                <DialogTitle className="text-2xl justify-center font-bold tracking-tight mb-2 text-center">
                  Signup with Email
                </DialogTitle>
              </div>
              <DialogDescription />
            </DialogContent>
          </Dialog>
        </GoogleOAuthProvider>
      )}
    </>
  );
}

export default GetStartedBtn;
