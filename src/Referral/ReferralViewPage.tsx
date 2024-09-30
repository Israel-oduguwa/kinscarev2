"use client";
import { Search } from "lucide-react";
import React, { useEffect, useState } from "react";
import ReferralCarousel from "./ReferralCarousel";

const professionsList = [
  "Nurse (RN)",
  "Nurse (LPN)",
  "Nurse (BSN)",
  "Respiratory Tech",
  "Surgical Tech",
  "Medical Assistant",
  "Pharmacist",
  "Physician Assistant",
  "Occupational Therapist",
  "Physical Therapist",
  "Radiologic Technologist",
  "Lab Technician",
  "Medical Coder",
  "Dental Hygienist",
  "Phlebotomist",
  "Paramedic",
  "Dietitian",
  "Chiropractor",
  "Veterinarian",
  "Health Administrator",
];

function ReferralViewPage() {
  const [profession, setProfession] = useState("");
  const [filteredProfessions, setFilteredProfessions] =
    useState<string[]>(professionsList);
  const [selectedProfession, setSelectedProfession] = useState("");
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [placeholderText, setPlaceholderText] = useState("Nurse (RN)");

  const [license, setLicense] = useState(""); // Holds the license input
  const [isProfessionComplete, setIsProfessionComplete] = useState(false); // Track if the first input is complete

  // Cycle through professions for the placeholder text
  useEffect(() => {
    const placeholders = [
      "Nurse (RN)",
      "Nurse (LPN)",
      "Respiratory Tech",
      "Medical Assistant",
      "Phlebotomist",
    ];

    let index = 0;
    const intervalId = setInterval(() => {
      setPlaceholderText(placeholders[index]);
      index = (index + 1) % placeholders.length;
    }, 2000);

    return () => clearInterval(intervalId);
  }, []);

  // Update filtered professions as the user types
  useEffect(() => {
    if (profession === "") {
      setFilteredProfessions(professionsList);
    } else {
      const filtered = professionsList.filter((profession) =>
        profession.toLowerCase().includes(profession.toLowerCase())
      );
      setFilteredProfessions(filtered);
    }
  }, [profession]);

  // Handle profession selection
  const handleSelectProfession = (profession: string) => {
    setSelectedProfession(profession);
    setProfession(profession);
    setIsDropdownVisible(false); // Close the dropdown after selection
    setIsProfessionComplete(true); // Mark profession selection as complete
  };

  // Handle search when Enter is pressed or button is clicked
  const handleSearch = () => {
    if (profession && !filteredProfessions.includes(profession)) {
      setSelectedProfession(profession);
      setIsDropdownVisible(false);
      setIsProfessionComplete(true); // Mark profession selection as complete
    }
  };

  return (
    <div>
      <div className="max-w-4xl mx-auto pt-6 sm:pt-10 px-2 sm:px-4 flex flex-col items-center">
        {/* First card */}
        <div className="bg-white border border-gray-100 shadow-md rounded-lg p-4 sm:p-6 relative z-10 w-full">
          <h1 className="text-2xl sm:text-3xl mb-4 font-semibold text-gray-800 text-center">
            I want to be a(an)
          </h1>
          <div className="relative w-full">
            {/* Input field */}
            <input
              type="text"
              value={profession}
              onChange={(e) => {
                setProfession(e.target.value);
                setIsDropdownVisible(true); // Show dropdown when user types
              }}
              onFocus={() => setIsDropdownVisible(true)} // Show dropdown on focus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
              placeholder={`e.g. ${placeholderText}`}
              className="w-full p-3 pr-10 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
            />

            {/* Search button */}
            <button
              onClick={handleSearch}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-700"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Dropdown for suggestions */}
            {isDropdownVisible && filteredProfessions.length > 0 && (
              <ul className="absolute z-10 bg-white border border-gray-300 rounded-lg shadow-lg w-full mt-1 max-h-60 overflow-y-auto">
                {filteredProfessions.map((profession) => (
                  <li
                    key={profession}
                    onClick={() => handleSelectProfession(profession)}
                    className="cursor-pointer px-4 py-2 hover:bg-gray-100 transition-colors"
                  >
                    {profession}
                  </li>
                ))}
              </ul>
            )}

            {/* Clear button to reset the input */}
            {profession && (
              <button
                onClick={() => setProfession("")}
                className="absolute right-10 top-3 text-gray-400 hover:text-gray-600"
              >
                &times;
              </button>
            )}
          </div>

          {/* Display selected profession */}
          {selectedProfession && (
            <div className="mt-2 p-2 text-xs text-blue-700 border border-blue-300 rounded-md bg-blue-50">
              You have selected: <strong>{selectedProfession}</strong>
            </div>
          )}

          <h2 className="text-base sm:text-lg mt-6 font-medium text-gray-700 mb-4 flex items-center">
            I have a(an)
            <input
              type="text"
              value={license}
              onChange={(e) => setLicense(e.target.value)}
              placeholder="e.g. Nursing, Medical"
              className="flex-grow mx-3 border-b border-gray-300 focus:outline-none focus:border-blue-500 placeholder-gray-400"
            />
            license
          </h2>
        </div>
      </div>
      <div className="">
        <ReferralCarousel />
      </div>
    </div>
  );
}

export default ReferralViewPage;
