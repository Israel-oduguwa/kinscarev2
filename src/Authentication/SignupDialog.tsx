// "use client";

// import React, { useContext, useMemo, useState } from "react";

// import {
//   Dialog,
//   DialogContent,
//   DialogTrigger,
//   DialogTitle,
//   DialogDescription,
// } from "@/components/ui/dialog";
// import * as Realm from "realm-web";
// import { useRouter } from "next/navigation";
// import { jwtDecode } from "jwt-decode";
// import { useAuthContext } from "@/context/AuthContext";
// import axios from "axios";
// import { cn, fetchUserData } from "@/lib/utils";
// import { Loader2 } from "lucide-react";
// import { useForm, Controller } from "react-hook-form";
// import * as yup from "yup";
// import { yupResolver } from "@hookform/resolvers/yup";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { trackEvent } from "@/lib/mixpanelUtils";
// import TagManager from "react-gtm-module";
// import { CustomerSignupParams, sendCustomerSignupEmail } from "@/lib/Email";
// import { OrSeparator } from "@/components/OrSeperator";
// import { toast } from "sonner";
// import { sendSignupDripSMS } from "@/Utils/sendSmsSignup";

// // ----- Validation -----
// const signupSchema = yup.object().shape({
//   fname: yup.string().required("First name is required"),
//   lname: yup.string().required("Last name is required"),
//   email: yup.string().email("Invalid email").required("Email is required"),
//   tel: yup.string().required("Phone number is required"),
//   confirmPassword: yup
//     .string()
//     .oneOf([yup.ref("password")], "Passwords must match")
//     .required("Confirm password is required"),
//   password: yup
//     .string()
//     .min(6, "Password must be at least 6 characters")
//     .required("Password is required"),
//   terms: yup.bool().oneOf([true], "You must accept the Terms and Conditions"),
// });

// const signinSchema = yup.object().shape({
//   email: yup.string().email("Invalid email").required("Email is required"),
//   password: yup.string().required("Password is required"),
// });

// type Mode = "signup" | "signin";

// interface SignupDialogProps {
//   role: "provider" | "caregiver";
//   additionalData?: Record<string, any>;
//   onSuccess?: (userData: any) => void;
//   signupRoute?: string;
//   trigger: React.ReactNode;
//   jumpstart: boolean;
// }

// // ----- Toast helpers -----
// const getErrMsg = (e: any, fallback = "Something went wrong.") => {
//   if (!e) return fallback;
//   if (typeof e === "string") return e;
//   return e?.response?.data?.message || e?.message || fallback;
// };

// const notifyError = (e: any, ctx?: string) => {
//   const base = getErrMsg(e);
//   toast.error(ctx ? `${ctx}: ${base}` : base);
// };
// const notifySuccess = (msg: string) => toast.success(msg);
// const notifyWarning = (msg: string) => toast.warning(msg);

// // Heuristic to decide when to suggest/reset after a signin failure
// const shouldSuggestReset = (e: any) => {
//   const msg = getErrMsg(e, "").toLowerCase();
//   return (
//     /(invalid|incorrect|wrong).*(password|credential)/i.test(msg) ||
//     /user.*not.*found|no.*user.*found|account.*does.*not/i.test(msg) ||
//     /authentication.*failed|failed.*to.*authenticate/i.test(msg)
//   );
// };

// const SignupDialog: React.FC<SignupDialogProps> = ({
//   role,
//   additionalData = {},
//   onSuccess,
//   signupRoute = "",
//   jumpstart,
//   trigger,
// }) => {
//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [mode, setMode] = useState<Mode>("signup");

//   // Forgot password dialog state
//   const [isForgotOpen, setIsForgotOpen] = useState(false);
//   const [resetEmail, setResetEmail] = useState("");
//   const [sendingReset, setSendingReset] = useState(false);

//   const router = useRouter();
//   const authData: any = useAuthContext()
//   const { app, client, setAuthenticated, setUser, setUserData } = mongo;

//   const currentSchema = useMemo(
//     () => (mode === "signup" ? signupSchema : signinSchema),
//     [mode]
//   );

