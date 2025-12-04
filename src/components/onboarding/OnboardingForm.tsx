// File: app/(auth)/onboarding/page.tsx
"use client";

import * as React from "react";
import Image from "next/image";
import { UserRound, MapPin, ChevronDown, Check, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { completeOnboarding } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

type RoleValue = "" | "provider" | "caregiver" | "admin";

const ROLE_OPTIONS: {
  value: Exclude<RoleValue, "">;
  label: string;
  desc: string;
}[] = [
  {
    value: "provider",
    label: "Provider hiring Caregivers or NACs",
    desc: "Find qualified, background-checked caregivers ready to work in your area.",
  },
  {
    value: "caregiver",
    label: "Caregiver looking for a Job",
    desc: "Apply to verified employers and connect with families seeking your skills.",
  },
];

function RoleSelect({
  value,
  onChange,
  error,
}: {
  value: RoleValue;
  onChange: (v: RoleValue) => void;
  error?: string | null;
}) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-slate-700 dark:text-slate-200 flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-500/20">
          <UserRound className="h-4.5 w-4.5 text-indigo-600 dark:text-indigo-400" />
        </div>
        Tell us why you are here
      </label>

      <div className="grid gap-3">
        {ROLE_OPTIONS.map((opt) => {
          const isSelected = opt.value === value;
          return (
            <label
              key={opt.value}
              className={[
                "flex items-start gap-3 rounded-2xl border px-4 py-3 cursor-pointer transition-all",
                isSelected
                  ? "border-indigo-500/70 bg-indigo-50/60 dark:bg-indigo-900/20 shadow-sm"
                  : "border-gray-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500/60",
              ].join(" ")}
            >
              <input
                type="radio"
                name="role"
                value={opt.value}
                checked={isSelected}
                onChange={() => onChange(opt.value)}
                className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <div className="font-semibold text-slate-900 dark:text-slate-100">
                  {opt.value === "caregiver"
                    ? "I AM A CAREGIVER LOOKING FOR A JOB"
                    : "I AM A PROVIDER SEARCHING FOR CAREGIVER(S)/NACs"}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {opt.desc}
                </div>
              </div>
            </label>
          );
        })}
      </div>

      {error ? <p className="mt-2 text-xs text-rose-600">{error}</p> : null}
    </div>
  );
}

