"use client";

import { useAuthContext } from "@/context/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import axios from "axios";
import * as React from "react";

type Ms = number;

const SESSION_KEY = "jumpstart_modal_shown";
const STORE_KEY = "jumpstart_modal_store";
const CONVERTED_KEY = "jumpstart_converted";

type Store = {
  lastShownAt?: number; // ms epoch
  showCount?: number; // how many times lifetime
  dismissedCount?: number; // how many hard “No thanks”
  lastDismissReason?: "later" | "no";
  lastCtaClickAt?: number; // last time CTA clicked
  cooldownUntil?: number; // do not show before this time
};

const now = () => Date.now();
const hours = (n: number): Ms => n * 60 * 60 * 1000;
const days = (n: number): Ms => hours(24) * n;

// Cooldown policy
const COOLDOWN = {
  firstView: hours(0), // first-time view allowed immediately
  maybeLater: hours(12), // “Maybe later” = 12h
  noThanks: days(7), // “No thanks” = 7d
  backoutRetry: hours(1), // clicked CTA but didn’t convert = retry in 1h
};

// Exponential backoff for repeated views (applies when simply auto-shown)
function nextAutoCooldown(showCount: number): Ms {
  // 0->0d, 1->1d, 2->3d, 3+->7d
  if (showCount <= 0) return COOLDOWN.firstView;
  if (showCount === 1) return days(1);
  if (showCount === 2) return days(3);
  return days(7);
}

function readStore(): Store {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? (JSON.parse(raw) as Store) : {};
  } catch {
    return {};
  }
}

function writeStore(patch: Partial<Store>) {
  try {
    const prev = readStore();
    const next = { ...prev, ...patch };
    localStorage.setItem(STORE_KEY, JSON.stringify(next));
  } catch {
    /* no-op */
  }
}

function sessionShown(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) === "true";
  } catch {
    return false;
  }
}

function setSessionShown() {
  try {
    sessionStorage.setItem(SESSION_KEY, "true");
  } catch {
    /* no-op */
  }
}

export default function JumpstartHiringModal({
  source,
  email,
  phone,
  jumpstart,
  zipcode,
  flowSid,
  executionSid,
}: {
  source?: string;
  email?: string;
  phone?: string;
  jumpstart?: string;
  zipcode?: string;
  flowSid?: string;
  executionSid?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const router = useRouter();
  const {userData}:any = useAuthContext()
  const isSignedIn  = userData
  const forceShow = (jumpstart || "").toUpperCase() === "NO";

  // Plan: decide eligibility once on mount.
  React.useEffect(() => {
    // Hard stop if they convertedØ
    if (typeof window === "undefined") return;
    if (localStorage.getItem(CONVERTED_KEY) === "true") return;

    // Only for Twilio/lead-entry traffic
    const fromTwilio = source === "twilio" || !!email || !!phone;
    if (!fromTwilio) return;

    const store = readStore();
    const t = now();

    // Force show path (jumpstart=NO link) bypasses cooldown/session guard
    if (forceShow && !isSignedIn) {
      setOpen(true);
      setSessionShown();
      const newCount = (store.showCount || 0) + 1;
      writeStore({
        lastShownAt: now(),
        showCount: newCount,
        cooldownUntil: now() + nextAutoCooldown(newCount),
      });
      return;
    }

    // Don’t show if already shown this session or signed in
    if (sessionShown() || isSignedIn) return;

    // Respect active cooldown
    if (store.cooldownUntil && t < store.cooldownUntil) return;

    // If they clicked CTA previously but never set converted, treat as backout → short retry
    const hadBackout =
      !!store.lastCtaClickAt && localStorage.getItem(CONVERTED_KEY) !== "true";

    const delay = hadBackout ? COOLDOWN.backoutRetry : 10000; // 10s normal, 1h backout retry timer handled below
    // If backout retry is requested, ensure enough time has passed
    if (hadBackout) {
      const eligibleAt = (store.lastCtaClickAt || 0) + COOLDOWN.backoutRetry;
      if (t < eligibleAt) return; // not yet eligible
    }

    const timer = setTimeout(
      () => {
        setOpen(true);
        setSessionShown();
        // Record show meta + set next auto cooldown (soft)
        const newCount = (store.showCount || 0) + 1;
        writeStore({
          lastShownAt: now(),
          showCount: newCount,
          cooldownUntil: now() + nextAutoCooldown(newCount),
        });
      },
      typeof delay === "number" ? delay : 10000
    );

    return () => clearTimeout(timer);
  }, [source, email, phone, isSignedIn, forceShow]);

  // CTA click → capture lead then route to apply
  const handleCtaClick = async () => {
    writeStore({ lastCtaClickAt: now() });
    setSubmitting(true);

    const payload = {
      email: email || "",
      phone: phone || "",
      zipcode: zipcode || "",
      source: "twilio",
      channel: "sms",
      flowSid: flowSid || undefined,
      executionSid: executionSid || undefined,
      jump_start: true,
      timestamp: new Date().toISOString(),
      tags: ["findcaregiver", "yes-response", "qualified-caregiver"],
      contact: {
        channel: {
          address: phone || "",
        },
      },
    };

    try {
      await axios.post(
        "https://jrp7pe2xhj.us-east-1.awsapprunner.com/webhooks/twilio/capture-lead",
        payload
      );
      localStorage.setItem(CONVERTED_KEY, "true");
    } catch (error) {
      console.error("Failed to capture jumpstart lead", error);
    } finally {
      setSubmitting(false);
      router.push("/caregivers");
    }
  };

  // “Maybe later” → shorter cooldown
  const handleLater = () => {
    setOpen(false);
    writeStore({
      lastDismissReason: "later",
      cooldownUntil: now() + COOLDOWN.maybeLater,
    });
  };

  // “No thanks” → long cooldown
  const handleNo = () => {
    setOpen(false);
    const s = readStore();
    writeStore({
      lastDismissReason: "no",
      dismissedCount: (s.dismissedCount || 0) + 1,
      cooldownUntil: now() + COOLDOWN.noThanks,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Jumpstart Hiring
          </DialogTitle>
          <DialogDescription className="text-gray-600 mt-2">
            Want to save time hiring?
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-3 text-gray-700 leading-relaxed">
          <p>
            <strong>KinsCare agents</strong> will search, screen, and schedule
            interviews with <strong>3 caregivers</strong> for you in{" "}
            <strong>3 days</strong> — guaranteed.
          </p>

          <ul className="list-disc pl-5 space-y-1">
            <li>Handpicked matches — no stress</li>
            <li>Interviews arranged for you</li>
            <li>2 weeks full platform access</li>
          </ul>

          <p className="text-sm text-gray-500 mt-2">
            No commitment · Quick turnaround · Satisfaction guaranteed
          </p>
        </div>

        <DialogFooter className="mt-6">
          <button
            onClick={handleCtaClick}
            disabled={submitting}
            className="group inline-block w-full rounded-xl bg-linear-to-r from-blue-500 to-sky-500 hover:from-blue-600 hover:to-sky-600 shadow-lg px-4 py-3.5 text-white font-bold text-base text-center transition-all duration-300 relative overflow-hidden disabled:opacity-70"
          >
            <div className="relative z-10 flex items-center justify-center gap-2">
              {submitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Zap className="h-5 w-5 text-yellow-200 group-hover:animate-pulse" />
              )}
              <span>{submitting ? "Working..." : "Get Started"}</span>
            </div>
            <div className="absolute inset-0 bg-linear-to-r from-blue-600 to-sky-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
