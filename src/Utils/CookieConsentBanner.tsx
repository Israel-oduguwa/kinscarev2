"use client";

import React, { useEffect, useState } from "react";
import CookieConsent from "react-cookie-consent";
import Link from "next/link";
// --- ADD:
import { Dialog, DialogContent } from "@/components/ui/dialog";

type CookiePrefs = {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
};

declare global {
  interface Window {
    openCookiePreferences?: () => void;
  }
}

const COOKIE_NAME = "kinscare_cookie_preferences_v1";
const defaultPrefs: CookiePrefs = {
  necessary: true,
  analytics: false,
  marketing: false,
};

function getInitialPrefs(): CookiePrefs {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(COOKIE_NAME);
    if (stored) return JSON.parse(stored) as CookiePrefs;
  }
  return defaultPrefs;
}

export default function CookieConsentBanner() {
  const [showPrefs, setShowPrefs] = useState<boolean>(false);
  const [prefs, setPrefs] = useState<CookiePrefs>(getInitialPrefs);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(COOKIE_NAME, JSON.stringify(prefs));
    }
  }, [prefs]);

  useEffect(() => {
    window.openCookiePreferences = () => setShowPrefs(true);
  }, []);

  function handleAcceptAll() {
    setPrefs({ necessary: true, analytics: true, marketing: true });
    setShowPrefs(false);
  }

  function handleDeclineAll() {
    setPrefs({ necessary: true, analytics: false, marketing: false });
    setShowPrefs(false);
  }

  function handleSavePrefs() {
    setShowPrefs(false);
  }

  return (
    <>
      <CookieConsent
        location="bottom"
        buttonText="Accept"
        declineButtonText="Decline"
        enableDeclineButton
        cookieName={COOKIE_NAME}
        style={{
          background: "rgba(255,255,255,0.98)",
          color: "#1e293b",
          borderRadius: "1.25rem",
          maxWidth: "48rem",
          margin: "1rem auto",
          left: 0,
          right: 0,
          boxShadow: "0 8px 60px rgba(0,0,0,0.12)",
          fontSize: "0.95rem",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(0,0,0,0.05)",
          padding: "1.25rem 1.75rem",
        }}
        buttonStyle={{
          color: "#fff",
          background: "linear-gradient(135deg, #4361ee, #3a0ca3)",
          fontSize: "0.9rem",
          borderRadius: "0.75rem",
          fontWeight: "600",
          padding: "0.7rem 1.75rem",
          transition: "all 0.2s ease",
          border: "none",
        }}
        declineButtonStyle={{
          color: "#1e293b",
          background: "rgba(0,0,0,0.03)",
          fontSize: "0.9rem",
          borderRadius: "0.75rem",
          fontWeight: "600",
          padding: "0.7rem 1.75rem",
          transition: "all 0.2s ease",
          border: "1px solid rgba(0,0,0,0.08)",
        }}
        expires={365}
        onAccept={handleAcceptAll}
        onDecline={handleDeclineAll}
      >
        <div className="flex flex-col sm:flex-row items-start gap-3">
          <div className="bg-blue-50 p-2.5 rounded-xl">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <div>
            <p className="font-medium text-gray-900">
              We care about your privacy
            </p>
            <p className="mt-1 text-gray-600">
              KinsCare uses cookies to enhance your experience, analyze usage,
              and assist our marketing efforts. You can manage your preferences
              at any time.
            </p>
            <div className="mt-2 flex flex-wrap gap-3">
              <Link
                href="/privacy"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors inline-flex items-center"
              >
                Privacy Policy
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 ml-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
              {/* <button
                className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors inline-flex items-center"
                onClick={() => setShowPrefs(true)}
                type="button"
              >
                Preferences
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 ml-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button> */}
            </div>
          </div>
        </div>
      </CookieConsent>

      {/* --- Preferences Modal Using shadcn Dialog --- */}
      <Dialog open={showPrefs} onOpenChange={setShowPrefs}>
        <DialogContent className="max-w-lg p-0 overflow-hidden">
          <div className="p-6 pb-4">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Cookie Preferences
                </h2>
                <p className="text-gray-500 mt-1">
                  Control how we use cookies to enhance your experience
                </p>
              </div>
              {/* The Dialog close button is built-in, so you can omit your custom close button */}
            </div>
          </div>
          <div className="px-6 pb-2">
            <div className="space-y-4">
              {/* Necessary Cookies */}
              <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div className="flex items-center h-5 mt-0.5">
                  <input
                    type="checkbox"
                    checked
                    disabled
                    className="h-5 w-5 accent-blue-600 cursor-not-allowed"
                    id="cat-necessary"
                  />
                </div>
                <div>
                  <label
                    htmlFor="cat-necessary"
                    className="flex items-center gap-2"
                  >
                    <span className="font-semibold text-gray-900">
                      Necessary
                    </span>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                      Always active
                    </span>
                  </label>
                  <p className="text-gray-500 mt-1 text-sm">
                    Essential for the site to function properly
                  </p>
                </div>
              </div>

              {/* Analytics Cookies */}
              <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                <div className="flex items-center h-5 mt-0.5">
                  <input
                    type="checkbox"
                    checked={prefs.analytics}
                    onChange={() =>
                      setPrefs((prev) => ({
                        ...prev,
                        analytics: !prev.analytics,
                      }))
                    }
                    className="h-5 w-5 accent-blue-600 cursor-pointer"
                    id="cat-analytics"
                  />
                </div>
                <div>
                  <label
                    htmlFor="cat-analytics"
                    className="font-semibold text-gray-900 cursor-pointer"
                  >
                    Analytics
                  </label>
                  <p className="text-gray-500 mt-1 text-sm">
                    Helps us improve our services by collecting usage data
                  </p>
                </div>
              </div>

              {/* Marketing Cookies */}
              <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                <div className="flex items-center h-5 mt-0.5">
                  <input
                    type="checkbox"
                    checked={prefs.marketing}
                    onChange={() =>
                      setPrefs((prev) => ({
                        ...prev,
                        marketing: !prev.marketing,
                      }))
                    }
                    className="h-5 w-5 accent-blue-600 cursor-pointer"
                    id="cat-marketing"
                  />
                </div>
                <div>
                  <label
                    htmlFor="cat-marketing"
                    className="font-semibold text-gray-900 cursor-pointer"
                  >
                    Marketing
                  </label>
                  <p className="text-gray-500 mt-1 text-sm">
                    Personalizes ads and content based on your interests
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 pt-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl px-4 py-3 font-semibold hover:opacity-95 transition-opacity shadow-sm"
                onClick={handleSavePrefs}
                type="button"
              >
                Save Preferences
              </button>
              <div className="flex gap-3">
                <button
                  className="bg-gray-100 text-gray-700 rounded-xl px-4 py-3 font-medium hover:bg-gray-200 transition-colors"
                  onClick={handleAcceptAll}
                  type="button"
                >
                  Accept All
                </button>
                <button
                  className="bg-gray-100 text-gray-700 rounded-xl px-4 py-3 font-medium hover:bg-gray-200 transition-colors"
                  onClick={handleDeclineAll}
                  type="button"
                >
                  Decline
                </button>
              </div>
            </div>
            <p className="text-center text-gray-400 text-xs mt-4">
              You can update your preferences anytime through our Privacy Policy
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