//   const {
//     control,
//     handleSubmit,
//     formState: { errors },
//     reset,
//     watch,
//   }: any = useForm({
//     resolver: yupResolver(currentSchema),
//   });

//   const formEmail = String(watch("email") || "").trim();

//   const handleError = (error: any, ctx?: string) => {
//     console.error("Auth error:", error);
//     notifyError(error, ctx);
//     setLoading(false);
//   };

//   const createUserDuringRegistration = async (payload: any) => {
//     try {
//       const response = await axios.get("/api/ip");
//       if (response.data) {
//         const {
//           ip,
//           city,
//           latitude,
//           longitude,
//           country_code,
//           region_name,
//           zip,
//         } = response.data;
//         Object.assign(payload, {
//           route: "Regular",
//           userIp: ip,
//           zipcode: zip,
//           address: `${city}, ${region_name}, ${country_code}`,
//           geocode_address: { lng: longitude, lat: latitude },
//           city,
//           returning: false,
//           role,
//           signup_route: signupRoute,
//           ...additionalData,
//         });

//         await axios.post(
//           "http://localhost:8081/api/v1/auth/create_user",
//           payload
//         );

//         const tagManagerArgs =
//           payload.auth_mode === "local-userpass"
//             ? {
//                 dataLayer: {
//                   event: `${role}_sign_up`,
//                   userIp: ip,
//                   added: new Date(),
//                   signup_route: signupRoute,
//                   authEmail: payload.email,
//                   authMode: payload.auth_mode,
//                   authTel: payload.tel?.trim?.() || "",
//                   role,
//                   type: "Web",
//                   userId: payload.userID,
//                 },
//               }
//             : {
//                 dataLayer: {
//                   event: `${role}_sign_up`,
//                   added: new Date(),
//                   userIp: ip,
//                   authEmail: payload.email,
//                   signup_route: signupRoute,
//                   authMode: payload.auth_mode,
//                   socialFname: payload.fname,
//                   socialLname: payload.lname,
//                   type: "Web",
//                   userId: payload.userID,
//                 },
//               };

//         TagManager.dataLayer(tagManagerArgs);
//         setAuthenticated(true);
//         const fullName = `${payload.fname || ""} ${payload.lname || ""}`.trim();
//         const emailParams: CustomerSignupParams = {
//           email: payload.email,
//           name: fullName,
//           role,
//         };
//         await sendCustomerSignupEmail(emailParams);
//         notifySuccess("Account created successfully.");
//       }
//     } catch (error) {
//       throw error;
//     }
//   };

//   // ----- Google Auth -----
//   const handleGoogleSuccess = async (response: any) => {
//     const token = response?.credential;
//     if (!token) {
//       notifyError("Missing Google credential.");
//       return;
//     }
//     try {
//       setLoading(true);
//       const decodedToken: any = jwtDecode(token);
//       const credentials = Realm.Credentials.jwt(token);
//       const userObj = await app.logIn(credentials);

//       const existingUser = await client
//         ?.db("kinshealth")
//         .collection("contacts")
//         .findOne({
//           userID: userObj.id,
//           email: userObj.profile.email,
//         });

//       const payload = {
//         email: userObj.profile.email,
//         userID: userObj.id,
//         profileImage: decodedToken.picture,
//         fname: decodedToken.given_name,
//         lname: decodedToken.family_name,
//         verified: decodedToken.email_verified,
//         auth_mode: "oauth2-google",
//         googleId: userObj.id,
//         route: "Regular",
//         created: new Date(),
//       };

