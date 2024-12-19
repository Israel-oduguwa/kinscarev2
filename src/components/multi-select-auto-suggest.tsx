import React, { useState, useEffect, useRef } from "react";
import { XCircle, ChevronDown } from "lucide-react";
import { Badge } from "./ui/badge";

interface AutosuggestMultiSelectProps {
  options: string[];
  fetchOptions?: (query: string) => Promise<string[]>;
  maxCount?: number;
  placeholder: string;
  className?: string;
  initialValues?: string[]; // New prop for initial values
  onSelectionChange?: (selected: string[]) => void;
}

const AutosuggestMultiSelect: React.FC<AutosuggestMultiSelectProps> = ({
  options,
  fetchOptions,
  maxCount = 5,
  placeholder,
  className,
  initialValues = [], // Default is an empty array
  onSelectionChange,
}) => {
  const [query, setQuery] = useState("");
  const [selectedValues, setSelectedValues] = useState<string[]>(initialValues); // Use initial values
  const [filteredOptions, setFilteredOptions] = useState<string[]>(options);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [noOptionsFound, setNoOptionsFound] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialValues.length > 0) {
      setSelectedValues(initialValues); // Prefill with initial values
    }
  }, [initialValues]);

  useEffect(() => {
    const fetchNewOptions = async () => {
      if (query && fetchOptions) {
        setLoading(true);
        const data = await fetchOptions(query);
        setLoading(false);
        const mergedOptions = Array.from(new Set([...options, ...data]));
        setFilteredOptions(mergedOptions);
        setNoOptionsFound(mergedOptions.length === 0);
      } else {
        setFilteredOptions(options);
        setNoOptionsFound(false);
      }
    };
    fetchNewOptions();
  }, [query, fetchOptions, options]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const triggerSelectionChange = (updatedSelectedValues: string[]) => {
    if (onSelectionChange) {
      onSelectionChange(updatedSelectedValues);
    }
  };

  const handleSelect = (value: string) => {
    if (!selectedValues.includes(value) && selectedValues.length < maxCount) {
      const updatedSelectedValues = [...selectedValues, value];
      setSelectedValues(updatedSelectedValues);
      triggerSelectionChange(updatedSelectedValues);
      setQuery(""); 
    }
    setIsDropdownOpen(false);
  };

  const handleRemove = (value: string) => {
    const updatedSelectedValues = selectedValues.filter((item) => item !== value);
    setSelectedValues(updatedSelectedValues);
    triggerSelectionChange(updatedSelectedValues);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative flex flex-wrap items-center gap-2 border border-gray-300 rounded-md p-3">
        {selectedValues.map((value) => (
          <Badge
            key={value}
            className="flex items-center bg-transparent text-sm text-gray-800 border-foreground/10 hover:bg-transparent"
          >
            {value}
            <XCircle className="ml-2 cursor-pointer" onClick={() => handleRemove(value)} />
          </Badge>
        ))}

        <input
          type="text"
          value={query}
          onClick={() => setIsDropdownOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsDropdownOpen(true);
          }}
          placeholder={selectedValues.length < maxCount ? placeholder : ""}
          className="flex-1 min-w-[50px] bg-transparent focus:outline-none border-none"
          disabled={selectedValues.length >= maxCount}
        />
        <ChevronDown className="ml-2 text-muted-foreground cursor-pointer" />
      </div>

      {isDropdownOpen && (
        <div ref={dropdownRef} className="absolute z-10 mt-2 w-full bg-white border border-gray-100 rounded-lg shadow-md max-h-60 overflow-y-auto animate-fade-in">
          {loading ? (
            <p className="p-4 text-center">Loading...</p>
          ) : noOptionsFound ? (
            <p className="p-4 text-center">No options found</p>
          ) : (
            <ul>
              {filteredOptions
                .filter(
                  (option) =>
                    !selectedValues.includes(option) &&
                    option.toLowerCase().includes(query.toLowerCase())
                )
                .map((option) => (
                  <li
                    key={option}
                    onClick={() => handleSelect(option)}
                    className="cursor-pointer px-4 py-2 hover:bg-gray-100"
                  >
                    {option}
                  </li>
                ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default AutosuggestMultiSelect;
