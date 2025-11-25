import React from "react";
import { X } from "lucide-react"; // Icon for removing selected chips

interface ChipInputProps {
  fields: string[]; // Array of available options (e.g., categories)
  selectedFields: string[]; // The currently selected chips
  setSelectedFields: (fields: string[]) => void; // Function to manage selected chips
}

const ChipInput: React.FC<ChipInputProps> = ({
  fields,
  selectedFields,
  setSelectedFields,
}) => {

  const handleToggleField = (field: string) => {
    if (selectedFields.includes(field)) {
      setSelectedFields(selectedFields.filter((f) => f !== field));
    } else {
      setSelectedFields([...selectedFields, field]);
    }
  };

  return (
    <div className="w-full">
      {/* Selected Chips Display */}
      <div className="flex flex-wrap gap-2 mb-3">
        {selectedFields.map((field) => (
          <div
            key={field}
            className="flex items-center bg-blue-500 text-white py-1 px-3 rounded-full"
          >
            <span className="mr-2 text-sm">{field}</span>
            <button
              onClick={() => handleToggleField(field)}
              className="text-white hover:text-gray-200"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* Button-based selection */}
      <div className="flex flex-wrap gap-2">
        {fields.map((field) => (
          <button
            key={field}
            onClick={() => handleToggleField(field)}
            className={`px-3 py-1 rounded-full text-sm transition ${
              selectedFields.includes(field)
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            {field}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ChipInput;