//       if (!existingUser) {
//         await createUserDuringRegistration(payload);
//         const fetchedData: any = await fetchUserData(
//           userObj.id,
//           userObj.profile.email
//         );
//         trackEvent(userObj.customData?.hash, "Sign Up", payload);
//         setUserData(fetchedData.result);
//         setUser(userObj);
//         setAuthenticated(true);
//         await userObj.refreshCustomData();
//         notifySuccess("Signed in with Google.");
//         onSuccess?.(fetchedData.result);
//         setIsDialogOpen(false);
//       } else {
//         const fetchedData: any = await fetchUserData(
//           userObj.id,
//           userObj.profile.email
//         );
//         const mixpanelPayload = {
//           auth_mode: "oauth2-google",
//           date_time: new Date().toISOString(),
//           route: "Regular",
//           created: new Date(),
//         };
//         trackEvent(userObj.customData?.hash, "Sign In", mixpanelPayload);
//         TagManager.dataLayer({
//           dataLayer: {
//             event: `sign_in`,
//             added: new Date(),
//             auth_mode: "oauth2-google",
//             hash: userObj.customData?.hash,
//             role: userObj.customData?.role,
//             type: "Web",
//             userId: userObj.id,
//           },
//         });
//         setUserData(fetchedData.result);
//         setUser(userObj);
//         setAuthenticated(true);
//         await userObj.refreshCustomData();
//         notifySuccess("Signed in with Google.");
//         onSuccess?.(fetchedData.result);
//         setIsDialogOpen(false);
//       }
//     } catch (error) {
//       handleError(error, "Google login failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleGoogleError = () => {
//     notifyError("Google Login Failed. Please try again.");
//   };

//   // ----- Email/Password: Sign IN -----
//   const handleSignin = async (data: any) => {
//     try {
//       setLoading(true);
//       const email = String(data.email || "")
//         .toLowerCase()
//         .trim();
//       const password = String(data.password || "");

//       const credentials = Realm.Credentials.emailPassword(email, password);
//       const userObj = await app.logIn(credentials);

//       setUser(userObj);
//       await userObj.refreshCustomData();
//       const fetchedData: any = await fetchUserData(userObj.id, email);
//       if (fetchedData) {
//         setUserData(fetchedData.result);
//         trackEvent(userObj.customData?.hash, "Sign In", {
//           auth_mode: "local-userpass",
//           date_time: new Date().toISOString(),
//           route: "Regular",
//         });
//         TagManager.dataLayer({
//           dataLayer: {
//             event: "sign_in",
//             added: new Date(),
//             auth_mode: "local-userpass",
//             hash: userObj.customData?.hash,
//             role: userObj.customData?.role,
//             type: "Web",
//             userId: userObj.id,
//           },
//         });
//         setAuthenticated(true);
//         notifySuccess("Signed in successfully.");
//         await sendSignupDripSMS({
//           providerPhone: data.tel,
//           country: "US",
//           role: data.role,
//           actionUrl:
//             data.role === "caregiver"
//               ? "https://www.kinscare.org/vitae/update"
//               : "https://www.kinscare.org/provider/account/settings/profile",
//           jumpstartUrl: "https://www.kinscare.org/jumpstart-hiring",
//         });
//         onSuccess?.(fetchedData.result);
//         setIsDialogOpen(false);
//       }
//     } catch (error) {
//       // Show normal error + auto-open forgot dialog on relevant failures
//       handleError(error, "Sign in failed");
//       if (shouldSuggestReset(error)) {
//         setResetEmail(formEmail);
//         setIsForgotOpen(true);
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ----- Email/Password: Sign UP -----
//   const handleSignup = async (data: any) => {
//     try {
//       setLoading(true);
//       const email = String(data.email || "")
//         .toLowerCase()
//         .trim();
//       const password = String(data.password || "");

//       // Register
//       await app.emailPasswordAuth.registerUser({ email, password });

//       // Then login
//       const credentials = Realm.Credentials.emailPassword(email, password);
//       const userObj = await app.logIn(credentials);

//       if (userObj) {
//         setUser(userObj);
//         await userObj.refreshCustomData();
//         const payload = {
//           tel: data.tel,
//           fname: data.fname,
//           lname: data.lname,
//           userID: userObj.id,
//           email,
//           auth_mode: "local-userpass",
//         };

//         await createUserDuringRegistration(payload);

