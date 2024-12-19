import React from "react";
import { Control, Controller } from "react-hook-form";
import { MultiSelect as Select } from "@/components/multi-select"; // Your MultiSelect component

interface MultiSelectOption {
  value: string;
  label: string;
  icon?: React.ComponentType<any>; // Ensure icon is a React component
}

interface MultiSelectProps {
  name: string;
  control: Control<any>;
  isAnimation:boolean;
  options: MultiSelectOption[];
  defaultValue?: string[];
  placeholder?: string;
  maxCount?: number;
  rules?: any; // For validation rules (required, min, max, etc.)
}

const MultiSelectField: React.FC<MultiSelectProps> = ({
  name,
  control,
  options,
  defaultValue = [],
  isAnimation,
  placeholder = "Select options",
  maxCount,
  rules,
}, props) => {
  return (
    <Controller
      name={name}
      control={control}
      defaultValue={defaultValue}
      render={({ field: { onChange, value } }) => (
        <div>
          <Select
            options={options}
            onValueChange={(val: string[]) => onChange(val)}
            defaultValue={value}
            value={value} // Bind the value properly to ensure selections work
            placeholder={placeholder}
            {...props}
            // variant="inverted"
            maxCount={maxCount}
            isAnimation={isAnimation}
            // animation={2}
          />
        </div>
      )}
    />
  );
};

export default MultiSelectField;
