import React from 'react';

const JobSkeleton: React.FC = () => (
  <div className="bg-white shadow-md rounded-lg p-6 my-4 w-full mx-auto animate-pulse">
    <div className="flex space-x-2 items-center mb-3">
      <div className="bg-gray-300 rounded-full w-12 h-12"></div>
      <div className="flex-1">
        <div className="bg-gray-300 h-4 rounded w-3/4 mb-2"></div>
        <div className="bg-gray-300 h-3 rounded w-1/2"></div>
      </div>
    </div>
    <div className="w-full mb-3">
      <div className="bg-gray-300 h-4 rounded w-full mb-2"></div>
      <div className="bg-gray-300 h-4 rounded w-5/6"></div>
    </div>
    <div className="w-full flex-wrap gap-4 flex mb-3">
      {[...Array(3)].map((_, index) => (
        <div
          key={index}
          className="bg-gray-300 rounded-lg py-1.5 px-3 w-24 h-6"
        ></div>
      ))}
    </div>
    <div className="w-full gap-4 items-center flex">
      <div className="bg-gray-300 h-3 rounded w-1/3"></div>
      <div className="bg-gray-300 h-3 rounded w-1/4"></div>
    </div>
  </div>
);

export default JobSkeleton;