//         const fetchedData: any = await fetchUserData(userObj.id, email);
//         if (fetchedData) {
//           setUserData(fetchedData.result);
//           trackEvent(userObj.customData?.hash, "Sign Up", payload);
//           await userObj.refreshCustomData();
//           notifySuccess("Account created and signed in.");
//           onSuccess?.(fetchedData.result);
//           setIsDialogOpen(false);
//         }
//       }
//     } catch (error: any) {
//       const msg = String(error?.message || "").toLowerCase();
//       if (
//         /already in use|already registered|already exists|name already in use/i.test(
//           msg
//         )
//       ) {
//         notifyWarning(
//           "This email is already registered. Please sign in instead."
//         );
//         setMode("signin");
//       } else {
//         handleError(error, "Signup failed");
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const onSubmit = (data: any) => {
//     if (mode === "signin") return handleSignin(data);
//     return handleSignup(data);
//   };

//   const toggleMode = () => {
//     setMode((m) => (m === "signup" ? "signin" : "signup"));
//     reset({}, { keepDefaultValues: false });
//   };

//   // ----- Forgot Password: send reset -----
//   const isValidResetEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resetEmail || "");
//   const sendReset = async () => {
//     try {
//       setSendingReset(true);
//       const email = String(resetEmail || "")
//         .trim()
//         .toLowerCase();
//       if (!email || !isValidResetEmail) {
//         toast.error("Enter a valid email address.");
//         return;
//       }
//       try {
//         // Signature A

//         await app.emailPasswordAuth.sendResetPasswordEmail(email);
//       } catch {
//         // Signature B

//         await app.emailPasswordAuth.sendResetPasswordEmail({ email });
//       }
//       toast.success(`If ${email} is registered, a reset link has been sent.`);
//       setIsForgotOpen(false);
//     } catch (e) {
//       notifyError(e, "Couldn't send reset link");
//     } finally {
//       setSendingReset(false);
//     }
//   };

//   return (
//     <GoogleOAuthProvider clientId={`${process.env.GOOGLE_APP_ID}`}>
//       {/* Main auth dialog */}
//       <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
//         <DialogTrigger asChild>{trigger}</DialogTrigger>
//         <DialogContent className="rounded-lg shadow-xl p-6 bg-white max-w-lg">
//           {jumpstart ? (
//             <div>
//               <DialogTitle className="text-3xl font-bold tracking-tight text-center">
//                 {mode === "signup" ? "Welcome to Kinscare" : "Welcome back"}
//               </DialogTitle>
//               <DialogDescription className="text-gray-600 text-sm text-center mb-2">
//                 {mode === "signup"
//                   ? "Let’s start matching you with caregivers—and enjoy 2 weeks of full access."
//                   : "Sign in to continue your Jumpstart Hiring."}
//               </DialogDescription>
//             </div>
//           ) : (
//             <div>
//               <DialogTitle className="text-3xl font-bold tracking-tight text-center">
//                 {mode === "signup" ? "Welcome to Kinscare" : "Welcome back"}
//               </DialogTitle>
//               <DialogDescription className="text-gray-600 text-sm text-center mb-2">
//                 {role === "caregiver"
//                   ? mode === "signup"
//                     ? "Sign up to connect with caregivers."
//                     : "Sign in to continue."
//                   : mode === "signup"
//                   ? "Join the Kinscare community effortlessly."
//                   : "Sign in to continue."}
//               </DialogDescription>
//             </div>
//           )}

//           {!loading ? (
//             <div className="flex justify-center items-center flex-col gap-4">
//               {/* Social auth */}
//               <GoogleLogin
//                 size="large"
//                 onSuccess={handleGoogleSuccess}
//                 onError={handleGoogleError}
//                 theme="filled_black"
//                 text="continue_with"
//               />

//               <OrSeparator />

//               {/* Email/password form */}
//               <form
//                 onSubmit={handleSubmit(onSubmit)}
//                 className="space-y-2 w-full"
//               >
//                 {/* SIGNUP extra fields */}
//                 {mode === "signup" && (
//                   <div className="flex gap-4">
//                     <div className="w-1/2">
//                       <label htmlFor="fname" className="block mb-1 text-sm">
//                         First Name
//                       </label>
//                       <Controller
//                         name="fname"
//                         control={control}
//                         render={({ field }) => (
//                           <Input
//                             {...field}
//                             id="fname"
//                             placeholder="First Name"
//                             className={errors.fname ? "border-red-500" : ""}
//                           />
//                         )}
//                       />
//                       {errors.fname && (
//                         <p className="text-red-500 text-xs mt-1">
//                           {(errors as any).fname?.message as string}
//                         </p>
//                       )}
//                     </div>
//                     <div className="w-1/2">
//                       <label htmlFor="lname" className="block mb-1 text-sm">
//                         Last Name
//                       </label>
//                       <Controller
//                         name="lname"
//                         control={control}
//                         render={({ field }) => (
//                           <Input
//                             {...field}
//                             id="lname"
//                             placeholder="Last Name"
//                             className={errors.lname ? "border-red-500" : ""}
//                           />
//                         )}
//                       />
//                       {errors.lname && (
//                         <p className="text-red-500 text-xs mt-1">
//                           {(errors as any).lname?.message as string}
//                         </p>
//                       )}
//                     </div>
//                   </div>
//                 )}

//                 <div>
//                   <label htmlFor="email" className="block mb-1 text-sm">
//                     Email Address
//                   </label>
//                   <Controller
//                     name="email"
//                     control={control}
//                     render={({ field }) => (
//                       <Input
//                         {...field}
//                         id="email"
//                         placeholder="Email Address"
//                         className={errors.email ? "border-red-500" : ""}
//                       />
//                     )}
//                   />
//                   {errors.email && (
//                     <p className="text-red-500 text-xs mt-1">
//                       {(errors as any).email?.message as string}
//                     </p>
//                   )}
//                 </div>

//                 {mode === "signup" && (
//                   <div>
//                     <label htmlFor="tel" className="block mb-1 text-sm">
//                       Phone Number
//                     </label>
//                     <Controller
//                       name="tel"
//                       control={control}
//                       render={({ field }) => (
//                         <Input
//                           {...field}
//                           id="tel"
//                           placeholder="123-456-7890"
//                           className={errors.tel ? "border-red-500" : ""}
//                         />
//                       )}
//                     />
//                     {errors.tel && (
//                       <p className="text-red-500 text-xs mt-1">
//                         {(errors as any).tel?.message as string}
//                       </p>
//                     )}
//                   </div>
//                 )}

//                 <div>
//                   <label htmlFor="password" className="block mb-1 text-sm">
//                     Password
//                   </label>
//                   <Controller
//                     name="password"
//                     control={control}
//                     render={({ field }) => (
//                       <Input
//                         {...field}
//                         id="password"
//                         type="password"
//                         placeholder={
//                           mode === "signup"
//                             ? "Create a password"
//                             : "Your password"
//                         }
//                         className={errors.password ? "border-red-500" : ""}
//                       />
//                     )}
//                   />
//                   {errors.password && (
//                     <p className="text-red-500 text-xs mt-1">
//                       {(errors as any).password?.message as string}
//                     </p>
//                   )}

//                   {/* Forgot password link (signin only) */}
//                   {mode === "signin" && (
//                     <div className="flex  mt-1">
//                       <button
//                         type="button"
//                         onClick={() => {
//                           setResetEmail(formEmail);
//                           setIsForgotOpen(true);
//                         }}
//                         className="text-xs text-blue-600 underline hover:opacity-80"
//                       >
//                         Forgot password?
//                       </button>
//                     </div>
//                   )}
//                 </div>

//                 {mode === "signup" && (
//                   <div className="flex-1">
//                     <label
//                       htmlFor="confirm-password"
//                       className="block mb-1 text-sm font-medium text-gray-800 dark:text-white"
//                     >
//                       Confirm password
//                     </label>
//                     <Controller
//                       name="confirmPassword"
//                       control={control}
//                       render={({ field }) => (
//                         <Input
//                           type="password"
//                           {...field}
//                           id="confirm-password"
//                           placeholder="••••••••"
//                           className={
//                             (errors as any).confirmPassword
//                               ? "border-red-500"
//                               : "border-gray-300"
//                           }
//                         />
//                       )}
//                     />
//                     {(errors as any).confirmPassword && (
//                       <p className="text-red-500 text-xs">
//                         {(errors as any).confirmPassword?.message as string}
//                       </p>
//                     )}
//                   </div>
//                 )}

//                 {mode === "signup" && (
//                   <div>
//                     <label className="inline-flex items-center space-x-2">
//                       <Controller
//                         name="terms"
//                         control={control}
//                         render={({ field: { value, onChange, ...rest } }) => (
//                           <input
//                             {...rest}
//                             type="checkbox"
//                             checked={!!value}
//                             onChange={(e) => onChange(e.target.checked)}
//                             className="form-checkbox h-5 w-5 text-blue-600"
//                           />
//                         )}
//                       />
//                       <span className="text-sm">
//                         I agree to the{" "}
//                         <a
//                           href="/terms"
//                           target="_blank"
//                           className="text-blue-500 underline"
//                         >
//                           Terms and Conditions
//                         </a>
//                       </span>
//                     </label>
//                     {(errors as any).terms && (
//                       <p className="text-red-500 text-xs mt-1">
//                         {(errors as any).terms?.message as string}
//                       </p>
//                     )}
//                   </div>
//                 )}

//                 <Button type="submit" className="w-full" disabled={loading}>
//                   {loading ? (
//                     <Loader2 className="h-5 w-5 animate-spin" />
//                   ) : mode === "signup" ? (
//                     "Create account"
//                   ) : (
//                     "Sign in"
//                   )}
//                 </Button>

//                 {/* Toggle link */}
//                 <p className="text-center text-sm text-gray-600 mt-3">
//                   {mode === "signup" ? (
//                     <>
//                       Already have an account?{" "}
//                       <button
//                         type="button"
//                         onClick={toggleMode}
//                         className="text-blue-600 underline hover:opacity-80"
//                       >
//                         Sign in
//                       </button>
//                     </>
//                   ) : (
//                     <>
//                       New here?{" "}
//                       <button
//                         type="button"
//                         onClick={toggleMode}
//                         className="text-blue-600 underline hover:opacity-80"
//                       >
//                         Create an account
//                       </button>
//                     </>
//                   )}
//                 </p>
//               </form>
//             </div>
//           ) : (
//             <div className="flex justify-center w-full items-center">
//               <Loader2 size={30} className="animate-spin" />
//             </div>
//           )}
//         </DialogContent>
//       </Dialog>

//       {/* Forgot Password dialog */}
//       <Dialog open={isForgotOpen} onOpenChange={setIsForgotOpen}>
//         <DialogContent className="rounded-lg shadow-xl p-6 bg-white max-w-md">
//           <DialogTitle className="text-xl font-semibold">
//             Reset your password
//           </DialogTitle>
//           <DialogDescription className="text-gray-600 text-sm">
//             Enter the email tied to your account. We’ll send you a secure reset
//             link.
//           </DialogDescription>

//           <div className="mt-3 space-y-3">
//             <div>
//               <label htmlFor="reset-email" className="block mb-1 text-sm">
//                 Email address
//               </label>
//               <Input
//                 id="reset-email"
//                 type="email"
//                 placeholder="you@example.com"
//                 value={resetEmail}
//                 onChange={(e) => setResetEmail(e.target.value)}
//               />
//               {!isValidResetEmail && resetEmail?.length > 0 && (
//                 <p className="text-xs text-red-500 mt-1">
//                   Enter a valid email address.
//                 </p>
//               )}
//             </div>

//             <div className="flex justify-end gap-2 pt-2">
//               <Button
//                 type="button"
//                 variant="outline"
//                 onClick={() => setIsForgotOpen(false)}
//               >
//                 Cancel
//               </Button>
//               <Button
//                 type="button"
//                 onClick={sendReset}
//                 disabled={sendingReset || !isValidResetEmail}
//               >
//                 {sendingReset ? (
//                   <Loader2 className="h-4 w-4 animate-spin" />
//                 ) : (
//                   "Send reset link"
//                 )}
//               </Button>
//             </div>
//           </div>
//         </DialogContent>
//       </Dialog>
//     </GoogleOAuthProvider>
//   );
// };

// export default SignupDialog;
