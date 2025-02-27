// components/CaregiverSearch.tsx
"use client";
import { Input } from "@/components/ui/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Search, X } from "lucide-react";
import { useState } from "react";
// components/CaregiverSearchFilters.tsx
import { MultiSelect } from "@/components/multi-select";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// interface CaregiverSearchProps {
//   candidates: Candidates[];
//   selectedShifts: string[];
//   setSelectedShifts: (value: string[]) => void;
//   selectedLicenses: string[];
//   setSelectedLicenses: (value: string[]) => void;
//   handleSearch: () => void;
// }

interface CaregiverSearchFiltersProps {
  candidates: Candidates[];
  selectedShifts: string[];
  setSelectedShifts: (value: string[]) => void;
  selectedLicenses: string[];
  setSelectedLicenses: (value: string[]) => void;
  handleSearch: () => void;
}

// Shift and license options

function CaregiverSearchFilters() {
  const shiftOptions = [
    { label: "Full time", value: "Full time" },
    { label: "Part time", value: "Part time" },
    { label: "Weekend", value: "Weekends" },
    { label: "On Call", value: "On Call" },
    { label: "Live In", value: "Live In" },
  ];

  const licenseOptions = [
    { label: "CNA", value: "CNA or NAC" },
    { label: "HCA", value: "HCA" },
    { label: "NAR", value: "NAR" },
    { label: "Companion", value: "None" },
  ];

  // Filter state
  const [selectedShifts, setSelectedShifts] = useState<string[]>([]);
  const [selectedLicenses, setSelectedLicenses] = useState<string[]>([]);
  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-900 text-white rounded-lg shadow-md p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-4">
          <h1 className="text-lg md:text-xl font-bold tracking-tight">
            {/* {candidates.length} Caregivers Found */}
          </h1>
          <p className="text-gray-200 text-xs md:text-sm mt-1">
            Browse through professional caregivers available for your
            requirements. Use the filters below to refine your search.
          </p>
        </div>
        <div className="mb-1">
          <div className="w-full p-4 md:p-6 bg-white rounded-lg shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <MultiSelect
                options={shiftOptions}
                onValueChange={setSelectedShifts}
                defaultValue={selectedShifts}
                placeholder="Shift Types"
                maxCount={5}
                className="w-full"
              />
              <MultiSelect
                options={licenseOptions}
                onValueChange={setSelectedLicenses}
                defaultValue={selectedLicenses}
                placeholder="Licenses"
                maxCount={4}
                className="w-full"
              />
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-colors h-[3rem]"
                // onClick={handleSearch}
              >
                <Search className="mr-2 h-4 w-4" /> Search
              </Button>
            </div>
          </div>
        </div>
       
      </div>
    </div>
  );
}

export default function CaregiverSearch() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
    <PopoverTrigger asChild>
      <button
        className="flex items-center justify-between w-full max-w-md px-4 py-3 bg-white border border-gray-300 rounded-full shadow-sm hover:border-blue-400 focus:outline-none transition-colors"
        onClick={() => setIsOpen(true)}
      >
        <Search className="w-5 h-5 text-gray-400" />
        <span className="flex-grow ml-3 text-gray-600 text-sm text-left">
          Search for caregivers now
        </span>
        {isOpen && (
          <X
            className="w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors"
            onClick={() => setIsOpen(false)}
          />
        )}
      </button>
    </PopoverTrigger>
    <PopoverContent
      className="w-[95vw] md:w-[80vw] lg:w-[70vw] xl:w-[60vw] p-4"
      align="start"
      sideOffset={10}
    >
      <CaregiverSearchFilters />
    </PopoverContent>
  </Popover>
  
  );
}
