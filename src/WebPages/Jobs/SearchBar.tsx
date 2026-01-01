"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { MultiSelect } from "@/components/multi-select";
import { Slider } from "@/components/ui/slider";
import { Loader2, Search } from "lucide-react";
import { useRouter } from "next/navigation";

const SearchBar: React.FC = ({}) => {
  const [filters, setFilters] = useState({
    schedule: ["Full time"] as string[],
    licenses: ["CNA or NAC"] as string[],
    minHours: 8,
  });
  const [loading, setLoading] = useState(false);
  const scheduleOptions = [
    "Full time",
    "Part time",
    "Weekends",
    "on Call",
    "Live In",
  ];
  const router = useRouter();
  const licenseOptions = ["CNA or NAC", "HCA", "NAR", "None"];

  const handleSearchJobs = () => {
    // Create a query string
    const queryParams = new URLSearchParams({
      schedule: filters.schedule.join(","), // Convert array to string
      licenses: filters.licenses.join(","), // Convert array to string
      minHours: filters.minHours.toString(), // Convert number to string
    }).toString();

    // Redirect to the caregivers page with the query string
    router.push(`/find-jobs?${queryParams}`);
  };

  return (
    <header className="bg-linear-to-r from-blue-600 to-blue-900 text-white rounded-lg shadow-md p-4 sm:p-6 mb-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-3">
          <h1 className="text-lg font-bold tracking-tight">Search for Jobs</h1>
          <p className="text-gray-200 text-xs md:text-sm">
            Use the filters below to refine your job search.
          </p>
        </div>

        {/* Filters Section */}
        <div className="w-full max-w-6xl p-4 sm:p-6 bg-white rounded-lg">
          <div className="grid grid-cols-1 items-center md:grid-cols-3 gap-4">
            {/* Schedule Multi-Select */}
            <MultiSelect
              options={scheduleOptions.map((option) => ({
                value: option,
                label: option,
              }))}
              onValueChange={(selected) =>
                setFilters((prev) => ({ ...prev, schedule: selected }))
              }
              defaultValue={filters.schedule}
              label="Select availability"
              placeholder="Schedule"
              maxCount={5}
            />

            {/* Licenses Multi-Select */}
            <MultiSelect
              options={licenseOptions.map((option) => ({
                value: option,
                label: option,
              }))}
              onValueChange={(selected) =>
                setFilters((prev) => ({ ...prev, licenses: selected }))
              }
              defaultValue={filters.licenses}
              label="Select license"
              placeholder="Licenses"
              maxCount={4}
            />

            {/* Min Hours Slider */}
            <div className="mt-4 flex justify-end">
              <Button
                className="w-full px-6 py-2 text-sm bg-blue-600 hover:bg-blue-700 transition"
                onClick={handleSearchJobs}
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="animate-spin" /> Searching...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Search /> Search
                  </span>
                )}
              </Button>
            </div>
            {/* <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-800">
                Min Hours
              </label>
              <Slider
                min={8}
                max={50}
                step={1}
                value={[filters.minHours]}
                onValueChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    minHours: value[0],
                  }))
                }
              />
              <div className="flex justify-between text-xs text-gray-600">
                <span>8 hrs</span>
                <span>{filters.minHours} hrs</span>
                <span>50 hrs</span>
              </div>
            </div> */}
          </div>

          {/* Search Button */}
          {/* <div className="mt-4 flex justify-end">
            <Button
              className="w-full px-6 py-2 text-sm bg-blue-600 hover:bg-blue-700 transition"
              onClick={handleSearchJobs}
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="animate-spin" /> Searching...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Search /> Search
                </span>
              )}
            </Button>
          </div> */}
        </div>
      </div>
    </header>
  );
};

export default SearchBar;
