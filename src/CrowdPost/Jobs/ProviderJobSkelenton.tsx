import React from 'react';

const ProviderJobSkeleton: React.FC = () => (
  <div className="max-w-4xl mx-auto py-8 px-6 animate-pulse">
    {/* Header Skeleton */}
    <div className="bg-white shadow-lg border border-gray-100 rounded-2xl p-8 mb-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <div className="bg-gray-300 h-8 w-3/4 rounded-md"></div>
        <div className="bg-gray-300 h-10 w-20 rounded-md mt-4 lg:mt-0"></div>
      </div>
      <div className="flex gap-6 items-start">
        <div className="bg-gray-300 w-24 h-24 rounded-lg"></div>
        <div className="flex-1">
          <div className="bg-gray-300 h-6 w-1/2 rounded-md mb-4"></div>
          <div className="bg-gray-300 h-5 w-1/3 rounded-md"></div>
        </div>
      </div>
      <div className="flex gap-4 mt-6">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="bg-gray-300 h-6 w-24 rounded-full"></div>
        ))}
      </div>
    </div>

    {/* About Skeleton */}
    <div className="bg-white shadow-lg border border-gray-100 rounded-2xl p-8 mb-8">
      <div className="bg-gray-300 h-6 w-1/3 rounded-md mb-4"></div>
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="bg-gray-300 h-4 w-full rounded-md"></div>
        ))}
      </div>
    </div>

    {/* Additional Details Skeleton */}
    <div className="bg-white shadow-lg border border-gray-100 rounded-2xl p-8 mb-8">
      <div className="bg-gray-300 h-6 w-1/3 rounded-md mb-4"></div>
      <div className="bg-gray-300 h-4 w-1/2 rounded-md mb-4"></div>
      <div className="bg-gray-300 h-6 w-1/3 rounded-md mb-4"></div>
      <div className="bg-gray-300 h-4 w-1/2 rounded-md"></div>
    </div>
  </div>
);

export default ProviderJobSkeleton;
