import React, { useState } from 'react';

const licensesOptions = [
  { id: 'license1', label: 'License 1' },
  { id: 'license2', label: 'License 2' },
  { id: 'license3', label: 'License 3' },
];

const scheduleOptions = [
  { id: 'fullTime', label: 'Full Time' },
  { id: 'partTime', label: 'Part Time' },
  { id: 'flexible', label: 'Flexible' },
];

const JobFilterUi = ({ onFilterChange }:any) => {
  const [selectedLicenses, setSelectedLicenses] = useState([]);
  const [selectedSchedules, setSelectedSchedules] = useState([]);
  const [minHours, setMinHours] = useState(8);
  const [maxHours, setMaxHours] = useState(50);

  const handleLicenseChange = (e:any) => {
    const value = e.target.value;
    setSelectedLicenses((prev:any) =>
      prev.includes(value) ? prev.filter((item: any) => item !== value) : [...prev, value]
    );
  };

  const handleScheduleChange = (e:any) => {
    const value = e.target.value;
    setSelectedSchedules((prev:any) =>
      prev.includes(value) ? prev.filter((item: any) => item !== value) : [...prev, value]
    );
  };

  const applyFilters = () => {
    onFilterChange({ licenses: selectedLicenses, schedule: selectedSchedules, minHours, maxHours });
  };

  return (
    <div className="bg-white p-4 shadow-md rounded-md">
      <h2 className="font-semibold text-lg mb-4">Filters</h2>
      <div className="mb-4">
        <h3 className="font-medium">Licenses</h3>
        {licensesOptions.map((option) => (
          <label key={option.id} className="block">
            <input
              type="checkbox"
              value={option.id}
              onChange={handleLicenseChange}
              className="mr-2"
            />
            {option.label}
          </label>
        ))}
      </div>
      <div className="mb-4">
        <h3 className="font-medium">Schedule</h3>
        {scheduleOptions.map((option) => (
          <label key={option.id} className="block">
            <input
              type="checkbox"
              value={option.id}
              onChange={handleScheduleChange}
              className="mr-2"
            />
            {option.label}
          </label>
        ))}
      </div>
      <div className="mb-4">
        <h3 className="font-medium">Minimum Hours</h3>
        <input
          type="number"
          min="8"
          max="50"
          value={minHours}
          onChange={(e) => setMinHours(Number(e.target.value))}
          className="border rounded-md p-2 w-full"
        />
        <h3 className="font-medium mt-4">Maximum Hours</h3>
        <input
          type="number"
          min="8"
          max="50"
          value={maxHours}
          onChange={(e) => setMaxHours(Number(e.target.value))}
          className="border rounded-md p-2 w-full"
        />
      </div>
      <button 
        onClick={applyFilters}
        className="bg-blue-500 text-white rounded px-4 py-2"
      >
        Apply Changes
      </button>
    </div>
  );
};

export default JobFilterUi;