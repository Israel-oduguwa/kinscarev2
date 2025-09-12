"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { MultiSelect } from "@/components/multi-select";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { Toaster, toast } from "sonner";
import { Search, Sparkles } from "lucide-react"; // Sparkles = ai-wand
import Link from "next/link";

/**
 * Props interface for SearchBar component.
 */
interface SearchBarProps {
  availability?: string[];
  licenses?: string[];
  onConcierge?: () => void;
}

/** LocalStorage key */
const STORAGE_KEY = "kc_search_prefs";

/** Shape we store in LS */
type StoredPrefs = {
  selectedShifts: string[];
  selectedLicenses: string[];
  // optional attribution / prefill fields
  cio_id?: string | null;
  email?: string | null;
  name?: string | null;
  // helpful metadata
  path?: string;
  href?: string;
  updatedAt?: string; // ISO date
  lastSearchAt?: string; // ISO date
};

const safeGet = <T,>(key: string): T | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
};

const safeSet = (key: string, value: unknown) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore quota errors silently
  }
};

/**
 * SearchBar component for filtering caregivers.
 */
const SearchBar: React.FC<SearchBarProps> = ({ availability, licenses }) => {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Initial fallbacks
  const defaultShifts = availability ?? ["Full time"];
  const defaultLicenses = licenses ?? ["HCA"];

  // State for selected shifts and licenses
  const [selectedShifts, setSelectedShifts] = useState<string[]>(
    defaultShifts
  );
  const [selectedLicenses, setSelectedLicenses] = useState<string[]>(
    defaultLicenses
  );
  const [loading, setLoading] = useState(false);

  /**
   * Load any previous prefs from LS on mount, otherwise save initial snapshot
   * Also capture URL params (cio_id, email, name) for attribution/prefill
   */
  useEffect(() => {
    // URL-derived fields
    const cio_id = searchParams.get("cio_id");
    const email = searchParams.get("email");
    const name =
      searchParams.get("name") ??
      searchParams.get("contact_name") ?? // just in case you pass a different key
      searchParams.get("Contact%20Name"); // rare case of encoded key

    const existing = safeGet<StoredPrefs>(STORAGE_KEY);

    if (existing) {
      // hydrate UI from previous saved selections (don’t override URL identity fields)
      if (existing.selectedShifts?.length) {
        setSelectedShifts(existing.selectedShifts);
      }
      if (existing.selectedLicenses?.length) {
        setSelectedLicenses(existing.selectedLicenses);
      }

      // merge URL identifiers if present
      const merged: StoredPrefs = {
        ...existing,
        cio_id: cio_id ?? existing.cio_id ?? null,
        email: email ?? existing.email ?? null,
        name: name ?? existing.name ?? null,
        path: typeof window !== "undefined" ? window.location.pathname : existing.path,
        href: typeof window !== "undefined" ? window.location.href : existing.href,
        updatedAt: new Date().toISOString(),
      };
      safeSet(STORAGE_KEY, merged);
    } else {
      // first save
      const first: StoredPrefs = {
        selectedShifts: defaultShifts,
        selectedLicenses: defaultLicenses,
        cio_id,
        email,
        name,
        path: typeof window !== "undefined" ? window.location.pathname : undefined,
        href: typeof window !== "undefined" ? window.location.href : undefined,
        updatedAt: new Date().toISOString(),
      };
      safeSet(STORAGE_KEY, first);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount

  /**
   * Persist whenever selections change
   */
  useEffect(() => {
    const prev = safeGet<StoredPrefs>(STORAGE_KEY) ?? {};
    const next: StoredPrefs = {
      ...prev,
      selectedShifts,
      selectedLicenses,
      updatedAt: new Date().toISOString(),
    };
    safeSet(STORAGE_KEY, next);
  }, [selectedShifts, selectedLicenses]);

  /**
   * Handler for the Concierge (Jumpstart Hiring) button.
   * Validates selections before navigation.
   */
  const onConcierge = () => {
    toast.info(
      "Great! A KinsCare agent will handle your search and find the best caregivers for you."
    );
    const prev = safeGet<StoredPrefs>(STORAGE_KEY) ?? {};
    safeSet(STORAGE_KEY, {
      ...prev,
      selectedShifts,
      selectedLicenses,
      updatedAt: new Date().toISOString(),
      lastSearchAt: new Date().toISOString(),
    } as StoredPrefs);
    router.push("/jumpstart-hiring/apply");
  };

  // Options for the shift type select
  const shiftOptions = useMemo(
    () => [
      { label: "Full time", value: "Full time" },
      { label: "Part time", value: "Part time" },
      { label: "Weekend", value: "Weekends" },
      { label: "On Call", value: "On Call" },
      { label: "Live In", value: "Live In" },
    ],
    []
  );

  // Options for the license type select
  const licenseOptions = useMemo(
    () => [
      { label: "CNA", value: "CNA or NAC" },
      { label: "HCA", value: "HCA" },
      { label: "NAR", value: "NAR" },
      { label: "Companion", value: "None" },
    ],
    []
  );

  /**
   * Handler for the Search button.
   * Validates selections, shows toasts, and navigates.
   */
  const handleSearch = useCallback(async () => {
    if (selectedShifts.length === 0 && selectedLicenses.length === 0) {
      toast.warning(
        "Please select at least one shift type and caregivers licence to find good caregivers near you."
      );
      return;
    }

    setLoading(true);
    try {
      // persist intent & timestamp
      const prev = safeGet<StoredPrefs>(STORAGE_KEY) ?? {};
      safeSet(STORAGE_KEY, {
        ...prev,
        selectedShifts,
        selectedLicenses,
        updatedAt: new Date().toISOString(),
        lastSearchAt: new Date().toISOString(),
      } as StoredPrefs);

      const queryParams = new URLSearchParams({
        shifts: selectedShifts.join(","),
        licenses: selectedLicenses.join(","),
      }).toString();
      router.push(`/caregivers?${queryParams}`);
    } catch (error) {
      toast.error("An error occurred. Please try again.");
      console.error("Navigation error: ", error);
    } finally {
      setLoading(false);
    }
  }, [router, selectedShifts, selectedLicenses]);

  return (
    <>
      {/* Toast notifications (top center, with rich colors) */}
      <Toaster richColors position="top-center" />

      <div
        className="w-full mb-8 px-6 py-8 bg-white/80 rounded-2xl shadow-xl border border-gray-100
        backdrop-blur-lg transition-all"
        style={{
          background:
            "linear-gradient(100deg, rgba(248,250,252,0.98) 80%, rgba(190,230,255,0.15) 100%)",
        }}
      >
        <div className="grid items-end grid-cols-1 md:grid-cols-[1fr,1fr,auto,auto] gap-4">
          {/* Multi-Select: Shift Types */}
          <MultiSelect
            options={shiftOptions}
            onValueChange={setSelectedShifts}
            defaultValue={selectedShifts}
            placeholder="Select Shift Types"
            label="Select shift type"
            isAnimation={true}
            maxCount={5}
            className="rounded-xl border-gray-200 focus-within:ring-2 focus-within:ring-blue-500 transition"
          />

          {/* Multi-Select: License Types */}
          <MultiSelect
            options={licenseOptions}
            onValueChange={setSelectedLicenses}
            defaultValue={selectedLicenses}
            placeholder="Select Licenses"
            label="Select license"
            isAnimation={true}
            maxCount={4}
            className="rounded-xl border-gray-200 focus-within:ring-2 focus-within:ring-blue-500 transition"
          />

          {/* Search Button */}
          <div className="flex justify-center items-center">
            <Button
              onClick={handleSearch}
              disabled={
                loading ||
                selectedShifts.length === 0 ||
                selectedLicenses.length === 0
              }
             className="w-full lg:w-auto rounded-xl px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-300"
              aria-label="Search caregivers"
            >
              {loading ? (
                <>
                  <Search className="h-5 w-5 animate-spin" aria-hidden="true" />
                  <span>Loading…</span>
                </>
              ) : (
                <>
                  <Search className="h-5 w-5" aria-hidden="true" />
                  <span>Search</span>
                </>
              )}
            </Button>
          </div>

          {/* Concierge Button (secondary, unobtrusive) */}
          <div className="flex justify-center items-center">
            <Button
              type="button"
              variant="outline"
              className="flex items-center justify-center gap-2 w-full md:w-auto
                bg-white/80 hover:bg-blue-50 active:scale-98 border border-blue-200 text-blue-700
                font-semibold shadow-none rounded-xl px-5 py-3 transition-all ring-0
                focus-visible:ring-2 focus-visible:ring-blue-300"
              onClick={onConcierge}
              aria-label="Try Concierge Service"
            >
              <Sparkles className="h-5 w-5 text-blue-400" />
              <span className="font-semibold">Let Us Match For You</span>
            </Button>
          </div>
        </div>

        {/* Concierge Blurb (low-key, for those exploring) */}
        <div className="mt-5 flex items-center justify-center">
          <span className="text-sm lg:text-sm text-gray-600 text-center font-medium">
            Want help finding caregivers?{" "}
            <Link href="/jumpstart-hiring/apply">
              <span className="text-blue-600 font-semibold">Our team</span>
            </Link>{" "}
            will match you with 3 qualified candidates and schedule interviews—while you keep full access to browse on your own.
          </span>
        </div>
      </div>
    </>
  );
};

export default SearchBar;
