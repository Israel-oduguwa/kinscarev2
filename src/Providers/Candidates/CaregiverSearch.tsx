// components/CaregiverSearch.tsx
"use client";

import { useState, useContext } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Loader, Loader2, Search, X } from "lucide-react";
import { MultiSelect } from "@/components/multi-select";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { CandidatesContext } from "./CandidatesContext";
import { motion } from "framer-motion";

function CaregiverSearchFilters({ setIsOpen }: any) {
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

  const {
    selectedShifts,
    selectedLicenses,
    setSelectedShifts,
    loading,
    setSelectedLicenses,
    handleSearch,
  } = useContext(CandidatesContext)!;

  const router = useRouter();

  const onSearchClick = async () => {
    await handleSearch();
    if (!loading) {
      // Navigate to the candidates page without refreshing
      router.push("/provider/candidates/all");
      setIsOpen(false)
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-900 text-white rounded-lg shadow-md p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-4">
          <h1 className="text-lg md:text-xl font-bold tracking-tight">
            Search Caregivers
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
                className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-colors "
                onClick={onSearchClick}
                disabled={loading}
              >
                {loading ? <Loader2 className="animate-spin" /> : <Search />}{" "}
                Search
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
      <motion.div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
        initial={{ opacity: 0 }}
        animate={{ opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        style={{ pointerEvents: isOpen ? "auto" : "none" }}
      />

      <PopoverTrigger asChild>
        <button className="group relative z-50 flex items-center w-full max-w-sm px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full shadow-sm hover:border-blue-400 focus:outline-none transition-all duration-300 ease-out hover:shadow-md">
          <Search className="w-5 h-5 text-gray-400 shrink-0" />
          <span className="ml-3 text-gray-600 text-sm text-left truncate">
            Search for caregivers now
          </span>

          <motion.div
            className="absolute right-4 flex items-center"
            initial={false}
            animate={{
              opacity: isOpen ? 1 : 0,
              scale: isOpen ? 1 : 0.5,
              x: isOpen ? 0 : 20,
            }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <X
              className="w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors"
              onClick={() => setIsOpen(false)}
            />
          </motion.div>
        </button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[90vw] max-w-3xl p-6 bg-white/80 backdrop-blur-sm border border-gray-200 shadow-xl rounded-2xl"
        align="start"
        sideOffset={8}
        asChild
      >
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <CaregiverSearchFilters setIsOpen={setIsOpen} />
        </motion.div>
      </PopoverContent>
    </Popover>
  );
}
