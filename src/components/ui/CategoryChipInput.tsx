import React, { useState } from "react";
import { X } from "lucide-react"; // assuming ShadCN Popover is being used
import { Input } from "./input";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

interface ChipInputProps {
  fields: string[]; // Array of available options (e.g., categories)
  selectedFields: string[]; // The currently selected chips
  setSelectedFields: (fields: string[]) => void; // Function to manage selected chips
  placeholder?: string; // Optional placeholder text
}

const ChipInput: React.FC<ChipInputProps> = ({
  fields,
  selectedFields,
  setSelectedFields,
  placeholder = "Add item...",
}) => {
  const [inputValue, setInputValue] = useState("");

  const handleAddField = (field: string) => {
    if (!selectedFields.includes(field)) {
      setSelectedFields([...selectedFields, field]);
    }
    setInputValue(""); // Clear input after adding
  };

  const handleRemoveField = (fieldToRemove: string) => {
    setSelectedFields(selectedFields.filter((field) => field !== fieldToRemove));
  };

  return (
    <div className="w-full">
      {/* Display selected chips */}
      <div className="flex flex-wrap gap-2 mb-3">
        {selectedFields.map((field) => (
          <div
            key={field}
            className="flex items-center bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100 py-1 px-3 rounded-full"
          >
            <span className="mr-2 text-sm">{field}</span>
            <button
              onClick={() => handleRemoveField(field)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* Input field with Popover */}
      <Popover>
        <PopoverTrigger asChild>
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={placeholder}
            className="w-full dark:bg-gray-900 dark:text-gray-100"
            onKeyDown={(e) => {
              if (e.key === "Enter" && inputValue) {
                handleAddField(inputValue);
              }
            }}
          />
        </PopoverTrigger>

        <PopoverContent className="w-full p-2 bg-white dark:bg-gray-900 shadow-md">
          <div className="flex flex-wrap gap-2">
            {fields
              .filter(
                (field) =>
                  !selectedFields.includes(field) &&
                  field.toLowerCase().includes(inputValue.toLowerCase())
              )
              .map((field) => (
                <button
                  key={field}
                  onClick={() => handleAddField(field)}
                  className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-800 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  {field}
                </button>
              ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default ChipInput;
