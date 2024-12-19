import React from "react";
import { twMerge } from "tailwind-merge";

interface CheckboxProps {
  label: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  className?: string;
}

const MuiTailwindCheckbox: React.FC<CheckboxProps> = ({
  label,
  checked = false,
  onChange,
  className,
}) => {
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.target.checked);
    }
  };

  return (
    <label
      className={twMerge(
        "flex items-center space-x-2 cursor-pointer group",
        className
      )}
    >
      <div className="relative">
        {/* Hidden native checkbox */}
        <input
          type="checkbox"
          checked={checked}
          onChange={handleCheckboxChange}
          className="absolute w-0 h-0 opacity-0"
        />

        {/* Custom styled checkbox */}
        <div
          className={twMerge(
            "w-5 h-5 border-2 border-gray-400 rounded transition-all",
            checked
              ? "bg-blue-600 border-blue-600"
              : "bg-white border-gray-400 group-hover:border-blue-600"
          )}
        >
          {checked && (
            <svg
              className="text-white w-4 h-4 mx-auto"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
        </div>
      </div>

      {/* Label */}
      <span className="text-gray-700">{label}</span>
    </label>
  );
};

export default MuiTailwindCheckbox;
