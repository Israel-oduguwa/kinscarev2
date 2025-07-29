"use client";
import React, { useState, useMemo, useCallback } from "react";
import { MultiSelect } from "@/components/multi-select";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Search, Sparkles } from "lucide-react"; // Sparkles = ai-wand
import Link from "next/link";

interface SearchBarProps {
  availability?: string[];
  licenses?: string[];
  onConcierge?: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  availability,
  licenses,
}) => {
  const [selectedShifts, setSelectedShifts] = useState<string[]>(
    availability ?? ["Full time"]
  );
  const [selectedLicenses, setSelectedLicenses] = useState<string[]>(
    licenses ?? ["HCA"]
  );
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onConcierge = () =>{
    router.push('/jumpstart-hiring/apply')
  }
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

  const licenseOptions = useMemo(
    () => [
      { label: "CNA", value: "CNA or NAC" },
      { label: "HCA", value: "HCA" },
      { label: "NAR", value: "NAR" },
      { label: "Companion", value: "None" },
    ],
    []
  );

  const handleSearch = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        shifts: selectedShifts.join(","),
        licenses: selectedLicenses.join(","),
      }).toString();

      router.push(`/caregivers?${queryParams}`);
    } catch (error) {
      console.error("Navigation error: ", error);
    } finally {
      setLoading(false);
    }
  }, [router, selectedShifts, selectedLicenses]);

  return (
    <div
      className="w-full  mb-8 px-6 py-8 bg-white/80 rounded-2xl shadow-xl border border-gray-100
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
            disabled={loading}
            className="flex items-center justify-center gap-2 w-full md:w-auto
              bg-blue-600 text-white hover:bg-blue-700 active:scale-95 shadow-md
              transition-all rounded-xl px-7 py-3 text-base font-semibold"
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
        <span className="text-xs text-gray-600 text-center font-medium">
          Prefer a hands-off approach? <Link href="/jumpstart-hiring/apply"><span className="text-blue-600 font-semibold">Our Concierge Service</span></Link> matches you with 3 caregivers and schedules interviews—plus you keep 2 weeks of full access.
        </span>
      </div>
    </div>
  );
};

export default SearchBar;
