import { Skeleton } from "@/components/ui/skeleton";

const CrowdPostFormSkeleton = () => {
  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto">
        <div className="py-8 mx-6 px-4 md:px-10 xl:mx-0 rounded-lg shadow-lg bg-white space-y-6">
          {/* Header Section */}
          <div className="space-y-3">
            <Skeleton className="w-64 h-6 rounded" />
            <Skeleton className="w-80 h-4 rounded" />
          </div>

          {/* Form Fields */}
          <div className="space-y-6">
            {/* Job Title */}
            <div className="space-y-2">
              <Skeleton className="w-32 h-4 rounded" />
              <Skeleton className="w-full h-10 rounded" />
            </div>

            {/* MultiSelect Fields */}
            <div className="space-y-2">
              <Skeleton className="w-64 h-4 rounded" />
              <Skeleton className="w-full h-10 rounded" />
            </div>

            {/* Text Editor */}
            <div className="space-y-2">
              <Skeleton className="w-64 h-4 rounded" />
              <Skeleton className="w-full h-28 rounded" />
            </div>

            {/* Schedules */}
            <div className="space-y-2">
              <Skeleton className="w-64 h-4 rounded" />
              <Skeleton className="w-full h-10 rounded" />
            </div>

            {/* Input Fields */}
            <div className="space-y-2">
              <Skeleton className="w-32 h-4 rounded" />
              <Skeleton className="w-full h-10 rounded" />
            </div>

            {/* Address Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="w-32 h-4 rounded" />
                <Skeleton className="w-full h-10 rounded" />
              </div>
              <div className="space-y-2">
                <Skeleton className="w-32 h-4 rounded" />
                <Skeleton className="w-full h-10 rounded" />
              </div>
            </div>

            {/* Street Address */}
            <div className="space-y-2">
              <Skeleton className="w-32 h-4 rounded" />
              <Skeleton className="w-full h-10 rounded" />
            </div>

            {/* Email and Phone Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="w-32 h-4 rounded" />
                <Skeleton className="w-full h-10 rounded" />
              </div>
              <div className="space-y-2">
                <Skeleton className="w-32 h-4 rounded" />
                <Skeleton className="w-full h-10 rounded" />
              </div>
            </div>

            {/* Mobility Radio Buttons */}
            <div className="space-y-2">
              <Skeleton className="w-64 h-4 rounded" />
              <div className="flex gap-4">
                <Skeleton className="w-16 h-6 rounded" />
                <Skeleton className="w-16 h-6 rounded" />
              </div>
            </div>

            {/* Compensation Field */}
            <div className="space-y-2">
              <Skeleton className="w-32 h-4 rounded" />
              <Skeleton className="w-full h-10 rounded" />
            </div>

            {/* Submit Button */}
            <div>
              <Skeleton className="w-full h-12 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrowdPostFormSkeleton;