export default function OnboardingForm() {
  const [role, setRole] = React.useState<RoleValue>("");
  const [zipcode, setZipcode] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [roleError, setRoleError] = React.useState<string | null>(null);
  const router = useRouter();
  const { user } = useUser();
  const autoRoutedRef = React.useRef(false);

  const routeByRole = React.useCallback(
    (userRole: RoleValue | null | undefined) => {
      switch (userRole) {
        case "caregiver":
          router.push("/vitae/jobs/all");
          return true;
        case "provider":
          router.push("/provider/candidates/all");
          return true;
        case "admin":
          router.push("/agent/twilio");
          return true;
        default:
          return false;
      }
    },
    [router]
  );

  React.useEffect(() => {
    if (autoRoutedRef.current) return;
    const pm = (user?.publicMetadata || {}) as Record<string, any>;
    if (pm.onboardingComplete === true) {
      autoRoutedRef.current = true;
      const roleToRoute = (pm.role as RoleValue | undefined) || role || undefined;
      if (!routeByRole(roleToRoute)) {
        router.push("/");
      }
    }
  }, [user, role, routeByRole, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!role) {
      setRoleError("Please select your role");
      return;
    }
    setRoleError(null);
    setIsLoading(true);

    // Simulate API call
    const formData: any = {
      role,
      zipcode,
    };
    const res = await completeOnboarding(formData);
    if (res.success) {
      await user?.reload();
      const roleToRoute =
        ((user?.publicMetadata || {}) as Record<string, any>).role ||
        (res.role as RoleValue | undefined) ||
        role ||
        undefined;

      if (!routeByRole(roleToRoute)) {
        router.push("/");
      }
    }
    setIsLoading(false);
  }

  const handleZipcodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d-]/g, "");
    if (value.length === 5 && !value.includes("-")) {
      setZipcode(value);
    } else if (value.length > 5 && !value.includes("-")) {
      setZipcode(`${value.slice(0, 5)}-${value.slice(5, 9)}`);
    } else {
      setZipcode(value);
    }
  };

  return (
    <main className="min-h-dvh bg-linear-to-br from-slate-50 via-white to-indigo-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/20 flex items-center justify-center p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-200/20 dark:bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200/20 dark:bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative">
        {/* Enhanced Brand Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 flex flex-col items-center justify-center"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="relative">
              <Image
                width={52}
                height={52}
                className="w-13 h-13"
                src="https://firebasestorage.googleapis.com/v0/b/exhct2004.appspot.com/o/Kinscare%20Logo.svg?alt=media&token=e0ffb5fe-d0f9-4992-b505-a4180dffe444"
                alt="Kinscare Logo"
              />
            </div>
            <h1 className="font-bold text-2xl bg-linear-to-r from-slate-900 to-indigo-900 dark:from-white dark:to-indigo-200 bg-clip-text text-transparent tracking-tight">
              Kinscare
            </h1>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 text-center max-w-sm">
            Whether you're hiring, seeking caregiving opportunities, or
            exploring a future in healthcare—KinsCare is built for you.
          </p>
        </motion.div>

        {/* Enhanced Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-linear-to-r from-indigo-500/5 to-purple-500/5 rounded-3xl blur-sm"></div>
          <div className="relative rounded-3xl border border-gray-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-2xl shadow-indigo-500/5 p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Get Started
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Tell us why you are here so we can tailor your experience
              </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-6">
              {/* Custom Role Select */}
              <RoleSelect value={role} onChange={setRole} error={roleError} />

              {/* Enhanced Zipcode Input */}
              <div className="space-y-3">
                <label
                  htmlFor="zipcode"
                  className="text-sm font-medium text-slate-700 dark:text-slate-200 flex items-center gap-2"
                >
                  <div className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-500/20">
                    <MapPin className="h-4.5 w-4.5 text-purple-600 dark:text-purple-400" />
                  </div>
                  Your location
                </label>
                <input
                  id="zipcode"
                  inputMode="numeric"
                  autoComplete="postal-code"
                  placeholder="Enter your ZIP code"
                  className="w-full h-12 rounded-2xl bg-white dark:bg-slate-800 border border-gray-200/80 dark:border-slate-700/80 px-4 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200 hover:border-indigo-300 dark:hover:border-indigo-400 placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-sm"
                  value={zipcode}
                  onChange={handleZipcodeChange}
                  maxLength={10}
                  pattern="^\d{5}(-\d{4})?$"
                  required
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 px-1">
                  We use your location to match you with relevant opportunities
                  in your area
                </p>
              </div>

              {/* Enhanced Submit Button */}
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: isLoading ? 1 : 1.02 }}
                whileTap={{ scale: isLoading ? 1 : 0.98 }}
                className="w-full h-12 rounded-2xl bg-linear-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
              >
                <AnimatePresence mode="wait">
                  {isLoading ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center justify-center gap-2"
                    >
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Setting up your account...{" "}
                     
                    </motion.div>
                  ) : (
                    <motion.span
                      key="text"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="relative z-10 flex items-center justify-center gap-2"
                    >
                      Continue to Your Dashboard
                      <motion.span
                        animate={{ x: [0, 4, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        →
                      </motion.span>
                    </motion.span>
                  )}
                </AnimatePresence>
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-linear-to-r from-transparent via-white/20 to-transparent" />
              </motion.button>
            </form>

            {/* Security Badge */}
            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-slate-800">
              <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                Secure and encrypted • Your data is protected
              </div>
            </div>
          </div>
        </motion.div>

        {/* Legal */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400 px-4"
        >
          By continuing, you agree to our{" "}
          <a
            className="underline hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            href="/terms"
          >
            Terms of Use
          </a>{" "}
          and{" "}
          <a
            className="underline hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            href="/privacy"
          >
            Privacy Policy
          </a>
          .
        </motion.p>
      </div>
    </main>
  );
}


























// // File: app/(auth)/onboarding/page.tsx
// "use client";

// import * as React from "react";
// import Image from "next/image";
// import { UserRound, MapPin, ChevronDown, Check, Loader2 } from "lucide-react";
// import { motion, AnimatePresence } from "framer-motion";
// import { completeOnboarding } from "@/lib/actions";
// import { useRouter } from "next/navigation";
// import { useUser } from "@clerk/nextjs";

// type RoleValue = "" | "provider" | "caregiver";

// const ROLE_OPTIONS: {
//   value: Exclude<RoleValue, "">;
//   label: string;
//   desc: string;
// }[] = [
//   {
//     value: "provider",
//     label: "Provider hiring Caregivers or NACs",
//     desc: "Find qualified, background-checked caregivers ready to work in your area.",
//   },
//   {
//     value: "caregiver",
//     label: "Caregiver looking for a Job",
//     desc: "Apply to verified employers and connect with families seeking your skills.",
//   },
// ];

// /** Headless custom selector with keyboard & ARIA */
// function RoleSelect({
//   value,
//   onChange,
//   error,
// }: {
//   value: RoleValue;
//   onChange: (v: RoleValue) => void;
//   error?: string | null;
// }) {
//   const [open, setOpen] = React.useState(false);
//   const [activeIndex, setActiveIndex] = React.useState<number>(-1);
//   const buttonRef = React.useRef<HTMLButtonElement | null>(null);
//   const listRef = React.useRef<HTMLUListElement | null>(null);

//   const selected = ROLE_OPTIONS.find((o) => o.value === value);

//   // Close on outside click
//   React.useEffect(() => {
//     function onDocClick(e: MouseEvent) {
//       if (!open) return;
//       const target = e.target as Node;
//       if (buttonRef.current?.contains(target)) return;
//       if (listRef.current?.contains(target)) return;
//       setOpen(false);
//       setActiveIndex(-1);
//     }
//     document.addEventListener("mousedown", onDocClick);
//     return () => document.removeEventListener("mousedown", onDocClick);
//   }, [open]);

//   // Keyboard interactions
//   function handleButtonKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
//     if (e.key === "ArrowDown" || e.key === "ArrowUp") {
//       e.preventDefault();
//       setOpen(true);
//       setActiveIndex((idx) => {
//         if (idx === -1) return 0;
//         const next = e.key === "ArrowDown" ? idx + 1 : idx - 1;
//         return Math.max(0, Math.min(ROLE_OPTIONS.length - 1, next));
//       });
//     } else if (e.key === "Enter" || e.key === " ") {
//       e.preventDefault();
//       setOpen((o) => !o);
//     }
//   }

//   function handleListKeyDown(e: React.KeyboardEvent<HTMLUListElement>) {
//     if (e.key === "Escape") {
//       e.preventDefault();
//       setOpen(false);
//       buttonRef.current?.focus();
//       return;
//     }
//     if (e.key === "ArrowDown" || e.key === "ArrowUp") {
//       e.preventDefault();
//       setActiveIndex((idx) => {
//         const next = e.key === "ArrowDown" ? idx + 1 : idx - 1;
//         return Math.max(0, Math.min(ROLE_OPTIONS.length - 1, next));
//       });
//     }
//     if (e.key === "Enter" || e.key === " ") {
//       e.preventDefault();
//       const opt = ROLE_OPTIONS[activeIndex];
//       if (opt) {
//         onChange(opt.value);
//         setOpen(false);
//         buttonRef.current?.focus();
//       }
//     }
//   }

//   return (
//     <div className="space-y-3">
//       <label className="text-sm font-medium text-slate-700 dark:text-slate-200 flex items-center gap-2">
//         <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-500/20">
//           <UserRound className="h-4.5 w-4.5 text-indigo-600 dark:text-indigo-400" />
//         </div>
//         I am a .....
//       </label>

//       <div className="relative group">
//         <button
//           ref={buttonRef}
//           type="button"
//           role="combobox"
//           aria-expanded={open}
//           aria-controls="role-listbox"
//           aria-haspopup="listbox"
//           aria-activedescendant={
//             activeIndex >= 0 ? `role-opt-${activeIndex}` : undefined
//           }
//           onKeyDown={handleButtonKeyDown}
//           onClick={() => setOpen((o) => !o)}
//           className="w-full h-12 rounded-2xl bg-white dark:bg-slate-800 border border-gray-200/80 dark:border-slate-700/80 px-4 pr-12 text-left text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200 group-hover:border-indigo-300 dark:group-hover:border-indigo-400 shadow-sm"
//         >
//           {selected ? (
//             <span className="block truncate">{selected.label}</span>
//           ) : (
//             <span className="text-slate-400 dark:text-slate-500">
//               Select your role
//             </span>
//           )}
//           <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-transform duration-200 group-hover:scale-110">
//             <ChevronDown className="h-4 w-4" />
//           </span>
//         </button>

//         <AnimatePresence>
//           {open && (
//             <motion.ul
//               ref={listRef}
//               id="role-listbox"
//               role="listbox"
//               aria-label="Select role"
//               tabIndex={-1}
//               initial={{ opacity: 0, y: 8, scale: 0.98 }}
//               animate={{ opacity: 1, y: 0, scale: 1 }}
//               exit={{ opacity: 0, y: 6, scale: 0.98 }}
//               transition={{ duration: 0.12 }}
//               onKeyDown={handleListKeyDown}
//               className="absolute z-50 mt-2 w-full rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xl overflow-hidden"
//             >
//               {ROLE_OPTIONS.map((opt, idx) => {
//                 const isActive = idx === activeIndex;
//                 const isSelected = opt.value === value;
//                 return (
//                   <li
//                     id={`role-opt-${idx}`}
//                     key={opt.value}
//                     role="option"
//                     aria-selected={isSelected}
//                     onMouseEnter={() => setActiveIndex(idx)}
//                     onMouseDown={(e) => {
//                       // prevent button blur cancellation
//                       e.preventDefault();
//                     }}
//                     onClick={() => {
//                       onChange(opt.value);
//                       setOpen(false);
//                       buttonRef.current?.focus();
//                     }}
//                     className={[
//                       "cursor-pointer px-4 py-3 text-sm flex items-start justify-between gap-3 transition-colors",
//                       isActive ? "bg-indigo-50 dark:bg-indigo-900/20" : "",
//                     ].join(" ")}
//                   >
//                     <div>
//                       <div className="font-medium text-slate-900 dark:text-slate-100">
//                         {opt.label}
//                       </div>
//                       <div className="text-xs text-slate-500 dark:text-slate-400">
//                         {opt.desc}
//                       </div>
//                     </div>
//                     {isSelected && (
//                       <Check className="h-4 w-4 mt-0.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
//                     )}
//                   </li>
//                 );
//               })}
//             </motion.ul>
//           )}
//         </AnimatePresence>

//         {error ? <p className="mt-2 text-xs text-rose-600">{error}</p> : null}
//       </div>
//     </div>
//   );
// }

// export default function OnboardingForm() {
//   const [role, setRole] = React.useState<RoleValue>("");
//   const [zipcode, setZipcode] = React.useState("");
//   const [isLoading, setIsLoading] = React.useState(false);
//   const [roleError, setRoleError] = React.useState<string | null>(null);
//   const router = useRouter();
//   const { isLoaded, user } = useUser();

//   // 🔄 Auto-redirect if onboarding is already complete
//   React.useEffect(() => {
//     if (!isLoaded || !user) return;

//     const pm = (user.publicMetadata || {}) as any;
//     const onboardingComplete = pm.onboardingComplete === true;

//     if (onboardingComplete) {
//       const userRole = (pm.role as RoleValue) || "";

//       // Route based on role (you can tweak these destinations)
//       if (userRole === "caregiver") {
//         router.replace("/vitae/jobs/all");
//       } else if (userRole === "provider") {
//         router.replace("/provider/candidates/all");
//       } else {
//         router.replace("/vitae/jobs/all");
//       }
//       return;
//     }

//     // Prefill role + zipcode if they exist in publicMetadata and local state is empty
//     if (!role && pm.role && (pm.role === "caregiver" || pm.role === "provider")) {
//       setRole(pm.role as RoleValue);
//     }
//     if (!zipcode && pm.zipcode) {
//       setZipcode(String(pm.zipcode));
//     }
//   }, [isLoaded, user, router, role, zipcode]);

//   async function onSubmit(e: React.FormEvent) {
//     e.preventDefault();
//     if (!role) {
//       setRoleError("Please select your role");
//       return;
//     }
//     setRoleError(null);
//     setIsLoading(true);

//     const formData: any = {
//       role,
//       zipcode,
//     };
//     const res = await completeOnboarding(formData);
//     if (res.success) {
//       // we send the Tracking Data's GTM, mixpanel and email it might be from the server

//       //   send a good toast message
//       // Route the user to their Dashboards
//       switch (res.role) {
//         case "caregiver":
//           router.push("/vitae/jobs/all");
//         case "provider":
//           router.push("/vitae/jobs/all");
//           break;
//         default:
//           break;
//       }
//     }
//     setIsLoading(false);
//   }

//   const handleZipcodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const value = e.target.value.replace(/[^\d-]/g, "");
//     if (value.length === 5 && !value.includes("-")) {
//       setZipcode(value);
//     } else if (value.length > 5 && !value.includes("-")) {
//       setZipcode(`${value.slice(0, 5)}-${value.slice(5, 9)}`);
//     } else {
//       setZipcode(value);
//     }
//   };

//   return (
//     <main className="min-h-dvh bg-linear-to-br from-slate-50 via-white to-indigo-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/20 flex items-center justify-center p-4">
//       {/* Animated background elements */}
//       <div className="absolute inset-0 overflow-hidden">
//         <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-200/20 dark:bg-indigo-500/10 rounded-full blur-3xl"></div>
//         <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200/20 dark:bg-purple-500/10 rounded-full blur-3xl"></div>
//       </div>

//       <div className="w-full max-w-md relative">
//         {/* Enhanced Brand Section */}
//         <motion.div
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.6 }}
//           className="mb-8 flex flex-col items-center justify-center"
//         >
//           <div className="flex items-center gap-3 mb-2">
//             <div className="relative">
//               <Image
//                 width={52}
//                 height={52}
//                 className="w-13 h-13"
//                 src="https://firebasestorage.googleapis.com/v0/b/exhct2004.appspot.com/o/Kinscare%20Logo.svg?alt=media&token=e0ffb5fe-d0f9-4992-b505-a4180dffe444"
//                 alt="Kinscare Logo"
//               />
//             </div>
//             <h1 className="font-bold text-2xl bg-linear-to-r from-slate-900 to-indigo-900 dark:from-white dark:to-indigo-200 bg-clip-text text-transparent tracking-tight">
//               Kinscare
//             </h1>
//           </div>
//           <p className="text-sm text-slate-600 dark:text-slate-400 text-center max-w-sm">
//             Whether you're hiring, seeking caregiving opportunities, or
//             exploring a future in healthcare—KinsCare is built for you.
//           </p>
//         </motion.div>

