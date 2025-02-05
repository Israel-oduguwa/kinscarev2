"use client";

import React, { useState } from "react";
import { MultiSelect } from "@/components/multi-select";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

const SearchBar = ({ availability, licenses }: any) => {
  const [selectedShifts, setSelectedShifts] = useState<string[]>(
    availability ? availability : ["Full time"]
  );
  const [selectedLicenses, setSelectedLicenses] = useState<string[]>(
    licenses ? licenses : ["HCA"]
  );
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
    <div className="w-full max-w-6xl mb-6 p-6 bg-white rounded-lg">
    <div className="grid items-end grid-cols-1 md:grid-cols-[1fr,1fr,auto] gap-4">
      {/* Multi-Select: Shift Types */}
      <MultiSelect
        options={shiftOptions}
        onValueChange={setSelectedShifts}
        defaultValue={selectedShifts}
        placeholder="Select Shift Types"
        label="Select shift"
        isAnimation={false}
        maxCount={5}
      />
  
      {/* Multi-Select: License Types */}
      <MultiSelect
        options={licenseOptions}
        onValueChange={setSelectedLicenses}
        label="Select shift type"
        defaultValue={selectedLicenses}
        placeholder="Select Licenses"
        isAnimation={false}
        maxCount={4}
      />
  
      {/* Search Button */}
      <div className="flex justify-center items-center">
        <Button
          className="bg-blue-600 text-white hover:bg-blue-700 transition"
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


// Use:
// "Select shift" and "Select shift type" for providers and "Select availability" and "Select license" for caregivers.
// Excel Health Careers Training
// 8:38 PM
// This caregiver URL, /start, really performed well in signing up caregivers.  You need to update it to mirror the new design.
// I will send you review of the /find-caregivers page.