"use client";
import React, { useState, useMemo, useCallback } from "react";
import { MultiSelect } from "@/components/multi-select";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Search, Loader2 } from "lucide-react";

interface SearchBarProps {
  availability?: string[];
  licenses?: string[];
}

const SearchBar: React.FC<SearchBarProps> = ({ availability, licenses }) => {
  const [selectedShifts, setSelectedShifts] = useState<string[]>(
    availability ?? ["Full time"]
  );
  const [selectedLicenses, setSelectedLicenses] = useState<string[]>(
    licenses ?? ["HCA"]
  );
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Memoize options so they aren't recreated on every render
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

      // Perform navigation; router.push returns a Promise
      router.push(`/caregivers?${queryParams}`);
    } catch (error) {
      console.error("Navigation error: ", error);
    } finally {
      // In practice, the page will unmount this component when navigation occurs,
      // so resetting loading isn't strictly necessary. But for safety:
      setLoading(false);
    }
  }, [router, selectedShifts, selectedLicenses]);

  return (
    <div className="w-full max-w-6xl mb-6 p-6 bg-white rounded-lg shadow-sm">
      <div className="grid items-end grid-cols-1 md:grid-cols-[1fr,1fr,auto] gap-4">
        {/* Multi-Select: Shift Types */}
        <MultiSelect
          options={shiftOptions}
          onValueChange={setSelectedShifts}
          defaultValue={selectedShifts}
          placeholder="Select Shift Types"
          label="Select shift type"
          isAnimation={false}
          maxCount={5}
        />

        {/* Multi-Select: License Types */}
        <MultiSelect
          options={licenseOptions}
          onValueChange={setSelectedLicenses}
          defaultValue={selectedLicenses}
          placeholder="Select Licenses"
          label="Select license"
          isAnimation={false}
          maxCount={4}
        />

        {/* Search Button */}
        <div className="flex justify-center items-center">
          <Button
            onClick={handleSearch}
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700 transition"
            aria-label="Search caregivers"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
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
      </div>
    </div>
  );
};

export default SearchBar;