//         {/* Enhanced Card */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.7, delay: 0.1 }}
//           className="relative"
//         >
//           <div className="absolute inset-0 bg-linear-to-r from-indigo-500/5 to-purple-500/5 rounded-3xl blur-sm"></div>
//           <div className="relative rounded-3xl border border-gray-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-2xl shadow-indigo-500/5 p-8">
//             <div className="text-center mb-6">
//               <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
//                 Get Started
//               </h2>
//               <p className="text-sm text-slate-600 dark:text-slate-400">
//                 Tell us about yourself to personalize your experience
//               </p>
//             </div>

//             <form onSubmit={onSubmit} className="space-y-6">
//               {/* Custom Role Select */}
//               <RoleSelect value={role} onChange={setRole} error={roleError} />

//               {/* Enhanced Zipcode Input */}
//               <div className="space-y-3">
//                 <label
//                   htmlFor="zipcode"
//                   className="text-sm font-medium text-slate-700 dark:text-slate-200 flex items-center gap-2"
//                 >
//                   <div className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-500/20">
//                     <MapPin className="h-4.5 w-4.5 text-purple-600 dark:text-purple-400" />
//                   </div>
//                   Your location
//                 </label>
//                 <input
//                   id="zipcode"
//                   inputMode="numeric"
//                   autoComplete="postal-code"
//                   placeholder="Enter your ZIP code"
//                   className="w-full h-12 rounded-2xl bg-white dark:bg-slate-800 border border-gray-200/80 dark:border-slate-700/80 px-4 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200 hover:border-indigo-300 dark:hover:border-indigo-400 placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-sm"
//                   value={zipcode}
//                   onChange={handleZipcodeChange}
//                   maxLength={10}
//                   pattern="^\d{5}(-\d{4})?$"
//                   required
//                 />
//                 <p className="text-xs text-slate-500 dark:text-slate-400 px-1">
//                   We use your location to match you with relevant opportunities
//                   in your area
//                 </p>
//               </div>

