"use client";

import React, { useState } from "react";
import { MultiSelect } from "@/components/multi-select";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

const SearchBar = () => {
  const [selectedShifts, setSelectedShifts] = useState<string[]>(["Full time"]);
  const [selectedLicenses, setSelectedLicenses] = useState<string[]>(["HCA"]);
  const router = useRouter();

  const shiftOptions = [
    { label: "Full time", value: "Full time" },
    { label: "Part time", value: "Part time" },
    { label: "Weekend", value: "Weekends" },
    { label: "On Call", value: "on Call" },
    { label: "Live In", value: "Live In" },
  ];

  const licenseOptions = [
    { label: "CNA", value: "CNA or NAC" },
    { label: "HCA", value: "HCA" },
    { label: "NAR", value: "NAR" },
    { label: "Companion", value: "None" },
  ];

  const handleSearch = () => {
    // Create a query string
    const queryParams = new URLSearchParams({
      shifts: selectedShifts.join(","),
      licenses: selectedLicenses.join(","),
    }).toString();

    // Redirect to the caregivers page with the query string
    router.push(`/caregivers?${queryParams}`);
  };

  return (
    <div className="w-full max-w-6xl p-6 bg-white rounded-lg ">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Multi-Select: Shift Types */}
        <MultiSelect
          options={shiftOptions}
          onValueChange={setSelectedShifts}
          defaultValue={selectedShifts}
          placeholder="Select Shift Types"
          isAnimation={false}
          maxCount={5}
        />

        {/* Multi-Select: License Types */}
        <MultiSelect
          options={licenseOptions}
          onValueChange={setSelectedLicenses}
          defaultValue={selectedLicenses}
          placeholder="Select Licenses"
          isAnimation={false}
          maxCount={4}
        />

        {/* Search Button */}
        <div className="flex justify-center">
          <Button
            className="w-full bg-blue-600 text-white hover:bg-blue-700 transition"
            onClick={handleSearch}
          >
           <Search /> Search
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