//               {/* Enhanced Submit Button */}
//               <motion.button
//                 type="submit"
//                 disabled={isLoading}
//                 whileHover={{ scale: isLoading ? 1 : 1.02 }}
//                 whileTap={{ scale: isLoading ? 1 : 0.98 }}
//                 className="w-full h-12 rounded-2xl bg-linear-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
//               >
//                 <AnimatePresence mode="wait">
//                   {isLoading ? (
//                     <motion.div
//                       key="loading"
//                       initial={{ opacity: 0 }}
//                       animate={{ opacity: 1 }}
//                       exit={{ opacity: 0 }}
//                       className="flex items-center justify-center gap-2"
//                     >
//                       <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
//                       Setting up your account...{" "}
//                     </motion.div>
//                   ) : (
//                     <motion.span
//                       key="text"
//                       initial={{ opacity: 0 }}
//                       animate={{ opacity: 1 }}
//                       exit={{ opacity: 0 }}
//                       className="relative z-10 flex items-center justify-center gap-2"
//                     >
//                       Continue to Your Dashboard
//                       <motion.span
//                         animate={{ x: [0, 4, 0] }}
//                         transition={{ duration: 1.5, repeat: Infinity }}
//                       >
//                         →
//                       </motion.span>
//                     </motion.span>
//                   )}
//                 </AnimatePresence>
//                 <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
//               </motion.button>
//             </form>

//             {/* Security Badge */}
//             <div className="mt-6 pt-6 border-t border-gray-100 dark:border-slate-800">
//               <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
//                 <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
//                 Secure and encrypted • Your data is protected
//               </div>
//             </div>
//           </div>
//         </motion.div>

//         {/* Legal */}
//         <motion.p
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ duration: 0.7, delay: 0.3 }}
//           className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400 px-4"
//         >
//           By continuing, you agree to our{" "}
//           <a
//             className="underline hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
//             href="/terms"
//           >
//             Terms of Use
//           </a>{" "}
//           and{" "}
//           <a
//             className="underline hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
//             href="/privacy"
//           >
//             Privacy Policy
//           </a>
//           .
//         </motion.p>
//       </div>
//     </main>
//   );
// }
